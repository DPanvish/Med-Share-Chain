import express from 'express';
import multer from 'multer';
import { uploadToIPFS, getRecordFromIPFS } from "../controllers/record.controller.js";

const router = express.Router();

// Define the storage engine for multer
const storage = multer.memoryStorage();

// Initialize multer with the storage engine
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
})

router.post('/upload', upload.single('file'), uploadToIPFS)
router.get('/:hash', getRecordFromIPFS);

export default router;