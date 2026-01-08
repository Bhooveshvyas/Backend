import { v2 as cloudinary } from "cloudinary"
import { log } from "console";
import fs from "fs"
// open processes = any file is opened during the running process, hard link -> in how many names does the file exist in file system, kernel -> Boss of OS/Manager

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("file is uploaded on Cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlink(localFilePath, (err) => {
            if (err) console.log("File deletion error:", err);
        });
        return null;
    }

}


export { uploadOnCloudinary }