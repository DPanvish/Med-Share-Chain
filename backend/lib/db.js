import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        const mongoURI = process.env.MONGO_URI;

        if(!mongoURI){
            console.error("MongoDB connection error: MONGO_URI is not defined");
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);

        console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(err){
        console.error("MongoDB connection error: ", err);
        process.exit(1);
    }
};

export default connectDB;