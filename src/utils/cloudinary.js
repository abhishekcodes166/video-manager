import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_api_key,
    api_secret: process.env.cloud_api_secret,
});

const uploadToCloudinary = async (filePath) => {
    try{
        if(!filePath) return null;
        //upload file to cloudinary
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type: "auto",
        })
        //file has been uploaded to cloudinary
        console.log("File uploaded to cloudinary successfully");
        return response;
    }
    catch(error){
        fs.unlinkSync(filePath, (err) => {
            if(err){
                console.error("Error deleting file after failed upload:", err);
            }
        });
        console.error("Error uploading file to cloudinary:", error);
        throw error;
    }
};

export {uploadToCloudinary};