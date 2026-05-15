
//require("dotenv").config({path: "./env"});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "./env" });


connectDB()
.then(()=>{
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    }

})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
}



/*
export const connectDB = async () => {
    try {
        await mongoose.connect('${process.env.MONGO_URI}/${DB_NAME}');
        console.log("Connected to MongoDB");
        app.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}
*/