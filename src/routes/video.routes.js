import { Router } from "express";
import { getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const videoRouter = Router();

videoRouter.route("/uploadVideo").post(verifyJwt, upload.fields([
    {
        name: "video",
        maxCount: 1
    }, 
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishVideo)
videoRouter.route("/getVideo").get(verifyJwt, getVideoById)
videoRouter.route("/updateVideo").patch(verifyJwt, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]),  updateVideo)

export default videoRouter;