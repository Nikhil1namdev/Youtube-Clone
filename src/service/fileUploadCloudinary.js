import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //testing purpose ke liye tha ye
    // console.log("file is uploaded on cloudinary", uploadResult.url);
    // console.log("file is uploaded on cloudinary", uploadResult);

    //final upload hone ke baad file ko unlink karo
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved  temporary file as the upload failed
    console.log("error", error);
    return null;
  }
};

export default uploadOnCloudinary;
