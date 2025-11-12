import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';

dotenv.config();

// --- Connect to MongoDB ---
await connectDB();

// --- App Configuration ---
const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
app.use(express.json());


// --- Routes ---
app.get('/', (req, res) => {
    res.send("Health-E-Chain Backend is running");
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})