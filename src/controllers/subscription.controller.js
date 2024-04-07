import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/Subscriber.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscriberId = req.user._id
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    const subscription = await Subscription
    .findOne({channel: channelId, subscriber: subscriberId})

    if(subscription){
        await Subscription.findByIdAndDelete(subscription._id)
        return res.status(200).json({
            success: true,
            message: "Unsubscribed successfully"
        })
    }

    await Subscription.create({
        channel: channelId,
        subscriber: subscriberId
    })

    return res.status(200).json({
        success: channel,
        message: "Subscribed successfully"
    })
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
     const {subscriberId} = req.params;
  
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const subscribers = await Subscription.find({subscriber: subscriberId})

    const subscriberList = subscribers.map((subscriber) => {
        return {
            _id: subscriber.channel,
            name: subscriber.channel.name,
            email: subscriber.channel.email,
            avatar: subscriber.channel.avatar,
            createdAt: subscriber.channel.createdAt,
            updatedAt: subscriber.channel.updatedAt
        }
    })

    return  res.status(200).json({
        success: true,
        data: subscriberList
    })
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const channels = await Subscription.find({channel: channelId})
    .populate("channel")

    const channelList = channels.map((channel) => {
        return {
            _id: channel.channel._id,
            name: channel.channel.name,
            email: channel.channel.email,
            avatar: channel.channel.avatar,
            createdAt: channel.channel.createdAt,
            updatedAt: channel.channel.updatedAt
        }
    })

    return res.status(200).json({
        success: true,
        data: channelList
    })
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}