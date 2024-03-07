import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.route("/create").post(verifyJwt, addComment);
commentRouter.route("/edit-comment").patch(verifyJwt, updateComment);
commentRouter.route("/get-all-comments").get(getVideoComments);
commentRouter.route("/delete").delete(deleteComment);

export default commentRouter;