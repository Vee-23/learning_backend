import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const videoId = req.query.videoId
    const username = req.user.username
    if(!videoId){
        throw new ApiError(401, "No video Id has been provided")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "No valid video Id has been given")
    }
    const user = await User.findOne({'username':username})
    if(!user){
        throw new ApiError(402, "Something went wrong while checking for the user")
    }

    const LikeStateValidator = async(videoId, userId) => {
        try {
            const like = await Like.findOne(
                {
                    video: videoId,
                    LikedBy: userId
                }
            )

            return like
        } catch (error) {
            throw new ApiError(501, error, "Something went wrong while verification")
        }
    }

    const videoLikeState = await LikeStateValidator(videoId, user._id)

    if(!videoLikeState){
        const liked = await Like.create(
            {
                video: videoId,
                LikedBy: user._id,
                typeOfContent: "video"
            }
        )
        if(!liked){
            throw new ApiError(501, "Something went wrong while liking the video")
        }

        return res.status(200).json(
            new ApiResponse(200, liked, "Liked the video successfully")
        )

    }else{
        const unliked = await Like.findByIdAndDelete(videoLikeState._id)
        const unlikeValidation = await Like.findById(videoLikeState._id)
        if(unlikeValidation){
            throw new ApiError(501, "Something went wrong while unliking")
        }

        return res.status(200).json(
            new ApiResponse(200, "Unliked the video successfully")
        )
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
 
})

const toggleTweetLike = asyncHandler(async (req, res) => {

    const tweetId = req.query.tweetId
    const username = req.user.username
    const user = await User.findOne({'username':username})
    if(!tweetId){
        throw new ApiError(402, "tweet not found")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "No valid tweet Id has been recieved")
    }

    const LikeStateValidator = async(tweetId, userId) =>{
        try {
            const like = await Like.findOne({
                tweet: tweetId,
                LikedBy: userId
            })

            return like
        } catch (error) {
            throw new ApiError(501, error,"Something went wrong while verification")
        }
    }
    
    const tweetLikeState = await LikeStateValidator(tweetId, user._id)

    if(!tweetLikeState){
        const liked = await Like.create(
            {
                tweet: tweetId,
                LikedBy: user._id,
                typeOfContent: "tweet"
            }
        )
        if(!liked){
            throw new ApiError(501, "Something went wrong while Liking the comment")
        }

        return res.status(200).json(
            new ApiResponse(200, liked, "Liked the tweet successfully")
        )

    }else{
        const unliked = await Like.findByIdAndDelete(tweetLikeState._id)
        const validation = await Like.findById(tweetLikeState._Id)
        if(validation){
            throw new ApiError(501, "Something went wrong while unliking")
        }

        return res.status(200).json(
            new ApiResponse(200, "unliked the tweet successfully")
        )

    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const username = req.user.username
    const user = await User.findOne({'username': username})
    if(!user){
        throw new ApiError(501, "Something went wrong while retrieving user data")
    }

    const likedVideos = await Like.aggregate([
        {
            $match:{
                LikedBy: user._id
            }
        },
        {
            $match: {
                typeOfContent: "video"
            }
        },
        {
            $lookup:{
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "video",
            }
        },
        {
            $addFields:{
                video: {
                        $arrayElemAt: ["$video", 0]
                }
            }
        },
        {
            $sort:{
                createdAt: 1
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(501, "Something went wrong while fetching the data")
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos successfully fetched")
    )
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}