import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

const jwtverify = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        console.log(token);

        if(!token){
            throw new ApiError(401,"Invalid AccessToken")
        }

       const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRECT)

      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

      if (!user) {
        throw new ApiError(401,"Invalid Access Token")
      }

     req.user = user
     next()

    } catch (error) {
        throw ApiError(400, "Invalid access Token")
    }
    
})

export {jwtverify}