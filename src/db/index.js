import mongoose from "mongoose";
import { DB_Name } from "../Constants.js";

const connectDB = async ()=>{
    // This the proffessional way to connect MongoDB...
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGOBD_URI}/${DB_Name}`)
        console.log(`MonoDB has been connected successfully at 
        ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection is failed",error);
        process.exit(1)
    }
}

export default connectDB