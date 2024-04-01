import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
 
// Cloudiary configuration 
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localpath)=>{
try {
    if(!localpath) return null
    const response = await  cloudinary.uploader.upload(localpath,{
        resource_type:"auto",
    })
    // This is the above process for uploading the files on clouinary
   // console.log(`The file has been uplaoded successfully ${response.url}`);
   fs.unlinkSync(localpath)
   //console.log(response);
    return response
} catch (error) {
    fs.unlinkSync(localpath)// file has been unllinked or deleted from our server if the the upoading
    // failed
    return null
}
}

const deleteOnCloudinary = async(public_id)=>{
    try {
        if(!public_id){
            throw new ApiError(400,"Public Id is required")
  }
        const response = await cloudinary.uploader.destroy(public_id)
        return res.status(200).json(
            new ApiResponse(200,{response},"File has been deleted successfully")
        )

        
    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }
}
export {uploadOnCloudinary,deleteOnCloudinary}