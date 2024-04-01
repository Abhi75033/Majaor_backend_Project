import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteOnCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import jsonwebtoken from 'jsonwebtoken';
import mongoose from "mongoose";


const genrateAccessandRefreshToken = async(UserId)=>{
    try {
        const user = await User.findById(UserId)
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return {accessToken,refreshToken}
    } catch (error) {
        throw error
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    
    // Get the user Details from frontend
    const {Username,email,fullname,password} =req.body

    // Validation - not empty
    if([fullname,email,Username,password].some((feild)=>feild?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
    //Check if user already exist: username,email
    const existedUser = await User.findOne({
        $or: [{Username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Either email or username is already exist try with other one")
    }
    //Check for the images, Check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    //checking the path for the coverimage is avalabile ornot
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
    coverImageLocalPath = req.files.coverImage[0].path
    //check the local path for avatar is avalaive or not
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }
    // Upload them to cloudinary, avatar
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   //console.log("req.files:",req.files);
    // Check the avatar is uploded or not
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }
    //create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        coverImage: coverImage?.url || "",
        password,
        Username: Username.toLowerCase()
    })
    // remove password and refresh token field from reponse
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering an user")
    }
    //return response
    return res.status(201).json(
       new ApiResponse(200, createdUser, "The user has been created Successfully") 
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    // Get the data from req.body
    const {email,Username,password} = req.body
    // Validate the username or email
    if(!email && !Username){
        throw new ApiError(400,"Atleast email or usename is required")
    }
    // Find the user
   const user = await User.findOne({
        $or:[{email},{Username}]
    })
    //password check
    const isPassword = await user.isPasswordCorrect(password)
    if(!isPassword){
        throw new ApiError(401,"Your password is incorrect")
    }
    // access and refresh token 
    const {refreshToken,accessToken}= await genrateAccessandRefreshToken(user._id)

    const option={
        httpOnly:true,
        secure:true
        //options is used for extralayer of securiety that no one can change or temper the 
        //access token and refresh token from frontend
    }
    //send cookie

    res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(
            200,
            {
                user:loginUser,accessToken,refreshToken
                
            },
            "User Logedin Successfully"
            )
    )

})

const logOut= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{refreshToken:1}
        },
        {
            new:true
        }
    )
    const option={
        httpOnly:true,
        secure:true
        //options is used for extralayer of securiety that no one can change or temper the 
        //access token and refresh token from frontend
    }

    res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"User loged out")
    )
})
    
const genrateNewAccessToken = asyncHandler(async(req,res)=>{
   const upcomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if (!upcomingRefreshToken) {
    throw new ApiError(401,"Invalid Refresh Token")
   }
   try {
    const decodedToken = jsonwebtoken.verify(upcomingRefreshToken,process.env.REFRESH_TOKEN_SECRECT)
    
    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401,"unAuthriozed request by user")
    }

    if(upcomingRefreshToken !== user.refreshToken){
        throw new ApiError(401,"Unauthrozied request by user !!")
    }

    const option={
        httpOnly:true,
        secure:true
        //options is used for extralayer of securiety that no one can change or temper the 
        //access token and refresh token from frontend
    }

    const {accessToken,newRefreshToken}= await genrateAccessandRefreshToken(user._id)

  return  res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshtoken",newRefreshToken,option)
    .json(
        new ApiResponse(200,{
            "accessToken":accessToken,
            "refreshToken":newRefreshToken
        },"Access Token Refreshed")
    )
            
   } catch (error) {
    throw new ApiError(401,"Un-authrozied request")
   }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {olpassword,Newpassord}= req.body

    console.log(olpassword,Newpassord);

    if(!(olpassword || Newpassord)){
        throw new ApiError(401,"All fields are mandatory")
    }

    const user = await User.findById(req.user?._id)

    const ispasswordCorrect = user.isPasswordCorrect(olpassword)

    if(!ispasswordCorrect){
        throw new ApiError(400,"Invlid oldPassword")
    }

    user.password = Newpassord

    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{fullname:fullname,email:email}
        },
        {new:true}
    ).select("-password")

   return  res
    .status(200)
    .json(new ApiResponse(200,{user},"Deatils updated successfully"))
})

const getcurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"User fetched Successfully"))
})

const updateavatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400,"Cover Image is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400,"Soething Went wrong!!, Wlie uploading avata")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{avatar:avatar.url}
        },
        {new:true}
    )

    return res.status(200).json(
        new ApiResponse(200,user,"avatar Image uploaded successfully")
    )
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    console.log(coverImageLocalPath);

    if (!coverImageLocalPath) {
        throw new ApiError(400,"Cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400,"Soething Went wrong!!, Wlie uploading avata")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{coverImage:coverImage.url}
        },
        {new:true}
    )

    return res.status(200).json(
        new ApiResponse(200,user,"Cover Image uploaded successfully")
    )
})

// Aggregatin Pipleline

const getSuscription = asyncHandler(async(req,res)=>{
  const {username} = req.params

  if (!username) {
    throw new ApiError(400,"usernme is missing")
  }

  const channel = await User.aggregate([
    {
        $match:{
            username: username?.toLowerCase()
        }
    },{
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"Subscribers"
        }
    },{
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"SubscribeTo"
        }
    },
    {
        $addFields:{
                subscribrsCount:{
                    $size:"$Subscribers"
                },
                SubscribeToCount:{
                    $size:"$SubscribeTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id, "$Subscribers.subscriber"]},
                        then: true,
                        else:false
                    }
                }
        }
    },
    {
        $project:{
            fullname:1,
            username:1,
            avatar:1,
            coverImage:1,
            email:1,
            subscribersCount:1,
            SubscribeToCount:1,
            isSubscribed:1
        }
    }
  ])
  
  if (!channel?.length) {
    throw new ApiError(404,"Channel not found")
  }

  console.log(channel);

 return res.status(200).json(
    new ApiResponse(200,channel[0],"Channel fetched successfully")
  )

})


const watchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:'video',
                localField:'whathHistory',
                foreignField:'_id',
                as:'WatchHistory',
                pipeline:[
                    {
                        $lookup:{
                            from:'User',
                            localField:'owner',
                            foreignField:'_id',
                            as:'Owner',
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            Owner:{
                                $first:"$Owner"
                            }
                        }
                    }
                ]
            }
        },
    ])

    if (!user) {
        return res.status(404).json(
            new ApiError(404,"Something went wrong With whathHitory")
        )
    }

    return res.status(200).json(
        new ApiResponse(200,'WatchHistory Fetched Successfully')
    )
})

export {registerUser,loginUser,logOut,genrateNewAccessToken,changeCurrentPassword,
    updateAccountDetails,getcurrentUser,updateavatar,updateCoverImage,getSuscription,watchHistory}