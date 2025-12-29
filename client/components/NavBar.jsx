import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, LogOut, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { walletAddress, disconnectWallet } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Don't show Navbar on Login/Register pages if you prefer a clean look there
    // Remove this check if you WANT the navbar everywhere
    const hideOnRoutes = ['/login', '/register'];
    if (hideOnRoutes.includes(location.pathname)) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
            <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Activity size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        MedShareChain
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className={`text-sm font-medium hover:text-emerald-400 transition-colors ${location.pathname === '/' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        Home
                    </Link>

                    {walletAddress ? (
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className={`text-sm font-medium hover:text-emerald-400 transition-colors ${location.pathname === '/dashboard' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                Dashboard
                            </Link>

                            {/* Wallet Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-full border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="font-mono text-xs text-slate-300">
                                    {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                                </span>
                            </div>

                            <button
                                onClick={disconnectWallet}
                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                title="Disconnect"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary px-5 py-2 rounded-lg text-sm flex items-center gap-2">
                            <Wallet size={16} /> Connect Wallet
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-slate-300 hover:text-white"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-20 left-4 right-4 glass-panel rounded-xl p-4 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-4">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Home</Link>
                    {walletAddress && (
                        <>
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white py-2">Dashboard</Link>
                            <button onClick={disconnectWallet} className="text-red-400 text-left py-2">Disconnect Wallet</button>
                        </>
                    )}
                    {!walletAddress && (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-primary py-3 rounded-lg text-center">Connect Wallet</Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;