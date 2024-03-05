import { Router } from "express";
import {createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist} from "../controllers/playlist.controllers.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const playListRouter = Router();

playListRouter.route("/create").post(verifyJwt, createPlaylist)
playListRouter.route("/get-user-playlists").get(getUserPlaylists)
playListRouter.route("/get-playlist").get(getPlaylistById)
playListRouter.route("/add-video").patch(verifyJwt, addVideoToPlaylist)
playListRouter.route("/remove-video").patch(verifyJwt, removeVideoFromPlaylist)
playListRouter.route("/delete-playlist").delete(verifyJwt, deletePlaylist)
playListRouter.route("/update-playlist").patch(verifyJwt, updatePlaylist)

export default playListRouter;