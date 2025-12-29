import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import WalletConnect from "../components/WalletConnect.jsx";
import { api } from "../services/api.js";
import { Activity, ShieldCheck, Database, Lock, Loader2 } from 'lucide-react';

const HomePage = () => {
    const { walletAddress } = useAuth();
    const navigate = useNavigate();
    const [checkingUser, setCheckingUser] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            if (walletAddress) {
                setCheckingUser(true);
                try {
                    const user = await api.getUser(walletAddress);
                    if (user) {
                        navigate("/dashboard");
                    } else {
                        navigate("/register");
                    }
                } catch (err) {
                    console.error("Error checking user:", err);
                } finally {
                    setCheckingUser(false);
                }
            }
        };

        checkUserStatus();
    }, [walletAddress, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

            {/* Atmospheric Background Blobs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>

            {checkingUser ? (
                // Loading State (Glass Card)
                <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <Loader2 size={48} className="text-emerald-400 animate-spin" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Verifying Identity</h3>
                        <p className="text-slate-400 text-sm">Checking blockchain records...</p>
                    </div>
                </div>
            ) : (
                // Main Content Grid
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Left Column: Hero Text */}
                    <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Decentralized System
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                            Secure Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                                Health Data
                            </span>
                            <br/> on the Chain.
                        </h1>

                        <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                            The future of Electronic Health Records. You own your data.
                            You control the permissions. Powered by Ethereum & IPFS security.
                        </p>

                        {/* Feature Icons */}
                        <div className="flex gap-6 pt-4">
                            <FeatureIcon icon={<ShieldCheck />} label="Secure" />
                            <FeatureIcon icon={<Database />} label="IPFS Storage" />
                            <FeatureIcon icon={<Lock />} label="Encrypted" />
                        </div>
                    </div>

                    {/* Right Column: Wallet Connect Card */}
                    <div className="animate-in slide-in-from-right-8 duration-700 delay-100">
                        <div className="glass-panel p-1 rounded-3xl shadow-2xl shadow-emerald-900/20 border border-white/10 relative group">
                            {/* Glow Effect behind card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                            <div className="bg-slate-900/80 backdrop-blur-xl rounded-[22px] p-8 md:p-10 text-center border border-white/5 relative">
                                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                                    <Activity size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                                <p className="text-slate-400 mb-8 text-sm">Connect your MetaMask wallet to access your dashboard or register a new identity.</p>

                                {/* Your Existing WalletConnect Component */}
                                <div className="transform transition-transform hover:scale-[1.02]">
                                    <WalletConnect />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper Component for the small icons below text
const FeatureIcon = ({ icon, label }) => (
    <div className="flex flex-col items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors cursor-default">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className="text-xs font-medium">{label}</span>
    </div>
);

export default HomePage;