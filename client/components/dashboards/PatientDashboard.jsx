import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../../artifacts/contractAddress.js";
import AccessControl from '../../artifacts/AccessControl.json';
import axios from "axios";
import { Upload, FileText, Share2, ShieldAlert, Copy, CheckCircle, Activity, User, Loader2, ArrowRight } from 'lucide-react';

const PatientDashboard = ({ user }) => {
    const { signer, walletAddress } = useAuth();

    // Tabs & Data
    const [activeTab, setActiveTab] = useState('records');
    const [file, setFile] = useState(null);
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Upload State Machine (0: Idle, 1: IPFS Upload, 2: Wallet Sign, 3: Confirming)
    const [uploadStep, setUploadStep] = useState(0);
    const [statusMsg, setStatusMsg] = useState('');

    // Access Control States
    const [accessAddress, setAccessAddress] = useState('');
    const [accessHash, setAccessHash] = useState(''); // Target hash for sharing
    const [granting, setGranting] = useState(false);
    const [accessStatus, setAccessStatus] = useState('');

    // Fetch Records
    const fetchRecords = useCallback(async () => {
        if (!signer) return;
        setLoadingRecords(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const myHashes = await contract.getMyRecords();
            setRecords(Array.from(myHashes).reverse());
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoadingRecords(false);
        }
    }, [signer]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // Enhanced Upload Function
    const handleUpload = async () => {
        if (!file || !signer) return;

        try {
            // STEP 1: IPFS Upload
            setUploadStep(1);
            setStatusMsg("Encrypting & Uploading to IPFS...");

            const formData = new FormData();
            formData.append('file', file);

            // Note: Ensure your backend handles the 'patientAddress' query correctly
            const res = await axios.post(`http://localhost:8080/api/records/upload?patientAddress=${walletAddress}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { hash } = res.data;
            if (!hash) throw new Error("Server failed to return IPFS Hash");

            // STEP 2: Wallet Signature
            setUploadStep(2);
            setStatusMsg("Please sign the transaction in your wallet...");

            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const tx = await contract.uploadRecord(hash);

            // STEP 3: Blockchain Confirmation
            setUploadStep(3);
            setStatusMsg("Transaction sent! Waiting for block confirmation...");

            await tx.wait();

            // SUCCESS: Optimistic Update (Show it immediately without fetching)
            setRecords(prev => [hash, ...prev]);
            setFile(null);
            setUploadStep(0);
            setStatusMsg("Upload Complete!");

            // Clear success message after 3s
            setTimeout(() => setStatusMsg(''), 3000);

        } catch (error) {
            console.error("Upload failed:", error);
            setUploadStep(0);
            setStatusMsg(`Error: ${error.reason || error.message || "Upload Failed"}`);
        }
    };

    // Helper: Share specific file (Switch tab and pre-fill)
    const openShareTab = (hash) => {
        setAccessHash(hash);
        setActiveTab('access');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGrantAccess = async () => {
        if (!signer || !accessAddress || !accessHash) return;
        try {
            setGranting(true);
            setAccessStatus('Signing transaction...');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const tx = await contract.grantAccess(accessAddress, accessHash);
            setAccessStatus('Waiting for confirmation...');
            await tx.wait();
            setAccessStatus('Success! Access granted.');
            setAccessAddress('');
            setAccessHash('');
        } catch (error) {
            setAccessStatus('Error: ' + (error.reason || error.message));
        } finally {
            setGranting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // ideally use a toast here instead of alert
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen text-slate-200">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-8 rounded-2xl bg-slate-900/50 border border-slate-700">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
                        Patient Portal
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <User size={18} className="text-blue-400" />
                        {user.name}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Connected Wallet</span>
                    <span className="text-emerald-400 font-mono text-sm bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-500/30">
                        {walletAddress.substring(0,6)}...{walletAddress.substring(38)}
                    </span>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-slate-700/50 pb-1">
                <button
                    onClick={() => setActiveTab('records')}
                    className={`pb-3 px-2 text-sm font-medium transition-all relative ${
                        activeTab === 'records' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    My Medical Records
                    {activeTab === 'records' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('access')}
                    className={`pb-3 px-2 text-sm font-medium transition-all relative ${
                        activeTab === 'access' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Share & Permissions
                    {activeTab === 'access' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
                </button>
            </div>

            {/* CONTENT AREA */}
            <main>
                {/* TAB: MY RECORDS */}
                {activeTab === 'records' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                        {/* Upload Card */}
                        <div className="glass-panel p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500/30 transition-colors bg-slate-900/30">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className={`p-4 rounded-full mb-4 transition-all ${uploadStep > 0 ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                                    {uploadStep > 0 ? <Loader2 className="animate-spin text-amber-400" size={32}/> : <Upload size={32} className="text-blue-400" />}
                                </div>

                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {uploadStep === 0 ? "Upload New Medical Record" : "Processing Upload..."}
                                </h3>

                                {/* Dynamic Status Text */}
                                {uploadStep > 0 ? (
                                    <div className="space-y-2 mb-6 w-full max-w-md">
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-500"
                                                style={{width: `${uploadStep * 33}%`}}
                                            />
                                        </div>
                                        <p className="text-sm text-blue-300 animate-pulse">{statusMsg}</p>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm mb-6 max-w-md">
                                        Securely upload prescriptions and reports. Files are encrypted via AES before IPFS storage.
                                    </p>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        disabled={uploadStep > 0}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 text-slate-300 cursor-pointer"
                                    />
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploadStep > 0 || !file}
                                        className={`btn-primary px-6 py-2 rounded-full font-medium transition-all ${
                                            uploadStep > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                                        }`}
                                    >
                                        {uploadStep > 0 ? 'Busy...' : 'Upload'}
                                    </button>
                                </div>

                                {statusMsg && uploadStep === 0 && (
                                    <p className={`mt-4 text-sm ${statusMsg.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {statusMsg}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Records List */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-emerald-400" />
                                Your Records History
                            </h3>

                            {loadingRecords ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <p>Syncing with Blockchain...</p>
                                </div>
                            ) : records.length === 0 ? (
                                <div className="text-center text-slate-500 py-12 italic border border-slate-800 rounded-xl bg-slate-900/20">
                                    No records found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {records.map((hash, index) => (
                                        <div key={index} className="glass-panel p-5 rounded-xl border border-slate-700 hover:border-blue-400/30 transition-all bg-slate-800/40 group relative overflow-hidden">

                                            {/* Top Row */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <FileText size={20} className="text-blue-400" />
                                                </div>
                                                <button
                                                    onClick={() => openShareTab(hash)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors tooltip"
                                                    title="Share this file"
                                                >
                                                    <Share2 size={18} />
                                                </button>
                                            </div>

                                            {/* Hash Display */}
                                            <div className="mb-4">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Encrypted IPFS Hash</p>
                                                <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded text-xs font-mono text-slate-300 border border-slate-800">
                                                    <span className="truncate flex-1">{hash}</span>
                                                    <button onClick={() => copyToClipboard(hash)} className="hover:text-white transition-colors">
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => window.open(`http://localhost:8080/api/records/${hash}?patientAddress=${walletAddress}&providerAddress=${walletAddress}`, '_blank')}
                                                className="w-full py-2.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                                            >
                                                View Document <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: ACCESS CONTROL */}
                {activeTab === 'access' && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8">
                        <div className="glass-panel p-8 rounded-2xl border border-slate-700 bg-slate-900/40">
                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <Share2 className="text-purple-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Manage Permissions</h3>
                                    <p className="text-slate-400 text-sm">Grant doctor access to your private files.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 block">Doctor's Wallet Address</label>
                                    <input
                                        type="text"
                                        placeholder="0x..."
                                        value={accessAddress}
                                        onChange={(e) => setAccessAddress(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 block">Record IPFS Hash</label>
                                    <input
                                        type="text"
                                        placeholder="Qm..."
                                        value={accessHash}
                                        onChange={(e) => setAccessHash(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                    />
                                </div>

                                {/* Access Status Banner */}
                                {accessStatus && (
                                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                                        accessStatus.includes('Success')
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : accessStatus.includes('Error')
                                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                                    }`}>
                                        {accessStatus.includes('Success') ? <CheckCircle size={20} /> : <Loader2 size={20} className={accessStatus.includes('Error') ? '' : 'animate-spin'} />}
                                        <span className="text-sm font-medium">{accessStatus}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={handleGrantAccess}
                                        disabled={granting}
                                        className="btn-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                                    >
                                        <CheckCircle size={18} /> Grant Access
                                    </button>

                                    <button
                                        onClick={() => { /* Handle Revoke */ }}
                                        disabled={granting}
                                        className="bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShieldAlert size={18} /> Revoke Access
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientDashboard;