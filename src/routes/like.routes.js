import { Router } from "express";
import { toggleTweetLike,
         toggleVideoLike,
         toggleCommentLike,
         getLikedVideos } from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter.route("/tweet").post(verifyJwt, toggleTweetLike)
likeRouter.route("/video").post(verifyJwt, toggleVideoLike)
likeRouter.route("/all-liked-videos").get(verifyJwt, getLikedVideos)


export default likeRouter;