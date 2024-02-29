import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"
import {uploadOnCloudinary, resource} from "../utilities/cloudinary.js"
import { application } from "express"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async (req, res) => {

    const { title, description} = req.body
    const user = req.user
    const ownerId = user._id
    if(!title || !description){
        throw new ApiError(401, "All fields are required")
    }

    const videoPath = req.files?.video[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path
    if(!videoPath || !thumbnailPath){
        throw new ApiError(401, "Video and thumbnail both are required")
    }

    const CloudVideo = await uploadOnCloudinary(videoPath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!CloudVideo || !thumbnail){
        throw new ApiError(501, "something went wrong while uploading the video")
    }

    const metaDataOfVideo = await resource(CloudVideo.public_id)
    if(!metaDataOfVideo){
        throw new ApiError(401, "No video has been recieved")
    }
    const videoDuration = metaDataOfVideo.duration

    const video = await Video.create(
        {
            videoFile: CloudVideo.url,
            thumbnail: thumbnail.url,
            title: title,
            description: description,
            owner: ownerId,
            duration: videoDuration
        }
    )

    const videoDoc = await Video.findById(video._id)
    if(!videoDoc){
        throw new ApiError(501, "Something went wromg while publishing the video")
    }

    return res.status(200).json(
        new ApiResponse(200, videoDoc, "video has been uploaded successfully")
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