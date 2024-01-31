import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        user.save({ valididateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // return response 
    console.log("checking if hitting..s")
    const { fullName, email, username, password } = req.body
    // console.log("email: ", email)

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const exisistingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exisistingUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    console.log(avatar)
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // console.log("check",data)
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    console.log(createdUser)
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while proccessing")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    // username or email
    // find the user
    // authenticate password
    // generate access and refresh token
    // send cookie

    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const passwordValid = await user.isPasswordCorrect(password)

    if (!passwordValid) {
        throw new ApiError(401, "Invalid user password")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in succesfully"
            )
        )


})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshTokenToken: 1 }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingrefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

   try {
     const decodedToken = Jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
   } catch (error) {
     throw new ApiError(401, error?.messge || "invalid Refresh token")
   }

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid RefreshToken")
    }

    if(incomingrefreshToken !== user?.refreshToken){
        throw new ApiError(401, "RefreshToken has been expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id)

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200,
                                {accessToken, refreshToken: newRefreshToken},
                                "Access token Refreshed"   )
            )

})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const passwordValid = await user.isPasswordCorrect(oldPassword)

    if(!passwordValid){
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save({valididateBeforeSave: false})
    
      return res.status(200)
                .json(new ApiResponse(200, "password Changed Successfully"))
})

const getCurrentUser = asyncHandler( async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched successfully"))

})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName && !email){
        throw new ApiError(400, "All fields are required")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
        ).select("-password ")

        return res
        .status(200)
        .json(new ApiResponse(200, "Account has been successfully Updated"))

})

const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading The avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar
            }
        },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, "Avatar has been Updated"))
    

})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading The coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage
            }
        },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, "CoverImage has been Updated"))
})

const getUserChannelProfile = asyncHandler( async(req, res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscricptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscricptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel Does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User Channel Fetched Successfully"))

})

const getWatchHistory = asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localfield: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addfields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]                 
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history Fetched successfully"
            )
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}