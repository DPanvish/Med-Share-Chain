import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [loading, setLoading] = useState(true); // New: Prevents flickering on refresh

    useEffect(() => {
        // Define handlers (Must be named functions to remove them later)
        const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
                console.log("Account changed:", accounts[0]);
                // Best practice: Reload to clear all app state and fetching hooks
                window.location.reload();
            } else {
                disconnectWallet();
            }
        };

        const handleChainChanged = (chainId) => {
            console.log("Chain changed:", chainId);
            window.location.reload();
        };

        // Setup Listeners
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
        }

        // Check for existing connection (Session Persistence)
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    // 'eth_accounts' simply checks availability, doesn't pop up the modal
                    const accounts = await provider.send("eth_accounts", []);

                    if (accounts.length > 0) {
                        const signer = await provider.getSigner();
                        setProvider(provider);
                        setSigner(signer);
                        setWalletAddress(accounts[0]);
                    }
                } catch (err) {
                    console.error("Error restoring session:", err);
                }
            }
            setLoading(false); // Done checking
        };

        checkConnection();

        // Cleanup Listeners
        return () => {
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            }
        };
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                // 'eth_requestAccounts' triggers the popup
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const address = accounts[0];

                setProvider(provider);
                setSigner(signer);
                setWalletAddress(address);

                console.log("AuthContext: Wallet connected:", address);
                return { success: true };
            } catch (err) {
                console.error("AuthContext: Error connecting wallet:", err);
                return { success: false, error: err.message };
            }
        } else {
            console.error("AuthContext: MetaMask not detected.");
            return { success: false, error: "MetaMask not detected. Please install it." };
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setProvider(null);
        setSigner(null);
        console.log("AuthContext: Wallet disconnected");
    };

    const value = {
        walletAddress,
        provider,
        signer,
        loading,
        connectWallet,
        disconnectWallet,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};