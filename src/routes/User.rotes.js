import { Router } from "express";
import { logOut, loginUser, 
    registerUser,genrateNewAccessToken, changeCurrentPassword, 
    updateAccountDetails, getcurrentUser, updateavatar, updateCoverImage,
     getSuscription, watchHistory } from "../controllers/User.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { jwtverify } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    //middleware
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,registerUser
    ) 

router.route('/login').post(loginUser)

router.route('/logout').post(jwtverify ,logOut)

router.route("/refreshAccessToken").post(genrateNewAccessToken)

router.route('/accessToken').post(jwtverify,genrateNewAccessToken)

router.route('/changepass').post(jwtverify,changeCurrentPassword)

router.route('/update_profile').patch(jwtverify,updateAccountDetails)

router.route('/get_current_user').get(jwtverify,getcurrentUser)

router.route('/update_avatar').patch(jwtverify, upload.single('avatar'),updateavatar)

router.route('/update_cover_image').patch(jwtverify,upload.single('coverImage'),updateCoverImage)

router.route('/c/:username').get(jwtverify,getSuscription)

router.route('/history').get(jwtverify,watchHistory)


export default router