import {createContext, useContext, useEffect, useState} from "react";
import {ethers} from "ethers";


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    useEffect(() => {
        if(window.ethereum){
            // Listen for account changes
            window.ethereum.on("accountsChanged", (accounts) => {
                if(accounts.length > 0){
                    console.log("Account changed detected:", accounts[0]);
                    window.location.reload();
                }else{
                    disconnectWallet();
                }
            });

            // Listen for network changes
            window.ethereum.on("chainChanged", (chainId) => {
                console.log("Chain changed detected:", chainId);
                window.location.reload();
            });
        }

        return () => {
            if(window.ethereum && window.ethereum.removeListener){
                window.ethereum.removeListener("accountsChanged", () => {});
                window.ethereum.removeListener("chainChanged", () => {});
            }
        }
    }, []);

    const connectWallet = async() => {
        if(window.ethereum){
            try{
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const address = accounts[0];

                setProvider(provider);
                setSigner(signer);
                setWalletAddress(address);

                console.log("AuthContext: Wallet connected:", address);
                return {success: true};
            }catch(err){
                console.error("AuthContext: Error connecting wallet:", err);
                return {success: false, error: err.message};
            }
        }else{
            console.error("AuthContext: MetaMask not detected. Please install it to connect your wallet.");
            return {success: false, error: "MetaMask not detected"};
        }
    };


    const disconnectWallet = () => {
        setWalletAddress(null);
        setProvider(null);
        setSigner(null);
        console.log("AuthContext: Wallet disconnected");
    }

    const value = {
        walletAddress,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};