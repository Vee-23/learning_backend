import { Router } from "express";
import { publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const videoRouter = Router();

videoRouter.route("/uploadVideo").post(upload.fields([
    {
        name: "video",
        maxCount: 1
    }, 
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishVideo)


export default videoRouter;