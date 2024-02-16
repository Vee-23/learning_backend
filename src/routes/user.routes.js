import { Router } from "express";
import { registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();


userRouter.route("/register").post(upload.fields([
    {
    name: "avatar",
    maxCount: 1
    } ,
      {
        name: "coverImage",
        maxCount: 1
    }
]) , registerUser)

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJwt, logOutUser)
userRouter.route("/refresh_token").patch(refreshAccessToken)
userRouter.route("/change-password").patch(verifyJwt, changeCurrentPassword)
userRouter.route("/current-user").get(verifyJwt, getCurrentUser)
userRouter.route("/update-account").patch(verifyJwt, updateAccountDetails)
userRouter.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
userRouter.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)
userRouter.route("/c/:username").get(verifyJwt, getUserChannelProfile)
userRouter.route("/history").get(verifyJwt, getWatchHistory)


export default userRouter

