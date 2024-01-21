import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, //one who subscribes
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, //one to whom subscriber, subscribes
            ref: "User"
        },
    }, 
    {timestamps:true})

export const  Subscricption = mongoose.model("Subscricption", subscriptionSchema)