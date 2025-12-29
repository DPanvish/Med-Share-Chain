import React, {useEffect, useState} from 'react'
import {useAuth} from "../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {api} from "../services/api.js";
import PatientDashboard from "../components/dashboards/PatientDashboard.jsx";
import ProviderDashboard from "../components/dashboards/ProviderDashboard.jsx";
import Navbar from "../components/NavBar.jsx";

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
            <Navbar />

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
