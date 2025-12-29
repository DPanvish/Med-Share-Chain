import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../../artifacts/contractAddress.js";
import AccessControl from '../../artifacts/AccessControl.json';
import { Search, FileText, User, Calendar, Clock, Inbox, ShieldCheck, Activity } from 'lucide-react';

const ProviderDashboard = ({ user }) => {
    const { signer, walletAddress } = useAuth();
    const [sharedRecords, setSharedRecords] = useState([]);
    const [loadingInbox, setLoadingInbox] = useState(false);
    const [searchAddress, setSearchAddress] = useState("");
    const [patientRecords, setPatientRecords] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [msg, setMsg] = useState("");

    // Fetch "Shared With Me" (Inbox)
    useEffect(() => {
        const fetchSharedRecords = async () => {
            if (!signer) return;
            setLoadingInbox(true);
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
                const records = await contract.getProviderSharedRecords(walletAddress);

                const formatted = records.map(r => ({
                    patient: r.patient,
                    hash: r.recordHash,
                    date: new Date(Number(r.sharedAt) * 1000).toLocaleDateString(),
                    time: new Date(Number(r.sharedAt) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setSharedRecords(formatted.reverse());
            } catch (error) {
                console.error("Error fetching inbox:", error);
            } finally {
                setLoadingInbox(false);
            }
        };
        fetchSharedRecords();
    }, [signer, walletAddress]);

    // Manual Search
    const handleSearch = async () => {
        if (!signer || !searchAddress) return;
        setLoadingSearch(true);
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
            console.error("Search Error:", err);
            setMsg('Error: ' + (err.reason || err.message));
        } finally {
            setLoadingSearch(false);
        }
    }

    const viewRecord = (hash, targetPatientAddress) => {
        const patient = targetPatientAddress || searchAddress;
        const url = `http://localhost:8080/api/records/${hash}?patientAddress=${patient}&providerAddress=${walletAddress}`;
        window.open(url, '_blank');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-8 rounded-2xl mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                        Provider Portal
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Activity size={18} className="text-emerald-500" />
                        {user.hospital} <span className="text-slate-600">|</span> Dr. {user.name}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <ShieldCheck size={16} /> Verified Provider
                    </span>
                </div>
            </header>

            {/* INBOX SECTION */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Inbox className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Incoming Records</h2>
                        <p className="text-slate-400 text-sm">Patient files shared directly with you</p>
                    </div>
                </div>

                {loadingInbox ? (
                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
                ) : sharedRecords.length === 0 ? (
                    <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
                        <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No records in your inbox yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sharedRecords.map((record, index) => (
                            <div key={index} className="glass-panel rounded-xl p-5 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/20 px-2 py-1 rounded-lg">
                                        <Calendar size={12} /> {record.date}
                                        <span className="text-slate-600">|</span>
                                        <Clock size={12} /> {record.time}
                                    </div>
                                    <div className="bg-blue-500/10 text-blue-400 p-1.5 rounded-lg">
                                        <FileText size={16} />
                                    </div>
                                </div>

                                <div className="mb-4 space-y-1 relative z-10">
                                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                                        <User size={10} /> Patient Address
                                    </label>
                                    <p className="text-sm font-mono text-slate-200 truncate" title={record.patient}>
                                        {record.patient}
                                    </p>
                                </div>

                                <button
                                    onClick={() => viewRecord(record.hash, record.patient)}
                                    className="w-full btn-primary py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 relative z-10"
                                >
                                    View Document
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-12"></div>

            {/* MANUAL SEARCH SECTION */}
            <div className="glass-panel p-8 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Search className="text-emerald-400" size={20} />
                            Global Search
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Access patient records by manually entering their wallet address.
                            <span className="block mt-2 text-xs text-slate-500 italic">
                                *Requires prior permission from the patient.
                            </span>
                        </p>
                    </div>

                    <div className="md:w-2/3 space-y-6">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={searchAddress}
                                onChange={(e) => setSearchAddress(e.target.value)}
                                placeholder="0x..."
                                className="glass-input w-full rounded-xl px-4 py-3 font-mono text-sm"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loadingSearch}
                                className="btn-secondary px-6 py-3 rounded-xl whitespace-nowrap"
                            >
                                {loadingSearch ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {msg && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {msg}
                            </div>
                        )}

                        {patientRecords.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                                {patientRecords.map((hash, index) => (
                                    <div key={index} className="bg-black/20 border border-white/5 rounded-lg p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-slate-500">Record #{index + 1}</span>
                                            <FileText size={14} className="text-slate-400" />
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono truncate">{hash}</p>
                                        <button
                                            onClick={() => viewRecord(hash, searchAddress)}
                                            className="text-xs bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white py-2 rounded transition-colors"
                                        >
                                            Open File
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProviderDashboard;