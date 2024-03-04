import mongoose, {Schema} from "mongoose";

const likeScehma = new Schema(
    {
        typeOfContent: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        LikedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {timestamps: true}
)

export const Like = mongoose.model("Like", likeScehma)