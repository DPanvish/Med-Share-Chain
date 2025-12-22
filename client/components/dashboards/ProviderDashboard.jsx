import React, {useState} from 'react'
import {useAuth} from "../../context/AuthContext.jsx";
import {ethers} from "ethers";
import {CONTRACT_ADDRESS} from "../../artifacts/contractAddress.js";
import AccessControl from '../../artifacts/AccessControl.json';

const ProviderDashboard = ({user}) => {
    const { signer, walletAddress } = useAuth();
    const [searchAddress, setSearchAddress] = useState("");
    const [patientRecords, setPatientRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleSearch = async() => {
        if(!signer || !searchAddress){
            setLoading(true);
            setMsg("");
            setPatientRecords([]);

            try{
                const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

                const records = await contract.getPatientRecords(searchAddress);

                if(records.length === 0){
                    setMsg("No records found for this patient.");
                }else{
                    setPatientRecords(Array.from(records));
                }
            }catch(err){
                console.error("Error fetching patient records:", err);
                setMsg("Error fetching patient records. Ensure address is valid and patient has registered with the app.");
            }finally{
                setLoading(false);
            }
        }
    }

    const viewRecord = (hash) => {
        const url = `http://localhost:8080/api/records/${hash}?patientAddress=${searchAddress}&providerAddress=${walletAddress}`;
        window.open(url, '_blank');
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Provider Portal</h1>
                <p className="text-slate-400 mt-1">{user.hospital} | Dr. {user.name}</p>
            </header>

            {/* Search Section */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-8">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Find Patient Records</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        placeholder="Enter Patient Wallet Address (0x...)"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
                    >
                        {loading ? 'Searching...' : 'Search Records'}
                    </button>
                </div>
                {msg && <p className="text-slate-400 mt-4 text-sm">{msg}</p>}
            </div>

            {/* Results Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patientRecords.map((hash, index) => (
                    <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded font-mono">Record #{index + 1}</span>
                        </div>
                        <p className="text-slate-400 text-sm font-mono truncate mb-6" title={hash}>
                            {hash}
                        </p>
                        <button
                            onClick={() => viewRecord(hash)}
                            className="w-full bg-slate-700 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            View Document
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default ProviderDashboard
