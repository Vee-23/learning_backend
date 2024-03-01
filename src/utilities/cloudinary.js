import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv';
import { ApiError } from './ApiError.js';
import { publicEncrypt } from 'crypto';
dotenv.config({ path: './.env' });

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

const resource = async (public_id) => {
    try {
        if (!public_id) return null;

        const res = await cloudinary.api.resource(public_id, {
            resource_type: "video",
            media_metadata: true,
        });

        return res
    } catch (error) {
        throw new ApiError(501, "Something went wrong while trying to fetch data")
    }
}

const deleteMultipleImgs = async (ImgPublic_ids) => {
    try {
        if (!ImgPublic_ids) return null;

        let result = []
        for (let i = 0; i < ImgPublic_ids.length; i++) {
            const element = ImgPublic_ids[i];
            result = await cloudinary.uploader.destroy(element, {resource_type: 'image'})
        }

        return result
    } catch (error) {
        throw new ApiError(501, error, "Someting went wrong while deleting the Image files")
    }
}

const deleteMultipleVideos = async (VideosPublic_ids) => {
    try {
        if (!VideosPublic_ids) return null;

        let result = []
        for (let i = 0; i < VideosPublic_ids.length; i++) {
            const element = VideosPublic_ids[i];
            result = await cloudinary.uploader.destroy(element, {resource_type: 'video', type: 'authenticated'})
        }

        return result
    } catch (error) {
        throw new ApiError(501, error, "Someting went wrong while deleting the Video files")
    }
}

const getPublicIdFromUrl = (arr) => {
    if (!arr) return "No url has been provided";

    let public_ids = [];
    for (let i = 0; i < arr.length; i++) {
        let ele = arr[i];
        ele = ele.split("v1")[1]
        ele = ele.split("/")[1]
        public_ids[i] = ele.split(".")[0]
    }

    return public_ids
}

export {
    uploadOnCloudinary,
    resource,
    deleteMultipleImgs,
    deleteMultipleVideos,
    getPublicIdFromUrl
}


// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function(error, result) {console.log(result); });