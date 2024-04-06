import mongoose, {isValidObjectId} from "mongoose"
import { video } from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import cloudinary from "cloudinary"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {},
    };

    if (sortBy) {
        options.sort[sortBy] = sortType || "asc";
    }

    let filter = {};
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user id");
        }
        filter.owner = userId;
    }

    const videos = await video.paginate(filter, options);
   
    if (!videos) {  
        throw new ApiError(404, "No videos found");
    }

    res.status(200).json({
        success: true,
        data: videos,
    });
   
    
})



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!(title && description)){
        throw new ApiError(400,"Tittle and Description is required")
    }

    const videoFileLocalPath = req.files['videoFile'][0].path
    console.log(videoFileLocalPath);
    const thumbnailLocalPath = req.files['thumbnail'][0].path
    console.log(thumbnailLocalPath);

    

    if (!(videoFileLocalPath && thumbnailLocalPath)) {
        throw new ApiError(400,"video or thumbnail file is missing")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    if (!(videoFile.url && thumbnailFile.url)) {
        throw new ApiError(400,"Something went wrong while uploding videoFile or ThumbnailFile")
    }

    const videos = await video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        title,
        description,
        duration: 0,
        owner: req.user._id
    })

    if (!videos) {
        throw new ApiError(400,"Error File Video not uploaded successfully")
    }

    res.status(200).json(
        new ApiResponse(200,videos,"Video Uploded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid videoId")
    }

    const videos = await video.findById(videoId).populate("owner","name email")

    if (!videos) {
        throw new ApiError(404,"Video not found")
    }

    

    res.status(200).json(
        new ApiResponse(200,videos,"Video Fetched Successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file.path

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid videoId")
    }

    const videos = await video.findById(videoId)

    const thumbnailToDelete = videos.thumbnail.split("/").pop()

    
    if (!videos) {
        throw new ApiError(404,"Video not found")
    }

    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnailFile.url) {
        throw new ApiError(400,"Something went wrong while uploding thumbnailFile")
    }

    const updatedVideo = await video.findByIdAndUpdate(videoId,{
        title,
        description,
        thumbnail:thumbnailFile.url
    },{new:true})

    if (!updatedVideo) {
        throw new ApiError(400,"Error File Video not updated successfully")
    }

   const deleted =  await cloudinary.uploader.destroy(thumbnailToDelete)



    res.status(200).json(
        new ApiResponse(200,updatedVideo,"Video Updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid videoId")
    }
    
    const deleteVideo = await video.findByIdAndDelete(videoId)

    if (!deleteVideo) {
        throw new ApiError(404,"Video not found")
    }

    const thumbnailToDelete = deleteVideo.thumbnail.split("/").pop()
    const videoToDelete = deleteVideo.videoFile.split("/").pop()
    
    const deleted =  await cloudinary.uploader.destroy(thumbnailToDelete)
    const deletedVideo =  await cloudinary.uploader.destroy(videoToDelete)

    if (!deleted && !deletedVideo) {
        throw new ApiError(400,"Error File Video not deleted successfully")
    }

return res.status(200).json(
    new ApiResponse(200,{},"video Deleted Successully")
)
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid VedioId")
    }

    const videos = await video.findById(videoId)

    if (videos.isPublished==true) {
        return res.status(200).json(
            new ApiResponse(200,"Status: Published successfully")
        )
    }else{
        throw new ApiError(400,"Status: Failed to Published")
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
