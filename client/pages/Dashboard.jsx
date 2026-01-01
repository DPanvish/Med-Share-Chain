import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import PatientDashboard from "../components/dashboards/PatientDashboard.jsx";
import ProviderDashboard from "../components/dashboards/ProviderDashboard.jsx";
import Navbar from "../components/NavBar.jsx";
import { Loader2, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

const Dashboard = () => {
    const { walletAddress, disconnectWallet } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!walletAddress) {
                navigate("/");
                return;
            }

            try {
                // reset error on new fetch
                setError(null);

                const userData = await api.getUser(walletAddress);

                if (!userData) {
                    // Wallet connected, but no account in DB -> Go to Register
                    navigate("/register");
                } else {
                    setUser(userData);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user profile. The server might be down.");
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [walletAddress, navigate]);

    // ------------------------------------------------------------------
    // STATE: LOADING
    // ------------------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4 border border-white/5 bg-slate-900/50 backdrop-blur-md">
                    <Loader2 size={48} className="text-emerald-400 animate-spin" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Verifying Identity</h3>
                        <p className="text-slate-400 text-sm font-mono">Syncing with Blockchain & Database...</p>
                    </div>
                </div>
            </div>
        )
    }

    // ------------------------------------------------------------------
    // STATE: ERROR (API Down / Connection Fail)
    // ------------------------------------------------------------------
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="glass-panel p-8 rounded-2xl max-w-md border border-red-500/20 bg-slate-900/50">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
                    <p className="text-slate-400 mb-6">{error}</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Retry
                        </button>
                        <button
                            onClick={disconnectWallet}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Disconnect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // STATE: SUCCESS
    // ------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 relative selection:bg-emerald-500/30">

            {/* Background Atmosphere */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                <Navbar />

                <main className="pt-24 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto pb-12">
                    {user?.role === "patient" ? (
                        <PatientDashboard user={user} />
                    ) : user?.role === "provider" ? (
                        <ProviderDashboard user={user} />
                    ) : (
                        // Fallback for invalid role
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-white">Unknown Role</h2>
                            <p className="text-slate-400">Your account exists but has an invalid role type.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
export default Dashboard;