import { Router } from "express";
import { toggleTweetLike } from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter.route("/tweet").post(verifyJwt, toggleTweetLike)


export default likeRouter;