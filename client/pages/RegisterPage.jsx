import React, {useState} from 'react'
import {useAuth} from "../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {api} from "../services/api.js";

const RegisterPage = () => {
    const {walletAddress} = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [role, setRole] = useState("patient");
    const [hospital, setHospital] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try{
            await api.registerUser({
                walletAddress,
                name,
                role,
                hospital: role === "provider" ? hospital : undefined,
            });

            navigate("/dashboard");
        }catch(err){
            console.error(err);
            setError("Registration failed. Please try again later.");
        }finally{
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md">
                <h2 className="text-3xl font-bold text-emerald-400 mb-2">Complete Profile</h2>
                <p className="text-slate-400 mb-8">
                    Wallet Connected: <span className="font-mono text-xs bg-slate-900 px-2 py-1 rounded">{walletAddress}</span>
                </p>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-emerald-500 focus:outline-none"
                            required
                            placeholder="ex. John Doe"
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole("patient")}
                                className={`p-3 rounded border text-center transition-all cursor-pointer ${
                                    role === "patient"
                                        ? "bg-emerald-600 text-white border-emerald-500"
                                        : "bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-500"
                                }`}
                            >
                                Patient
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('provider')}
                                className={`p-3 rounded border text-center transition-all cursor-pointer ${
                                    role === 'provider'
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-blue-500'
                                }`}
                            >
                                Healthcare Provider
                            </button>
                        </div>
                    </div>

                    {/* Hospital Input (Only if Provider) */}
                    {role === "provider" && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Hospital / Organization</label>
                            <input
                                type="text"
                                value={hospital}
                                onChange={(e) => setHospital(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
                                required
                                placeholder="ex. City General Hospital"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Creating Profile..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </div>
    )
}
export default RegisterPage
