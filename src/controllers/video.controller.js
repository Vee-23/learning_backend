import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import { asyncHandler } from "../utilities/asyncHandler.js"
import { uploadOnCloudinary, resource, deleteMultiple, getPublicIdFromUrl} from "../utilities/cloudinary.js"
import { application } from "express"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body
    const user = req.user
    const ownerId = user._id
    if (!title || !description) {
        throw new ApiError(401, "All fields are required")
    }

    const videoPath = req.files?.video[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path
    if (!videoPath || !thumbnailPath) {
        throw new ApiError(401, "Video and thumbnail both are required")
    }

    const CloudVideo = await uploadOnCloudinary(videoPath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if (!CloudVideo || !thumbnail) {
        throw new ApiError(501, "something went wrong while uploading the video")
    }

    const metaDataOfVideo = await resource(CloudVideo.public_id)
    if (!metaDataOfVideo) {
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
    if (!videoDoc) {
        throw new ApiError(501, "Something went wromg while publishing the video")
    }

    return res.status(200).json(
        new ApiResponse(200, videoDoc, "video has been uploaded successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.query.video
    if (!videoId) {
        throw new ApiError(401, "No video Id has been provided")
    }

    const validation = isValidObjectId(videoId)
    if (!validation) {
        throw new ApiError(401, "The video id is not valid")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(501, "something went wrong while fetching the video details")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video has been successfully fetched")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const videoId = req.query.video
    const { newtitle, newdescription } = req.body
    const videoFile = req.files?.video[0]?.path
    const thumbnailFile = req.files?.thumbnail[0]?.path
    if (!videoId) {
        throw new ApiError(401, "No such video id")
    }

    const validation = isValidObjectId(videoId)
    if (!validation) {
        throw new ApiError(401, "Not a Valid Video Id")
    }

    const oldVideo = await Video.findById(videoId)
    if (!oldVideo) {
        throw new ApiError(501, "Something went wrong while fetching the old video data")
    }
    const ownerValidationString = `${oldVideo.owner}`
    const reqUserString = `${req.user._id}`
    if(ownerValidationString !== reqUserString){
        throw new ApiError(401, "Unauthorized request")
    }

    if (!videoFile && !thumbnailFile && !newtitle && !newdescription) {
        throw new ApiError(401, "Atleast One field has to be uploaded in order to update")
    }

    let newThumbnailObject, newVideoObject, newDurationObject;
    if (videoFile) {
        newVideoObject = await uploadOnCloudinary(videoFile)
        newDurationObject = await resource(newVideoObject.public_id)
    }

    if (thumbnailFile) {
        newThumbnailObject = await uploadOnCloudinary(thumbnailFile)
    }

    const newVideo = await Video.findByIdAndUpdate(videoId,
        {
            title: newtitle? newtitle : oldVideo.title,
            description: newdescription? newdescription : oldVideo.description,
            videoFile: newVideoObject.url? newVideoObject.url : oldVideo.videoFile,
            thumbnail: newThumbnailObject.url? newThumbnailObject.url : oldVideo.thumbnail,
            duration: newDurationObject.duration?newDurationObject.duration : oldVideo.duration
        })

    const newVideoValidation = await Video.findById(newVideo._id)
    if (!newVideoValidation) {
        throw new ApiError(501, "Something went wrong while updating the video")
    }

    const assetUrls = [oldVideo.videoFile, oldVideo.thumbnail]
    const public_ids = getPublicIdFromUrl(assetUrls)
    console.log(public_ids)
    // const deleteOldFiles = await deleteMultiple(public_ids)

    return res.status(200).json(
        new ApiResponse(200, newVideo, "Video has been succesfully updated")
    )


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