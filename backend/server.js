import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.routes.js';
import recordRoutes from './routes/record.routes.js';

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

app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})