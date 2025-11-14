import Web3 from 'web3';
import abi from './AccessControl.json' with {type: 'json'};

const providerUrl = process.env.GANACHE_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;

if(!providerUrl || !contractAddress) {
    throw new Error('Missing environment variables');
}

// Initialize Web3 with the provider URL
const web3 = new Web3((new Web3.providers.HttpProvider(providerUrl)));

// Initialize the contract instance with the ABI and address
export const contract = new web3.eth.Contract(
    abi.abi,
    contractAddress
);

console.log("Blockchain service initialized, Connected to contract at :", contractAddress);

export default web3;