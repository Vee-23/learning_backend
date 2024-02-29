import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
} from "../controllers/tweet.controller.js";

const tweetRouter = Router();

tweetRouter.route("/upload").post(verifyJwt, createTweet)
tweetRouter.route("/search").get(verifyJwt, getUserTweets)
tweetRouter.route("/update").patch(verifyJwt, updateTweet)
tweetRouter.route("/delete").delete(verifyJwt, deleteTweet)

export default tweetRouter;