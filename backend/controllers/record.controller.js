import ipfs from '../services/ipfs.service.js';
import web3, {contract} from "../services/blockchain.service.js";

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
            ipfsHash: result.cid.toString(),
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

        let checkedPatientAddress;
        let checkedProviderAddress;

        try{
            checkedPatientAddress = await web3.utils.toChecksumAddress(patientAddress);
            checkedProviderAddress = await web3.utils.toChecksumAddress(providerAddress);
        }catch(err){
            console.error("Address validation error ", err.message);
            return res.status(400).json({ message: 'Invalid Ethereum address format.', error: err.message });
        }

        if(!patientAddress || !providerAddress){
            return res.status(400).json({message: "Missing patientAddress or providerAddress query parameters"});
        }

        console.log(`Checking access for: Patient ${checkedPatientAddress}, Provider ${checkedProviderAddress}`);

        const hasAccess = await contract.methods
            .checkAccess(checkedPatientAddress, checkedProviderAddress, hash)
            .call();

        if(!hasAccess){
            return res.status(401).json({message: "Unauthorized: You do not have permission to access this record"});
        }

        console.log("Access granted, fetching record from IPFS...");


        const fileStream = await ipfs.cat(hash);

        // Send the file stream directly to the client
        res.setHeader('Content-Type', 'application/octet-stream');


        // Stream the file chunks to the response
        for await (const chunk of fileStream){
            res.write(chunk);
        }

        res.end();
    }catch(err){
        console.error("IPFS fetch error: ", err);
        res.status(500).json({message: "Server error during file fetch from IPFS"});
    }
};