import ipfs from '../services/ipfs.service.js';
import web3, {contract} from "../services/blockchain.service.js";
import { fileTypeFromBuffer } from "file-type";

/**
 * @desc Upload a file to IPFS
 * @route POST /api/records/upload
 * @access Private (we'll secure this later)
 */

export const uploadToIPFS = async(req, res) => {
    try{
        // Check if a file was uploaded
        if(!req.file){
            return res.status(400).json({message: "No file uploaded"});
        }

        // Upload file to IPFS
        const result = await ipfs.add(req.file.buffer);

        res.status(200).json({
            message: "File uploaded successfully",
            hash: result.cid.toString(),
        })
    }catch(err){
        console.error("IPFS upload error: ", err);
        res.status(500).json({message: "Server error during file upload to IPFS"});
    }
}


/**
 * @desc Fetch a file from IPFS
 * @route GET /api/records/:hash
 * @access Private (permissioned)
 */

export const getRecordFromIPFS = async(req, res) => {
    try{
        const {hash} = req.params;
        const {patientAddress, providerAddress} = req.query;

        if(!patientAddress || !providerAddress || !hash){
            return res.status(400).json({message: "Missing patientAddress, providerAddress or hash query parameters"});
        }

        let checkedPatientAddress;
        let checkedProviderAddress;

        // Address validation
        try{
            checkedPatientAddress = web3.utils.toChecksumAddress(patientAddress);
            checkedProviderAddress = web3.utils.toChecksumAddress(providerAddress);
        }catch(err) {
            console.error("Address validation error ", err.message);
            return res.status(400).json({message: 'Invalid Ethereum address format.', error: err.message});
        }

        console.log(`Checking access for: Patient ${checkedPatientAddress}, Provider ${checkedProviderAddress}, Hash ${hash}`);

        // Permission Check
        // Allow Owner (Patient) to access their own file immediatly
        if(checkedProviderAddress === checkedPatientAddress){
            console.log("Access GRANTED (Owner)");
        }else{
            console.log("--- PERMISSION CHECK DEBUG ---");
            console.log("Contract Address:", process.env.CONTRACT_ADDRESS);
            console.log("Patient:", checkedPatientAddress);
            console.log("Provider (You):", checkedProviderAddress);
            console.log("File Hash:", hash);

            const hasAccess = await contract.methods
                .checkAccess(checkedPatientAddress, checkedProviderAddress, hash)
                .call();

            console.log("Blockchain replied:", hasAccess)

            if(!hasAccess){
                return res.status(401).json({message: "Unauthorized: You do not have permission to access this record"});
            }
        }

        // Fetch File from IPFS
        console.log("Fetching file from IPFS...");

        // Convert the async iterable (stream) into a single Buffer
        const chunks = [];
        for await(const chunk of ipfs.cat(hash)){
            chunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(chunks);

        // Detect File Type
        const type = await fileTypeFromBuffer(fileBuffer);

        // Set Headers and Send
        if(type){
            // If we detected a type (e.g. image/png), tell the browser!
            res.set('Content-Type', type.mime);
            console.log(`Serving file as: ${type.mime}`);
        }else{
            // Fallback
            res.set('Content-Type', 'application/octet-stream');
        }

        res.send(fileBuffer);
    }catch(err){
        console.error("IPFS fetch error: ", err);
        res.status(500).json({message: "Server error during file fetch from IPFS"});
    }
};