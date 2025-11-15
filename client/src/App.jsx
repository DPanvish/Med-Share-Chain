import React from 'react'
import WalletConnect from "../components/WalletConnect.jsx";

const App = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-10">
            {/* Header section */}
            <header className="w-full max-w-5xl text-center mb-16">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                    MedShare Chain
                </h1>
                <p className="text-slate-400 text-lg mt-2">
                    Your health records, secured by the blockchain.
                </p>
            </header>

            {/* Main content area */}
            <main className="w-full max-w-md">
                <WalletConnect />
            </main>
        </div>
    )
}
export default App
