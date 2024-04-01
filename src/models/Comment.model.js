import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const Commentschema = new mongoose.Schema({
    content:{
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
Commentschema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment",Commentschema)