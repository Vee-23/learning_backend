import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
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

    const tweetLikeState = await Like.findOne({
        tweet: tweetId,
        LikedBy: user._id
    })

    if(!tweetLikeState){
        const liked = await Like.create(
            {
                tweet: tweetId,
                LikedBy: user._id
            }
        )

        if(!liked){
            throw new ApiError(501, "Something went wrong while Liking the comment")
        }

        return res.status(200).json(
            new ApiResponse(200, liked, "Liked the tweet successfully")
        )

    }else{
        const unliked = await Like.deleteOne(user._id)

        const validation = await Like.findById(unliked._Id)

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
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}