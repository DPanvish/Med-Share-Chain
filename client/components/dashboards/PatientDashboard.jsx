import React, {useState} from 'react'

const PatientDashboard = ({user}) => {
    const [activeTab, setActiveTab] = useState("records"); // records | upload | access

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
                    onClick={() => setActiveTab("upload")}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'upload' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'} cursor-pointer`}
                >
                    Access Control
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                {activeTab === "records" && (
                    <div className="text-center py-10 text-slate-400">
                        <p className="text-lg">No records found on the blockchain yet.</p>
                        <p className="text-sm mt-2">Upload a document to get started.</p>
                    </div>
                )}

                {activeTab === "upload" && (
                    <div className="max-w-xl mx-auto">
                        <h3 className="text-xl font-semibold mb-4 text-emerald-400"> Upload Medical Records</h3>
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-900/50">
                            <p className="text-slate-300">Drag and drop your file here</p>
                            <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG (Max 10MB)</p>
                            <button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                                Select File
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'access' && (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-semibold text-white mb-2">Grant Access</h4>
                            <p className="text-sm text-slate-400 mb-4">Allow a doctor to view a specific record.</p>
                            <input
                                type="text"
                                placeholder="Doctor's Wallet Address (0x...)"
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm mb-3 focus:border-emerald-500 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Record Hash (Qm...)"
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm mb-3 focus:border-emerald-500 outline-none"
                            />
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                                Grant Permission
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
export default PatientDashboard
