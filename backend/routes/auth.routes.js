import express from 'express';
import { registerUser, getUserByWallet } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.get("/user/:walletAddress", getUserByWallet);

export default router;