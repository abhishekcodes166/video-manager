import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {

        console.log(process.env.MONGO_URI);

        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}${DB_NAME}`
        );

        console.log(
            `MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`
        );

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;