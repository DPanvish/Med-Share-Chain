import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { Wallet, LogOut, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const WalletConnect = () => {
    const { walletAddress, connectWallet, disconnectWallet } = useAuth();
    const [error, setError] = useState(null);
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);
        setError(null);
        try {
            const result = await connectWallet();
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setConnecting(false);
        }
    };

    const truncateAddress = (address) => {
        return `${address.slice(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // VIEW: CONNECTED
    if (walletAddress) {
        return (
            <div className="w-full space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-full">
                            <CheckCircle size={20} className="text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Connected</p>
                            <p className="text-white font-mono text-sm">{truncateAddress(walletAddress)}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={disconnectWallet}
                    className="w-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-slate-300 hover:text-red-400 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={18} /> Disconnect Wallet
                </button>
            </div>
        );
    }

    // VIEW: DISCONNECTED
    return (
        <div className="w-full">
            <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full btn-primary py-4 rounded-xl text-lg font-bold shadow-xl flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {connecting ? (
                    <span className="animate-pulse">Connecting...</span>
                ) : (
                    <>
                        <Wallet size={20} />
                        Connect MetaMask
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform opacity-70" />
                    </>
                )}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm text-left">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default WalletConnect;