import React, {useCallback, useEffect, useState} from 'react'
import { ethers } from "ethers";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";

// Import Artifacts
import AccessControl from "../../artifacts/AccessControl.json";
import { CONTRACT_ADDRESS} from "../../artifacts/contractAddress.js";

const PatientDashboard = ({user}) => {
    const { signer, walletAddress } = useAuth();
    const [activeTab, setActiveTab] = useState("records"); // records | upload | access
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState("");
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    const fetchRecords = useCallback(async () => {
        if(!signer){
            return;
        }

        setLoadingRecords(true);

        try{
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

            // Call the smart contract
            const myHashes = await contract.getMyRecords();

            // myHashes is a Proxy array, lets convert it to a regular JS array
            setRecords(Array.from(myHashes));
        }catch(err){
            console.error("Error fetching records:", err);
        }finally {
            setLoadingRecords(false);
        }
    }, [signer])

    useEffect(() => {
        if(activeTab === "records"){
            fetchRecords();
        }
    }, [activeTab, fetchRecords]);

    const handleFileChange = (e) => {
        if(e.target.files[0]){
            setFile(e.target.files[0]);
            setStatus("");
        }
    }

    const handleUpload = async() => {
        if(!file || !signer){
            return;
        }

        try{
            setUploading(true);
            setStatus('Step 1/2: Uploading to IPFS...');
            const data = await api.uploadFile(file);
            const ipfsHash = data.ipfsHash;

            setStatus('Step 2/2: Waiting for Wallet Signature...');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);
            const tx = await contract.uploadRecord(ipfsHash);

            setStatus('Waiting for block confirmation...');
            await tx.wait();

            setStatus(`Success! Hash: ${ipfsHash}`);
            setFile(null);

            // If we are on the records tab, refresh list
            if (activeTab === 'records'){
                await fetchRecords();
            }
        }catch (err){
            console.error("Upload failed:", err);
            setStatus("Upload failed: " + (err.message || "Unknown Error"));
        }finally{
            setUploading(false);
        }
    };

    // View File
    const viewFile = (hash) => {
        // We open the backend route in a new tab
        // We must pass the patientAddress (me) and providerAddress (me)
        // Since I am the patient, I always have access to my own files.
        // However, our backend checkAccess logic asks "Does Provider have access?"
        // The Smart Contract logic usually implies the Owner always has access,
        // BUT for our specific 'checkAccess' function, we might need to self-grant or just bypass
        // if the backend checks "is patientAddress == providerAddress".

        // For now, let's try the direct route assuming the backend handles owner access:
        const url = `http://localhost:8080/api/records/${hash}?patientAddress=${walletAddress}&providerAddress=${walletAddress}`;
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
                <p className="text-slate-400 mt-1">Manage your personal records securely.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-700 pb-1">
                <button
                    onClick={() => setActiveTab("records")}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === "records" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"} cursor-pointer`}
                >
                    My Records
                </button>

                <button
                    onClick={() => setActiveTab('upload')}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'upload' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'} cursor-pointer`}
                >
                    Upload Record
                </button>

                <button
                    onClick={() => setActiveTab("access")}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'access' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'} cursor-pointer`}
                >
                    Access Control
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                {activeTab === "records" && (
                    <div>
                        {loadingRecords ? (
                            <div className="text-center py-10 text-emerald-400 animate-pulse">Loading Blockchain Records...</div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <p className="text-lg">No records found.</p>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className="text-emerald-400 hover:underline mt-2 cursor-pointer"
                                >
                                    Upload one now!
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {records.map((hash, index) => (
                                    <div key={index} className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-emerald-500 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="bg-slate-800 p-2 rounded text-emerald-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                            </div>

                                            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded">
                                                #{index + 1}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-300 font-mono truncate mb-4" title={hash}>
                                            {hash}
                                        </p>
                                        <button
                                            onClick={() => viewFile(hash)}
                                            className="w-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
                                        >
                                            View Document
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "upload" && (
                    <div className="max-w-xl mx-auto text-center">
                        <h3 className="text-xl font-semibold mb-4 text-emerald-400">Upload Medical Record</h3>
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-10 hover:border-emerald-500 transition-colors bg-slate-900/50 relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? <p className="text-emerald-400 font-medium">{file.name}</p> : <><p className="text-slate-300">Click or Drag file here</p><p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG (Max 10MB)</p></>}
                        </div>
                        {status && <div className={`mt-4 text-sm p-3 rounded ${status.includes('Success') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>{status}</div>}
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg">
                            {uploading ? 'Processing...' : 'Upload to Blockchain'}
                        </button>
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="text-center py-10 text-slate-400">
                        <p>Access Control features coming next.</p>
                    </div>
                )}

            </div>
        </div>
    )
}
export default PatientDashboard
