import mongoose from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const TweetSchema = new mongoose.Schema({
    Owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})


TweetSchema.plugin(mongooseAggregatePaginate)

export const Tweet = mongoose.model("Tweet",TweetSchema)