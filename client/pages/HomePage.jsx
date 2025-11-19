import React, {useEffect, useState} from 'react'
import {useAuth} from "../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import WalletConnect from "../components/WalletConnect.jsx";
import {api} from "../services/api.js";

const HomePage = () => {
    const {walletAddress} = useAuth();
    const navigate = useNavigate();
    const [checkingUser, setCheckingUser] = useState(false);

    useEffect(() => {
        const checkUserStatus = async() => {
            if(walletAddress){
                setCheckingUser(true);

                try{
                    const user = api.getUser(walletAddress);

                    if(user){
                        navigate("/dashboard");
                    }else{
                        navigate("/register");
                    }
                }catch(err){
                    console.error("Error checking user:", err);
                }finally {
                    setCheckingUser(false);
                }
            }
        };

        checkUserStatus();
    }, [walletAddress, navigate]);


    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            {checkingUser ? (
                <div className="text-emerald-400 text-xl animate-pulse">Checking Identity...</div>
            ) : (
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text */}
                    <div className="space-y-6">
                        <h1 className="text-5xl font-extrabold leading-tight">
                            Secure Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                            Health Data
                        </span>
                            <br/> in the Chain.
                        </h1>

                        <p className="text-slate-400 text-lg">
                            A Decentralized Electronic Health Record System.
                            You own your data. You control the access.
                        </p>
                    </div>

                    {/* Right Column: Wallet Connect Card */}
                    <div>
                        <WalletConnect />
                    </div>
                </div>
            )}
        </div>
    )
}
export default HomePage
