import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'
 
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

export {uploadOnCloudinary}