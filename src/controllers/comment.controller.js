import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import { asyncHandler } from "../utilities/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, videoId } = req.query
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Not a valid videoId")
    }
    const pageLimit = page * limit

    try {
        const videoComments = await Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $limit: pageLimit
            }
        ])

        return res.status(200).json(
            new ApiResponse(200, videoComments, "videoComments fetched successfully")
        )
    } catch (error) {
        throw new ApiError(501, "Something wemt wrong while fetching comments")
    }

})

const addComment = asyncHandler(async (req, res) => {

    const { commentString } = req.body
    const { ownerId, videoId } = req.query
    if (!isValidObjectId(ownerId) || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid Id")
    }

    if(!commentString){
        throw new ApiError(401, "Content is required")
    }

    try {
        const comment = await Comment.create({
            content: commentString,
            owner: ownerId,
            video: videoId
        })

        return res.status(200).json(
            new ApiResponse(200, comment, "Comment added successfully")
        )

    } catch (error) {
        throw new ApiError(501, "Something went wrong while posting a comment")
    }

})

const updateComment = asyncHandler(async (req, res) => {
    const { updatedString } = req.body;
    const { videoId, ownerId } = req.query
    if (!isValidObjectId(ownerId) || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid Id")
    }

    try {
        const comment = await Comment.findOne({
            "owner": ownerId,
            "video": videoId
        })

        if (!comment) {
            throw new ApiError(402, "Unauthorized request")
        }

        const updatedComment = await Comment.findByIdAndUpdate(comment._id, {
                $set:{
                    content: updatedString
                }
            },
            {
                new: true
            })


        return res.status(200).json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )

    } catch (error) {
        throw new ApiError(501, "Something went wrong while updating the comment")
    }

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.query
    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "Invalid commentId")
    }

    try {
        const deletedComment = await Comment.findByIdAndDelete(commentId)

        return res.status(200).json(
            new ApiResponse(200, deletedComment,"Comment was deleted successfully")
        )

    } catch (error) {
        throw new ApiError(501, "Something went wrong while deleting the comment")
    }

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}