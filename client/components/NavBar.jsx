import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Wallet, LogOut, Menu, X, Copy, Check } from 'lucide-react';

const Navbar = () => {
    const { walletAddress, disconnectWallet, connectWallet } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Hide navbar on specific routes if needed (e.g., 404 page)
    const hideOnRoutes = [];
    if (hideOnRoutes.includes(location.pathname)) return null;

    // Helper: Copy Address to Clipboard
    const copyAddress = async () => {
        if (!walletAddress) return;
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex justify-between items-center backdrop-blur-xl border border-white/10 shadow-xl shadow-black/10">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                        <Activity size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                        MedShareChain
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                            location.pathname === '/' ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                    >
                        Home
                    </Link>

                    {walletAddress ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/dashboard"
                                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                                    location.pathname.includes('dashboard') ? 'text-emerald-400' : 'text-slate-300'
                                }`}
                            >
                                Dashboard
                            </Link>

                            {/* Wallet Badge with Copy Feature */}
                            <button
                                onClick={copyAddress}
                                className="group flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 rounded-full border border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all cursor-pointer"
                                title="Click to Copy Address"
                            >
                                <div className={`w-2 h-2 rounded-full ${copied ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'}`}></div>
                                <span className="font-mono text-xs text-slate-300 group-hover:text-white transition-colors">
                                    {copied ? "Copied!" : `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`}
                                </span>
                                {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity"/>}
                            </button>

                            <button
                                onClick={disconnectWallet}
                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                title="Disconnect Wallet"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="btn-primary px-5 py-2 rounded-lg text-sm flex items-center gap-2 font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                            <Wallet size={16} /> Connect Wallet
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-20 left-4 right-4 glass-panel rounded-xl p-4 flex flex-col gap-2 md:hidden animate-in slide-in-from-top-4 fade-in z-40 border border-slate-700 shadow-2xl bg-slate-900/95 backdrop-blur-xl">
                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={`p-3 rounded-lg text-sm font-medium ${location.pathname === '/' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                        Home
                    </Link>

                    {walletAddress && (
                        <>
                            <Link
                                to="/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className={`p-3 rounded-lg text-sm font-medium ${location.pathname.includes('dashboard') ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5'}`}
                            >
                                Dashboard
                            </Link>

                            <div className="h-px bg-slate-700/50 my-1"></div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                                <span className="text-xs font-mono text-slate-400">
                                    {walletAddress.substring(0, 8)}...{walletAddress.substring(36)}
                                </span>
                                <button onClick={copyAddress} className="text-slate-400 hover:text-white">
                                    {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                                </button>
                            </div>

                            <button
                                onClick={() => { disconnectWallet(); setIsMenuOpen(false); }}
                                className="p-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 text-left flex items-center gap-2"
                            >
                                <LogOut size={16}/> Disconnect Wallet
                            </button>
                        </>
                    )}

                    {!walletAddress && (
                        <button
                            onClick={() => { connectWallet(); setIsMenuOpen(false); }}
                            className="btn-primary w-full py-3 rounded-lg text-center font-bold mt-2"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;