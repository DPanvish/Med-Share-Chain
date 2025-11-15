import React, {useState} from 'react'
import {ethers} from "ethers";

const WalletConnect = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [error, setError] = useState(null);

    const connectWallet = async()=> {
        setError(null);
        if(window.ethereum) {
            try{
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const address = accounts[0];
                if (address) {
                    setWalletAddress(address);
                    console.log("Wallet connected:", address);
                } else {
                    setError("No accounts found. Please check your wallet.");
                }
            }catch(err){
                console.error(err);
                setError("Failed to connect wallet. Please check console for details.");
            }
        }else{
            setError("Please install MetaMask to connect your wallet.")
        }
    };

    const truncateAddress = (address) => {
        return `${address.slice(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return (
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 text-center">
            {walletAddress ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-emerald-400">
                        Wallet Connected!
                    </h2>

                    <p className="text-sm text-slate-300 bg-slate-700 px-4 py-2 rounded-md font-mono">
                        {truncateAddress(walletAddress)}
                    </p>

                    <button
                        onClick={() => setWalletAddress(null)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                    >
                        Disconnect Wallet
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-200">
                        Get Started
                    </h2>
                    <p className="text-slate-400">
                        Connect your wallet to manage your health records.
                    </p>
                    <button
                        onClick={connectWallet}
                        className="w-full text-lg font-bold py-3 px-6 rounded-lg transition-all duration-30 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-x transform hover:-translate-y-1"
                    >
                        Connect Wallet
                    </button>

                    {error && (
                        <p className="text-red-400 text-sm mt-4">{error}</p>
                    )}
                </div>
            )}
        </div>
    )
}
export default WalletConnect;
