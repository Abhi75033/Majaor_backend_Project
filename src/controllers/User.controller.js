import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
    
    // Get the user Details from frontend
    const {Username,email,fullname,password} =req.body

    // Validation - not empty
    if([fullname,email,Username,password].some((feild)=>feild?.trim()==="")){
        throw new ApiError(400,"All fields are reqired")
    }
    //Check if user already exist: username,email
    const existedUser = User.findOne({
        $or: [{Username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Either email or username is already exist try with other one")
    }
    //Check for the images, Check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.CoverImage[0]?.path
    //check the local path for avatar is avalaive or not
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }
    // Upload them to cloudinary, avatar
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // Check the avatar is uploded or not
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }
    //create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        coverImage: coverImage?.url,
        password,
        Username: Username.toLowerCase()
    })
    // remove password and refresh token field from reponse
    const createdUser = User.findById(user._id).select("-password -refreshToken")
    //check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while regitering an user")
    }
    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User has been created or regiester successfully")
    )
})

    

export {registerUser}