import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { Wallet, LogOut, Copy, Check, Loader2, ShieldCheck } from 'lucide-react';

const WalletConnect = () => {
    const { walletAddress, connectWallet, disconnectWallet } = useAuth();
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const result = await connectWallet();
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError("Connection cancelled or failed");
        } finally {
            setIsConnecting(false);
        }
    };

    const copyToClipboard = () => {
        if (!walletAddress) return;
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full mx-auto border border-white/10 shadow-2xl bg-slate-900/40 relative overflow-hidden group">

            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {walletAddress ? (
                // STATE: CONNECTED
                <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <ShieldCheck size={32} className="text-emerald-400" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">
                            Wallet Connected
                        </h2>
                        <p className="text-slate-400 text-sm">You are securely logged in.</p>
                    </div>

                    <div
                        onClick={copyToClipboard}
                        className="group/address cursor-pointer bg-black/30 hover:bg-black/50 border border-white/5 hover:border-emerald-500/30 rounded-xl p-3 flex items-center justify-between transition-all"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Address</span>
                            <span className="text-sm font-mono text-emerald-400">
                                {walletAddress.substring(0, 8)}...{walletAddress.substring(36)}
                            </span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg group-hover/address:bg-emerald-500/20 transition-colors">
                            {copied ? <Check size={16} className="text-emerald-400"/> : <Copy size={16} className="text-slate-400 group-hover/address:text-emerald-400"/>}
                        </div>
                    </div>

                    <button
                        onClick={disconnectWallet}
                        className="w-full bg-slate-800 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} /> Disconnect Session
                    </button>
                </div>
            ) : (
                // STATE: DISCONNECTED
                <div className="space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                        <Wallet size={32} className="text-blue-400" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Connect to MedShare
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Link your Ethereum wallet to access your encrypted medical history securely.
                        </p>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center justify-center gap-2 relative z-10">
                            {isConnecting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Wallet size={20} />
                                    <span>Connect MetaMask</span>
                                </>
                            )}
                        </div>
                        {/* Shine Effect */}
                        {!isConnecting && <div className="absolute top-0 -left-full w-1/2 h-full bg-white/20 skew-x-[25deg] group-hover:animate-shine" />}
                    </button>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <p className="text-red-400 text-xs font-medium">{error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
export default WalletConnect;