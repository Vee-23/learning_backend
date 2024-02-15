import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"
import {uploadOnCloudinary} from "../utilities/cloudinary.js"
import { application } from "express"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async (req, res) => {
    // console.log("checking if hitting or not....1")
    const { title, description} = req.body

    if([title, description].some((field)=>field?.trim() === "")){
        throw new ApiError(409, "All Fields are required")
    }

    // console.log("checking if hitting or not....2")
    const videoPath = req.files?.video[0]?.path;
    if(!videoPath){
        throw new ApiError(409, "No video has been recieved to Upload")
    }

    // console.log("checking if hitting or not....3")
    const thumbnailPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailPath){
        throw new ApiError(409, "Thumbnail is required")
    }

    // console.log("checking if hitting or not....4")
    const videoFile = await uploadOnCloudinary(videoPath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailPath);

    // console.log("checking if hitting or not....5")
    if(!videoFile && !thumbnailFile){
        throw new ApiError(409, "Video and Thumbnail are missing")
    }
    
    console.log("checking if hitting or not....6")
    const video = await Video.create(
        {
            videoFile : videoFile.url,
            thumbnailFile: thumbnailFile.url,
            title,
            description
        }
    )
    console.log(video)

    const uploadedVideo = await Video.getVideoById(video._id)
    if(!uploadedVideo){
        throw new ApiError(501, "Something went wrong while uploading the video");
    }

    return res.status(200).json(
        new ApiResponse(200, uploadedVideo, "Video has been Uploaded successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}