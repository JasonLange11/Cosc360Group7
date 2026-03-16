import mongoose from "mongoose";

export async function connectDB(){

    const url = process.env.MONGODB_URI;

    if(!url){
        throw new Error("MONGODB_URL is not set")
    }

    await mongoose.connect(url);
    console.log("MongoDB connected");
}