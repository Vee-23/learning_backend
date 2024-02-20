import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet } from "../controllers/tweet.controller.js";

const tweetRouter = Router();

tweetRouter.route("/upload").post(verifyJwt, createTweet)


export default tweetRouter;