import React, {useState} from 'react'
import { ethers } from "ethers";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";

// Import Artifacts
import AccessControl from "../../artifacts/AccessControl.json";
import { CONTRACT_ADDRESS} from "../../artifacts/contractAddress.js";

const PatientDashboard = ({user}) => {
    const { signer } = useAuth();
    const [activeTab, setActiveTab] = useState("records"); // records | upload | access
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState("");

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
            setStatus("Step 1/3 Uploading...");

            const data = await api.uploadFile(file);
            const ipfsHash = data.ipfsHash;

            setStatus("Step 2/3 Waiting for Wallet Signature...");

            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessControl.abi, signer);

            const tx = await contract.uploadRecord(ipfsHash);

            setStatus("Step 3/3 Waiting for Transaction Confirmation...");
            setFile(null);
        }catch (err){
            console.error("Upload failed:", err);
            setStatus("Upload failed: " + (err.message || "Unknown Error"));
        }finally{
            setUploading(false);
        }
    }

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
                    <div className="text-center py-10 text-slate-400">
                        <p>Your records will appear here.</p>
                    </div>
                )}

                {activeTab === "upload" && (
                    <div className="max-w-xl mx-auto">
                        <h3 className="text-xl font-semibold mb-4 text-emerald-400"> Upload Medical Records</h3>
                        {/* File Drop Area */}
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-10 hover:border-emerald-500 transition-colors bg-slate-900/50 relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {file ? (
                                <p className="text-emerald-400 font-medium">{file.name}</p>
                            ) : (
                                <>
                                    <p className="text-slate-300">Click or Drag file here</p>
                                    <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG (Max 10MB)</p>
                                </>
                            )}
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`mt-4 text-sm p-3 rounded ${status.includes("Success") ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-300"}`}>
                                {status}
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg cursor-pointer"
                        >
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
