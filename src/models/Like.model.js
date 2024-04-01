import mongoose, { Schema } from "mongoose";

const LikeSchema = new mongoose.Schema({
    comments:{
        type: Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"video"
    },
    Owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{timestamps:true})

export const Like = mongoose.model("Like",LikeSchema)