import React, {useState} from 'react'

const ProviderDashboard = ({user}) => {
    const [searchAddress, setSearchAddress] = useState("");

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Provider Portal</h1>
                    <p className="text-slate-400 mt-1">{user.hospital}</p>
                </div>
            </header>

            {/* Search Section */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-8">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Find Patient Records</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={searchAddress}
                        onChange={(e) => setSearchAddress(e.target.value)}
                        placeholder="Enter Patient Wallet Address (0x....)"
                        className="flex-1 bg-slate-900 border border-slate-500 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />

                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all">
                        Search Records
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center col-span-full text-slate-500">
                    Enter a patient address above to view their authorized records.
                </div>
            </div>
        </div>
    )
}
export default ProviderDashboard
