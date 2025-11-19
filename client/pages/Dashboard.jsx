import React, {useEffect} from 'react'
import {useAuth} from "../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
    const {walletAddress, disconnectWallet} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!walletAddress){
            navigate("/");
        }
    }, [walletAddress, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 text-white">

            {/* Navbar */}
            <nav className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex justify-center items-center">
                <div className="font-bold text-xl text-emerald-400">MedShare Chain</div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                        {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                    </span>

                    <button
                        onClick={disconnectWallet}
                        className="text-sm text-red-400 hover:text-red-300 font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="p-10">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Placeholder Card 1 */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:shadow-emerald-900/20 transition-all">
                        <h3 className="text-xl font-semibold mb-2 text-emerald-400">My Records</h3>
                        <p className="text-slate-400">View and manage your medical history stored on IPFS.</p>
                    </div>

                    {/* Placeholder Card 2 */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:shadow-emerald-900/20 transition-all">
                        <h3 className="text-xl font-semibold mb-2 text-blue-400">Upload New</h3>
                        <p className="text-slate-400">Securely upload new documents to the blockchain.</p>
                    </div>

                    {/* Placeholder Card 3 */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:shadow-emerald-900/20 transition-all">
                        <h3 className="text-xl font-semibold mb-2 text-purple-400">Manage Access</h3>
                        <p className="text-slate-400">Grant or revoke doctor permissions via smart contracts.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
export default Dashboard
