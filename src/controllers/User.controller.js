import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler((req,res)=>{
    res.status(200).json({
        message:"Abhishek-aur-backend"
    })
})

export {registerUser}