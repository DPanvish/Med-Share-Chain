import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { ethers } from "ethers";
import AccessControl from '../artifacts/AccessControl.json';
import { CONTRACT_ADDRESS } from "../artifacts/contractAddress.js";
import { User, Building2, ShieldCheck, Loader2, Wallet, ArrowRight, Activity, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
    const { walletAddress, signer } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [role, setRole] = useState("patient");
    const [hospital, setHospital] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatus("Initialising registration...")

        try {
            if (!signer) {
                throw new Error("Wallet not connected");
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

            setStatus("Step 1/3: Please sign transaction in MetaMask...");

            let tx;
            if (role === "patient") {
                tx = await contract.registerPatient(name);
            } else {
                tx = await contract.registerProvider(name, hospital);
            }

            setStatus('Step 2/3: Waiting for block confirmation...');
            await tx.wait();

            setStatus('Step 3/3: Saving profile to database...');
            await api.registerUser({
                walletAddress,
                name,
                role,
                hospital: role === "provider" ? hospital : undefined,
            });

            navigate("/dashboard");
        } catch (err) {
            console.error("Registration failed:", err);
            if (err.code === 'ACTION_REJECTED') {
                setError("You rejected the transaction in MetaMask.");
            } else {
                setError("Registration failed: " + (err.reason || err.message));
            }
        } finally {
            setLoading(false);
            setStatus("")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background Decoration Blobs */}
            <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>

            <div className="glass-panel w-full max-w-lg p-8 rounded-3xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Complete Profile</h2>
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <Wallet size={14} />
                        <span>Connected:</span>
                        <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                        </span>
                    </div>
                </div>

                {/* Status / Error Messages */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                        <Activity className="shrink-0" size={18} />
                        {error}
                    </div>
                )}

                {status && (
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 animate-pulse">
                        <Loader2 className="animate-spin shrink-0" size={18} />
                        {status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Role Selection */}
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole("patient")}
                                className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-2 ${
                                    role === "patient"
                                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50 scale-[1.02]"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-emerald-500/50"
                                }`}
                            >
                                <User size={24} />
                                <span className="font-semibold">Patient</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('provider')}
                                className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-2 ${
                                    role === 'provider'
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50 scale-[1.02]"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-blue-500/50"
                                }`}
                            >
                                <Building2 size={24} />
                                <span className="font-semibold">Doctor</span>
                            </button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="glass-input w-full p-3 rounded-xl"
                            required
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    {/* Hospital Input (Conditional) */}
                    {role === "provider" && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Hospital / Organization</label>
                            <input
                                type="text"
                                value={hospital}
                                onChange={(e) => setHospital(e.target.value)}
                                className="glass-input w-full p-3 rounded-xl"
                                required
                                placeholder="e.g. City General Hospital"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>Processing Transaction...</>
                        ) : (
                            <>Complete Registration <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
export default RegisterPage;