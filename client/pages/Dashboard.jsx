import React, {useEffect, useState} from 'react'
import {useAuth} from "../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {api} from "../services/api.js";
import PatientDashboard from "../components/dashboards/PatientDashboard.jsx";
import ProviderDashboard from "../components/dashboards/ProviderDashboard.jsx";

const Dashboard = () => {
    const {walletAddress, disconnectWallet} = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if(!walletAddress){
                navigate("/");
                return;
            }

            try{
                const userData = await api.getUser(walletAddress);

                if(!userData){
                    navigate("/register");
                }else{
                    setUser(userData);
                }
            }catch(err){
                console.error("Error fetching user data:", err);
            }finally{
                setLoading(false);
            }
        }

        fetchUser();
    }, [walletAddress, navigate]);

    if(loading){
        return(
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 animate-pulse">
                Loading Profile...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Navbar */}
            <nav className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-center items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="flex-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-500 bg-cip-text text-transparent">
                        MedShare Chain
                    </div>

                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase tracking-wider">
                        {user?.role}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400 font-mono">
                            {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                        </p>
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Render the correct dashboard based on role */}
            <main className="p-6 md:p-10">
                {user?.role === "patient" ? (
                    <PatientDashboard user={user} />
                ) : (
                    <ProviderDashboard user={user} />
                )}
            </main>
        </div>
    )
}
export default Dashboard
