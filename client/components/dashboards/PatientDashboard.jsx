import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../../artifacts/contractAddress.js";
import AccessControl from '../../artifacts/AccessControl.json';
import axios from "axios";
import { Upload, FileText, Share2, ShieldAlert, Copy, CheckCircle, Activity, User } from 'lucide-react';

const PatientDashboard = ({ user }) => {
    const { signer, walletAddress } = useAuth();

    // Tabs: 'records' | 'access'
    const [activeTab, setActiveTab] = useState('records');
    const [file, setFile] = useState(null);
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Access Control States
    const [accessAddress, setAccessAddress] = useState('');
    const [accessHash, setAccessHash] = useState('');
    const [granting, setGranting] = useState(false);
    const [status, setStatus] = useState('');

    // Fetch Records
    const fetchRecords = useCallback(async () => {
        if (!signer) return;
        setLoadingRecords(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const myHashes = await contract.getMyRecords();
            // Reverse to show newest first
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

    // Upload Function
    const handleUpload = async () => {
        if (!file || !signer) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post(`http://localhost:8080/api/records/upload?patientAddress=${walletAddress}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { hash } = res.data;
            if (!hash) throw new Error("IPFS upload failed: No hash returned from server");

            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

            if (!contract.uploadRecord) {
                console.error("Contract ABI:", AccessControl.abi);
                throw new Error("Function 'uploadRecord' not found in contract ABI. Please update client/artifacts/AccessControl.json");
            }

            const tx = await contract.uploadRecord(hash);
            await tx.wait();

            setFile(null);
            fetchRecords(); // Refresh list
            alert("Upload Successful!");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. See console.");
        } finally {
            setUploading(false);
        }
    };

    // Grant Access
    const handleGrantAccess = async () => {
        if (!signer || !accessAddress || !accessHash) {
            setStatus('Please fill in all fields.');
            return;
        }
        try {
            setGranting(true);
            setStatus('Signing transaction...');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const tx = await contract.grantAccess(accessAddress, accessHash);
            setStatus('Waiting for confirmation...');
            await tx.wait();
            setStatus(`Success! Access granted.`);
            setAccessAddress('');
            setAccessHash('');
        } catch (error) {
            setStatus('Error: ' + (error.reason || error.message));
        } finally {
            setGranting(false);
        }
    };

    // Revoke Access
    const handleRevokeAccess = async () => {
        if (!signer || !accessAddress || !accessHash) return;
        try {
            setGranting(true);
            setStatus('Signing revocation...');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const tx = await contract.revokeAccess(accessAddress, accessHash);
            await tx.wait();
            setStatus(`Success! Access revoked.`);
            setAccessAddress('');
            setAccessHash('');
        } catch (error) {
            setStatus('Error: ' + (error.reason || error.message));
        } finally {
            setGranting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-8 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
                        Patient Portal
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <User size={18} className="text-blue-400" />
                        Welcome back, {user.name}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Wallet Connected</p>
                        <p className="text-emerald-400 font-mono text-sm">{walletAddress.substring(0,6)}...{walletAddress.substring(38)}</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('records')}
                    className={`pb-3 px-4 text-sm font-medium transition-all ${activeTab === 'records' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                    My Medical Records
                </button>
                <button
                    onClick={() => setActiveTab('access')}
                    className={`pb-3 px-4 text-sm font-medium transition-all ${activeTab === 'access' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                    Share & Permissions
                </button>
            </div>

            {/* TAB: MY RECORDS */}
            {activeTab === 'records' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                    {/* Upload Section */}
                    <div className="glass-panel p-8 rounded-2xl border-dashed border-2 border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                                <Upload size={32} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Upload New Medical Record</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-md">
                                Upload prescriptions, lab reports, or X-rays. Files are encrypted and stored on IPFS.
                            </p>
                            <div className="flex gap-4">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 text-slate-300"
                                />
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !file}
                                    className="btn-primary px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Upload to Blockchain'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Records Grid */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-emerald-400" />
                            Your Records History
                        </h3>

                        {loadingRecords ? (
                            <div className="text-center text-slate-500 py-12">Loading blockchain data...</div>
                        ) : records.length === 0 ? (
                            <div className="text-center text-slate-500 py-12 italic">No records found. Upload your first one above.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {records.map((hash, index) => (
                                    <div key={index} className="glass-panel p-5 rounded-xl group hover:border-blue-400/50 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <FileText size={20} className="text-blue-300" />
                                            </div>
                                            <span className="text-xs font-mono text-slate-500">#{records.length - index}</span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">IPFS Hash</p>
                                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded text-xs font-mono text-slate-300">
                                                <span className="truncate flex-1">{hash}</span>
                                                <button onClick={() => copyToClipboard(hash)} className="hover:text-white transition-colors">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => window.open(`http://localhost:8080/api/records/${hash}?patientAddress=${walletAddress}&providerAddress=${walletAddress}`, '_blank')}
                                            className="w-full btn-secondary py-2 rounded-lg text-sm hover:bg-blue-500/20 hover:text-blue-300"
                                        >
                                            View Document
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
                    <div className="glass-panel p-8 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Share2 className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Manage Permissions</h3>
                                <p className="text-slate-400 text-sm">Grant or revoke doctor access to specific files.</p>
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
                                    className="glass-input w-full p-3 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Record IPFS Hash</label>
                                <input
                                    type="text"
                                    placeholder="Qm..."
                                    value={accessHash}
                                    onChange={(e) => setAccessHash(e.target.value)}
                                    className="glass-input w-full p-3 rounded-xl"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    *Copy the hash from your "My Medical Records" tab.
                                </p>
                            </div>

                            {status && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${status.includes('Success') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {status.includes('Success') ? <CheckCircle size={18} /> : <Activity size={18} />}
                                    <span className="text-sm">{status}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={handleGrantAccess}
                                    disabled={granting}
                                    className="btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                                >
                                    {granting ? 'Processing...' : <><CheckCircle size={18} /> Grant Access</>}
                                </button>

                                <button
                                    onClick={handleRevokeAccess}
                                    disabled={granting}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <ShieldAlert size={18} /> Revoke Access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;