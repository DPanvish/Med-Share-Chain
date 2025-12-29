import React, {useEffect, useState} from 'react'
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
    const [sharedRecords, setSharedRecords] = useState([]);
    const [loadingInbox, setLoadingInbox] = useState(false);

    useEffect(() => {
        const fetchSharedRecords = async() => {
            if(!signer){
                return;
            }

            setLoadingInbox(true);

            try{
                const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

                const records = await contract.getProviderSharedRecords(walletAddress);

                const formatted = records.map(record => ({
                    patient: record.patient,
                    hash: record.recordHash,
                    date: new Date(Number(record.sharedAt) * 1000).toLocaleString()
                }));

                setSharedRecords(formatted.reverse());
            }catch(err){
                console.error("Error fetching shared records:", err);
            }finally{
                setLoadingInbox(false);
            }
        };

        fetchSharedRecords();
    }, [signer, walletAddress]);
    

    const handleSearch = async() => {

        if (!signer || !searchAddress) {
            console.log("Missing signer or address");
            return;
        }

        setLoading(true);
        setMsg('');
        setPatientRecords([]);

        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const records = await contract.getPatientRecords(searchAddress);

            if (records.length === 0) {
                setMsg('No records found for this patient.');
            } else {
                setPatientRecords(Array.from(records));
            }

        } catch (err) {
            console.error("CRITICAL ERROR:", err);
            setMsg('Error: ' + (err.reason || err.message));
        } finally {
            setLoading(false);
        }
    }

    const viewRecord = (hash, targetPatientAddress) => {
        const patient = targetPatientAddress || searchAddress;
        const url = `http://localhost:8080/api/records/${hash}?patientAddress=${patient}&providerAddress=${walletAddress}`;
        window.open(url, '_blank');
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Provider Portal</h1>
                <p className="text-slate-400 mt-1">{user.hospital} | Dr. {user.name}</p>
            </header>

            {/* --- SHARED WITH ME (INBOX) --- */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                    <span>📨</span> Inbox: Records Shared With You
                </h3>

                {loadingInbox ? (
                    <div className="text-slate-400 animate-pulse">Loading your inbox...</div>
                ) : sharedRecords.length === 0 ? (
                    <div className="text-slate-500 italic p-4 bg-slate-900 rounded border border-slate-700">
                        No records have been shared with you yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sharedRecords.map((record, index) => (
                            <div key={index} className="bg-slate-900 border border-slate-600 rounded-xl p-5 hover:border-emerald-500 transition-all shadow-md relative group">
                                <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <span className="text-emerald-500 text-xs font-bold border border-emerald-500 px-2 py-1 rounded">SHARED</span>
                                </div>

                                <div className="mb-3">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Shared Date</p>
                                    <p className="text-white text-sm">{record.date}</p>
                                </div>

                                <div className="mb-3">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Patient Address</p>
                                    <p className="text-blue-300 font-mono text-xs truncate bg-blue-500/10 p-1 rounded" title={record.patient}>
                                        {record.patient}
                                    </p>
                                </div>

                                <button
                                    onClick={() => viewRecord(record.hash, record.patient)}
                                    className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2 rounded-lg font-medium shadow-lg transition-all"
                                >
                                    Open Document
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MANUAL SEARCH (BACKUP) --- */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Manual Patient Search</h3>
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
                        className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {msg && <p className="text-slate-400 mt-4 text-sm">{msg}</p>}

                {/* Manual Search Results */}
                {patientRecords.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {patientRecords.map((hash, index) => (
                            <div key={index} className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded mb-2 inline-block">Record #{index + 1}</span>
                                <p className="text-slate-500 text-xs font-mono truncate mb-4">{hash}</p>
                                <button
                                    onClick={() => viewRecord(hash, searchAddress)} // Use searchAddress here
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium"
                                >
                                    View Document
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
export default ProviderDashboard
