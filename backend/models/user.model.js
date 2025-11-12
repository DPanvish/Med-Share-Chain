import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // The user's public Ethereum wallet address.
    // This is the primary key linking them to the blockchain.
    walletAddress:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    name:{
        type: String,
        required: true,
        trim: true,
    },
    role:{
        type: String,
        required: true,
        enum: ["patient", "provider",],
    },
    hospital:{
        type: String,
        trim: true,
        // Only required for providers.
        required: function() {return this.role === "provider";}
    },

    // add password/email later if needed, but for a
    // blockchain app, the wallet address is often the main identifier.
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;