import React, {useEffect, useState} from 'react';
import {useAuth} from "../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {api} from "../services/api.js";
import PatientDashboard from "../components/dashboards/PatientDashboard.jsx";
import ProviderDashboard from "../components/dashboards/ProviderDashboard.jsx";
import Navbar from "../components/NavBar.jsx";
import { Loader2 } from 'lucide-react';

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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-emerald-400">
                <Loader2 size={48} className="animate-spin" />
                <p className="text-lg font-medium animate-pulse">Verifying Blockchain Identity...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 text-white">
            <Navbar />

            {/* Render the correct dashboard based on role */}
            <main className="p-4 md:p-6 lg:p-10">
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