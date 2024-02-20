import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {username, tweetString} = req.body

    if(!tweetString){
        return new ApiError(409, "The Tweet Is Empty")
    }

    const user = await User.findOne({'username':username})

    if(!user){
        return new ApiError(409, "UnAuthorized request")
    }

    const tweet = await Tweet.create({
        content: tweetString,
        owner: user._id
    })

    const createdTweet = await Tweet.findById(tweet._id).select("-owner")

    if(!tweet){
        return new ApiError(501, "Something went wrong while uploading the tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, createdTweet,"Tweet has been uploaded succesfully")
    ) 

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}