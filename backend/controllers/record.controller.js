import ipfs from '../services/ipfs.service.js';

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