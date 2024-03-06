import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {ownerId} = req.query
    const userId = req.user._id
    if(!isValidObjectId(ownerId)){
        throw new ApiError(401, "Not a valid Channel Id")
    }

    const subscriptionStatus = await Subscription.findOne({
        "subscriber": new mongoose.Types.ObjectId(userId),
        "channel": ownerId
    })

    if(!subscriptionStatus){
        try {
            const subscription = await Subscription.create(
                {
                    subscriber: userId,
                    channel: ownerId
                }
            )

            return res.status(200).json(
                new ApiResponse(200, subscription, "Subscribed successfully")
            )
        } catch (error) {
            throw new ApiError(501, error, "Something went wrong while subscribing")
        }
    }else{
        try {
            const unsub = await Subscription.findOneAndDelete(subscriptionStatus._id)

            return res.status(200).json(
                new ApiResponse(200, "Unsubscribed successfully")
            )
        } catch (error) {
            throw new ApiError(501, error, "Something went wrong while unsubscribing")
        }
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {ownerId} = req.query
    if(!isValidObjectId(ownerId)){
        throw new ApiError(401, "Invalid channel Id")
    }

    try {
        const subscribers = await Subscription.aggregate([
            {
                $match:{
                    channel: new mongoose.Types.ObjectId(ownerId),
                    pipeline: [
                        {
                            $count : "totalSubs"
                        }
                    ]
                }
            },
            // {
            //     $lookup: {
            //         from: "users",
            //         foreignField: "_id",
            //         localField: "subscriber",
            //         as: "subscriber_Details"
            //     }
            // }
        ])

        return res.status(200).json(
            new ApiResponse
        )
    } catch (error) {
        throw new ApiError(501, error, "something went wrong while fetching subscribers")
    }


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId  = req.user._id
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(401, "Invalid channel Id")
    }

    try {
        const channels = await Subscription.aggregate([
            {
                $match:{
                    subscriber: new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "channel",
                    as: "channel_details"
                }
            }
        ])

        return res.status(200).json(
            new ApiResponse(200, channels, "subscriptions fetched successfully")
        )
    
    } catch (error) {
        throw new ApiError(501, "something went wrong while getting subscribed channels")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}