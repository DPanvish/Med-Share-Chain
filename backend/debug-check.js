import Web3 from 'web3';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const RPC_URL = process.env.GANACHE_URL || 'http://127.0.0.1:7545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Load ABI
const contractJSON = JSON.parse(fs.readFileSync('./services/AccessControl.json', 'utf8'));

const web3 = new Web3(RPC_URL);
const contract = new web3.eth.Contract(contractJSON.abi, CONTRACT_ADDRESS);

// DATA FROM YOUR ERROR LOG
const patient = '0x1Ebca490Ce1ba6c2aD49815A1A4F2d7249342E78';
const provider = '0xA28E1BbaDD4C42afB0EDCC7e39cD3010850D3d74';
const hash = 'QmZs1zW12vkoVQfxTeZWEt17MY1FEecme6ZFRaRXZ2eSYB';

console.log(`Checking Contract: ${CONTRACT_ADDRESS}`);
console.log(`Patient: ${patient}`);
console.log(`Provider: ${provider}`);
console.log(`Hash: ${hash}`);

contract.methods.checkAccess(patient, provider, hash).call()
    .then(result => console.log("\n📢 BLOCKCHAIN RESULT:", result))
    .catch(err => console.error("\n❌ ERROR:", err));