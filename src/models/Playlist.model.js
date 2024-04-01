import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const PlaylistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true 
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"video"
    },
    Owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

PlaylistSchema.plugin(mongooseAggregatePaginate)

export const Playlist = mongoose.model("Playlist",PlaylistSchema)
