import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const genrateAccessandRefreshToken = async(User_Id)=>{
    try {
        const user = await User.findById(User_Id)
        const accessToken= user.AccessTokenGenrator()
        const refreshToken = user.RefreshTokenGenrator()
        user.RefreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Internal Sever Error!! while genrating Access and Refresh Token")
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
    if(!email || !Username){
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
            $set:{refreshToken:undefined}
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
})
    

export {registerUser,loginUser,logOut}