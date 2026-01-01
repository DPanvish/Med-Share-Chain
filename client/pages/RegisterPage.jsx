import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { ethers } from "ethers";
import AccessControl from '../artifacts/AccessControl.json';
import { CONTRACT_ADDRESS } from "../artifacts/contractAddress.js";
import { User, Building2, ShieldCheck, Loader2, Wallet, ArrowRight, Activity, AlertTriangle } from 'lucide-react';

const RegisterPage = () => {
    const { walletAddress, signer } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [role, setRole] = useState("patient");
    const [hospital, setHospital] = useState("");

    // Detailed Loading States
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0=Idle, 1=Signing, 2=Mining, 3=Database
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;
        if (role === 'provider' && !hospital.trim()) return;

        setLoading(true);
        setError(null);
        setStep(1); // Step 1: Wallet Signature

        try {
            if (!signer) throw new Error("Wallet not connected");

            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

            // 1. Blockchain Transaction
            let tx;
            if (role === "patient") {
                tx = await contract.registerPatient(name);
            } else {
                tx = await contract.registerProvider(name, hospital);
            }

            setStep(2); // Step 2: Mining
            await tx.wait();

            // 2. Database Sync
            setStep(3); // Step 3: API Call
            await api.registerUser({
                walletAddress,
                name,
                role,
                hospital: role === "provider" ? hospital : undefined,
            });

            // Success!
            navigate("/dashboard");

        } catch (err) {
            console.error("Registration failed:", err);

            // Handle "Zombie State" (On-chain success, DB failure)
            if (step === 3) {
                setError("Blockchain transaction successful, but Database sync failed. Please refresh and try again (the contract handles duplicates).");
            } else if (err.code === 'ACTION_REJECTED') {
                setError("You rejected the transaction in MetaMask.");
            } else {
                setError("Registration failed: " + (err.reason || err.message));
            }
            setStep(0);
        } finally {
            setLoading(false);
        }
    }

    // Helper to get button text based on current step
    const getButtonText = () => {
        switch(step) {
            case 1: return "Check MetaMask to Sign...";
            case 2: return "Confirming on Blockchain...";
            case 3: return "Finalizing Profile...";
            default: return "Complete Registration";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">

            {/* Background Decoration Blobs */}
            <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="glass-panel w-full max-w-lg p-8 rounded-3xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 border border-white/10 bg-slate-900/60 backdrop-blur-xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 transform transition-transform hover:scale-110 duration-300">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Complete Profile</h2>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-3">
                        <Wallet size={14} />
                        <span>Connected:</span>
                        <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                        </span>
                    </div>
                </div>

                {/* Status / Error Messages */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Progress Bar (Only visible during loading) */}
                {loading && (
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between text-xs text-blue-300 font-medium px-1">
                            <span>Progress</span>
                            <span>{step}/3</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                style={{ width: `${(step / 3) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-center text-xs text-slate-400 animate-pulse pt-1">
                            {step === 1 && "Waiting for signature..."}
                            {step === 2 && "Waiting for block confirmation..."}
                            {step === 3 && "Syncing with database..."}
                        </p>
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
                                disabled={loading}
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
                                disabled={loading}
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
                            disabled={loading}
                            className="glass-input w-full p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
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
                                disabled={loading}
                                className="glass-input w-full p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                required
                                placeholder="e.g. City General Hospital"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 group transition-all duration-300 ${
                            loading
                                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-emerald-500/25'
                        }`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        )}
                        <span>{getButtonText()}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;