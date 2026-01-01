import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../../artifacts/contractAddress.js";
import AccessControl from '../../artifacts/AccessControl.json';
import { Search, FileText, User, Calendar, Clock, Inbox, ShieldCheck, Activity, RefreshCw, Lock, ExternalLink } from 'lucide-react';

const ProviderDashboard = ({ user }) => {
    const { signer, walletAddress } = useAuth();

    // State
    const [sharedRecords, setSharedRecords] = useState([]);
    const [loadingInbox, setLoadingInbox] = useState(false);

    // Search State
    const [searchAddress, setSearchAddress] = useState("");
    const [patientRecords, setPatientRecords] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [msg, setMsg] = useState("");

    // -------------------------------------------
    // 1. SURGICAL SYNC: INBOX FETCHER
    // -------------------------------------------
    const fetchInbox = useCallback(async (isManual = false) => {
        if (!signer) return;
        setLoadingInbox(true);

        try {
            // We use the signer (connected wallet) as the source of truth
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

            // Direct Blockchain Call (Bypassing any potential indexer delays)
            const records = await contract.getProviderSharedRecords(walletAddress);

            const formatted = records.map(r => ({
                patient: r.patient,
                hash: r.recordHash,
                // Convert BigInt to Number for dates
                date: new Date(Number(r.sharedAt) * 1000).toLocaleDateString(),
                time: new Date(Number(r.sharedAt) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawTimestamp: Number(r.sharedAt) // For sorting
            }));

            // Sort by newest first
            setSharedRecords(formatted.sort((a, b) => b.rawTimestamp - a.rawTimestamp));

            if (isManual) alert("Inbox synced with blockchain!");

        } catch (error) {
            console.error("Surgical Sync Failed:", error);
        } finally {
            setLoadingInbox(false);
        }
    }, [signer, walletAddress]);

    // Initial Load
    useEffect(() => {
        fetchInbox();
    }, [fetchInbox]);


    // -------------------------------------------
    // 2. SEARCH LOGIC
    // -------------------------------------------
    const handleSearch = async () => {
        if (!signer || !searchAddress) return;
        if (!ethers.isAddress(searchAddress)) {
            setMsg("Invalid Ethereum Address");
            return;
        }

        setLoadingSearch(true);
        setMsg('');
        setPatientRecords([]);

        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const records = await contract.getPatientRecords(searchAddress);

            if (records.length === 0) {
                setMsg('No records found for this patient.');
            } else {
                setPatientRecords(Array.from(records).reverse()); // Show newest first
            }
        } catch (err) {
            console.error("Search Error:", err);
            setMsg('Error: ' + (err.reason || err.message));
        } finally {
            setLoadingSearch(false);
        }
    }

    // -------------------------------------------
    // 3. SECURE VIEW LOGIC
    // -------------------------------------------
    const viewRecord = async (hash, targetPatientAddress) => {
        const patient = targetPatientAddress || searchAddress;
        if(!patient) return;

        // Visual feedback that we are initializing the secure handshake
        const width = 800;
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const url = `http://localhost:8080/api/records/${hash}?patientAddress=${patient}&providerAddress=${walletAddress}`;

        window.open(url, 'SecureViewer', `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-8 rounded-2xl mb-8 bg-slate-900/50 border border-slate-700">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                        Provider Portal
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Activity size={18} className="text-emerald-500" />
                        {user.hospital || "General Hospital"} <span className="text-slate-600">|</span> Dr. {user.name}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                            <ShieldCheck size={16} /> Verified Node
                        </span>
                    </div>
                </div>
            </header>

            {/* INBOX SECTION */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Inbox className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Incoming Records</h2>
                            <p className="text-slate-400 text-sm">Real-time patient data stream</p>
                        </div>
                    </div>

                    {/* SURGICAL SYNC BUTTON */}
                    <button
                        onClick={() => fetchInbox(true)}
                        disabled={loadingInbox}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                        title="Force sync with Blockchain"
                    >
                        <RefreshCw size={16} className={loadingInbox ? "animate-spin" : ""} />
                        <span className="text-sm font-medium">Sync</span>
                    </button>
                </div>

                {loadingInbox && sharedRecords.length === 0 ? (
                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
                ) : sharedRecords.length === 0 ? (
                    <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-dashed border-slate-700">
                        <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No records in your inbox yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sharedRecords.map((record, index) => (
                            <div key={index} className="glass-panel rounded-xl p-5 hover:border-emerald-500/50 transition-all group relative overflow-hidden bg-slate-800/40 border border-slate-700">
                                {/* Glow Effect */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800">
                                        <Calendar size={10} /> {record.date}
                                        <span className="text-slate-700">|</span>
                                        <Clock size={10} /> {record.time}
                                    </div>
                                    <div className="bg-blue-500/10 text-blue-400 p-1.5 rounded-lg">
                                        <FileText size={16} />
                                    </div>
                                </div>

                                <div className="mb-4 space-y-1 relative z-10">
                                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                                        <User size={10} /> Patient ID
                                    </label>
                                    <p className="text-sm font-mono text-slate-200 truncate" title={record.patient}>
                                        {record.patient}
                                    </p>
                                </div>

                                <button
                                    onClick={() => viewRecord(record.hash, record.patient)}
                                    className="w-full btn-primary py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 relative z-10 hover:shadow-lg transition-shadow"
                                >
                                    View Document <ExternalLink size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-12"></div>

            {/* MANUAL SEARCH SECTION */}
            <div className="glass-panel p-8 rounded-2xl border border-slate-700 bg-slate-900/40">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Search className="text-emerald-400" size={20} />
                            Global Search
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Retrieve records from any patient on the network.
                            <br/>
                            <span className="inline-flex items-center gap-1 mt-3 text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-500/20">
                                <Lock size={10} /> Access requires patient permission
                            </span>
                        </p>
                    </div>

                    <div className="md:w-2/3 space-y-6">
                        <div className="flex gap-3">
                            <div className="relative w-full">
                                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={searchAddress}
                                    onChange={(e) => setSearchAddress(e.target.value)}
                                    placeholder="Patient Wallet Address (0x...)"
                                    className="glass-input w-full rounded-xl pl-12 pr-4 py-3 font-mono text-sm bg-slate-950 border border-slate-700 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loadingSearch}
                                className="btn-secondary px-6 py-3 rounded-xl whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                            >
                                {loadingSearch ? 'Searching...' : 'Search Network'}
                            </button>
                        </div>

                        {msg && (
                            <div className={`p-3 rounded-lg text-sm border ${msg.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                {msg}
                            </div>
                        )}

                        {patientRecords.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                                {patientRecords.map((hash, index) => (
                                    <div key={index} className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 hover:border-emerald-500/30 transition-colors group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono text-slate-500">Record #{patientRecords.length - index}</span>
                                            <FileText size={14} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="bg-black/30 p-2 rounded border border-white/5">
                                            <p className="text-[10px] text-slate-400 font-mono truncate">{hash}</p>
                                        </div>
                                        <button
                                            onClick={() => viewRecord(hash, searchAddress)}
                                            className="text-xs bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 py-2 rounded transition-all font-medium"
                                        >
                                            Decrypt & Open
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