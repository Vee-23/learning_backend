import { Router } from "express";
import { toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels } from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.route("/toggleSub-status").post(verifyJwt, toggleSubscription);
subscriptionRouter.route("/get-channel-subs").get(verifyJwt, getUserChannelSubscribers);
subscriptionRouter.route("/get-subscriptions").get(verifyJwt, getSubscribedChannels)


export default subscriptionRouter;