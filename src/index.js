import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });