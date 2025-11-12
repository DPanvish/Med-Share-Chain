import User from '../models/user.model.js';


/**
 * @desc Register a new user (Patient or Provider)
 * @route POST /api/auth/register
 * @access Public
 */

export const registerUser = async(req, res) => {
    try{
        const {walletAddress, name, role, hospital} = req.body;

        if(!walletAddress || !name || !role){
            return res.status(400).json({message: "Please provide walletAddress, name and role"});
        }

        const userExists = await User.findOne({walletAddress: walletAddress.toLowerCase()});
        if(userExists){
            return res.status(400).json({message: "User with this wallet address already exists"});
        }

        const newUser = new User({
            walletAddress: walletAddress.toLowerCase(),
            name,
            role,
            hospital: role === "provider" ? hospital : undefined,
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            _id: savedUser._id,
            walletAddress: savedUser.walletAddress,
            name: savedUser.name,
            role: savedUser.role,
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Server error during user registration"});
    }
}