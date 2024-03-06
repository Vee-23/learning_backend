import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utilities/ApiError.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
import {asyncHandler} from "../utilities/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description, status, videoIds} = req.body
    if(!name || !status){
        throw new ApiError(401, "The name of the playlist and its state is required")
    }
    const videos = videoIds
    const userId = req.user._id

   try {
     const newPlaylist = await Playlist.create(
         {
             name: name,
             owner: new mongoose.Types.ObjectId(userId),
             description: description? description: " ",
             publicStatus: status,
             videos: videos
         }
     )
 
     return res.status(200).json(
         new ApiResponse(200, newPlaylist, "New Playlist created successfully")
     )
   } catch (error) {
    throw new ApiError(501, error, "Something went wrong while trying to fetch data")
   }

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.query.user
    if(!isValidObjectId(userId)){
        throw new ApiError(401, "Not a valid user Id")
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match:{
                publicStatus: true
            }
        },
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if(!userPlaylist){
        throw new ApiError(501, "Something went wrong while fetching playlists")
    }

    return res.status(200).json(
        new ApiResponse(200, userPlaylist, "Playlists fetched successfully")
    )
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const playlistId = req.query.playlistId
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Not a valid playlist Id")
    }

    try {
        const playlist = await Playlist.findById(playlistId)
        
        return res.status(200).json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        )
    } catch (error) {
        throw new ApiError(501, "Something went wrong while fetching playlist")
    }

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.query
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid data")
    }

    try {
        const currentPlaylist = await Playlist.findById(playlistId)
        const videos = currentPlaylist.videos
        videos.forEach(video => {
            if(video == videoId){
                throw new ApiResponse(201, "video already exists in the playlist")
            }
        });
        videos.push(videoId)

        const playlist = await Playlist.findByIdAndUpdate(playlistId,
            {
                videos: videos
            })
        const updatedPlaylist = await Playlist.findById(playlist._id)
        return res.status(200).json(
                new ApiResponse(200, updatedPlaylist,"Video successfully added to the playlist")
            )
    } catch (error) {
        throw new ApiError(501, "Something went wrong while uploading the video to the playlist")
    }

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.query
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid data")
    }

    try {
        let validation = 0;
        const currentPlaylist = await Playlist.findById(playlistId)
        const videos = currentPlaylist.videos
        const i = videos.indexOf(videoId)
        if(i> -1){
            videos.splice(i, 1)
            validation++ 
        }
        if(validation === 0){
            throw new ApiResponse(201, "No such Video found in the playlist")
        }

        const playlist = await Playlist.findByIdAndUpdate(playlistId,
            {
                videos: videos
            })
        const updatedPlaylist = await Playlist.findById(playlist._id)
        
        return res.status(200).json(
                new ApiResponse(200, updatedPlaylist,"Video successfully added to the playlist")
            )
    } catch (error) {
        throw new ApiError(501, "Something went wrong while uploading the video to the playlist")
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const playlistId = req.query.playlistId
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "No such Playlist exists")
    }

    try {
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

        return res.status(200).json(
            new ApiResponse(200, deletedPlaylist,"Playlist deleted successfully")
        )
    } catch (error) {
        throw new ApiError(501, error, "Something went wrong while deleting the playlist")
    }

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const playlistId = req.query.playlistId
    const {name, description, publicStatus} = req.body
    if(!name){
        throw new ApiError(401, "The name field is required")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Not a valid Playlist Id")
    }

    try {
        const OldPlaylist = await Playlist.findById(playlistId)
        const playlist = await Playlist.findByIdAndUpdate(playlistId,
            {
                name: name,
                description: description? description : OldPlaylist.description,
                publicStatus: publicStatus? publicStatus : OldPlaylist.publicStatus
            })
        const updatedPlaylist = await Playlist.findById(playlist._id)

        return res.status(200).json(
            new ApiResponse(200, updatedPlaylist, "Playlist updated Successfully")
        )
        
    } catch (error) {
        throw new ApiError(501, "Something went wrong while updating the playlist")
    }

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}