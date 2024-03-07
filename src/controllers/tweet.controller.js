import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import { asyncHandler } from "../utilities/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { tweetString } = req.body
    const username = req.user.username

    if (!tweetString) {
        throw new ApiError(409, "The Tweet Is Empty")
    }

    const user = await User.findOne({ 'username': username })
    if (!user) {
        throw new ApiError(409, "UnAuthorized request")
    }

    const tweet = await Tweet.create({
        content: tweetString,
        owner: user._id
    })


    if (!tweet) {
        throw new ApiError(501, "Something went wrong while uploading the tweet")
    }

    const createdTweet = await Tweet.findById(tweet._id)
    return res.status(200).json(
        new ApiResponse(200, createdTweet, "Tweet has been uploaded succesfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    const username = req.body.username;
    if (!username) {
        throw new ApiError(409, "Username is required")
    }

    const user = await User.findOne({ 'username': username })
    if (!user) {
        throw new ApiError(409, "No such User found")
    }

    const userId = user._id
    const tweets = await Tweet.aggregate(
        [
            {
                $match: {
                    owner: userId
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "tweet",
                    as: "Likes",
                    pipeline: [
                        {
                            $group: {
                                _id: "$tweet",
                                totalLikes: {
                                    $sum: 1
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    Likes: {
                        $arrayElemAt: ["$Likes", 0]
                    }
                }
            }, 
            {
                $addFields: {
                    likes: "$Likes.totalLikes"
                }
            },
           {
                $lookup:{
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "tweeter"
                }
            },
            {
                $addFields:{
                    tweeter: {
                        $arrayElemAt: ["$tweeter", 0]
                    }
                }
            },
            {
                $addFields:{
                    user: {
                        username: "$tweeter.username",
                        fullName: "$tweeter.fullName",
                        avatar: "$tweeter.avatar"
                    }
                }
            },
            {
                $project: {
                    user: 1,
                    content: 1,
                    owner: 1,
                    createdAt: 1,
                    likes: 1
                }
            }
        ])

    if (!tweets) {
        throw new ApiError(501, "The User seems to not have posted any tweets")
    }

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets have been succesfully collected")
    )

})

const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId, tweetString } = req.body
    const validTweetId = isValidObjectId(tweetId)

    if (validTweetId === false) {
        throw new ApiError(409, "No valid id Has been provided")
    }
    if (!tweetString) {
        throw new ApiError(409, "Updated Tweet cannot be empty")
    }


    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: tweetString
            }
        },
        {
            new: true
        }
    )


    if (!updatedTweet) {
        throw new ApiError(409, "Something went wrong while updating the tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet has been Updated Succesfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.body
    const validTweetId = isValidObjectId(tweetId)

    if (!validTweetId) {
        throw new ApiError(409, "No Valid Tweet Id has been Provided")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200, deletedTweet, "The Tweet Has been succesfully deleted")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}