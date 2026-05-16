import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: 'dkdaxkmuy',
    api_key: '387439263352539',
    api_secret: 'VJoY7NDftASgdNRnUNOvvWfgxgY',
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