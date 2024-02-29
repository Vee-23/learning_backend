import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv';
import { ApiError } from './ApiError.js';
import { response } from 'express';
dotenv.config({path:'./.env'});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //on success
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath);  //remove the locally saved temporary file since uploading failed
        return null;
    }
}

const resource = async (public_id) =>{
    try {
        if(!public_id)return null;

         const res = await cloudinary.api.resource(public_id, {
            resource_type: "video",
            media_metadata: true,
          });

          return res
    } catch (error) {
        throw new ApiError(501, "Something went wrong while trying to fetch data")
    }
}

export { uploadOnCloudinary,
         resource }


// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function(error, result) {console.log(result); });