import { Router } from "express";
import { logOut, loginUser, registerUser,genrateNewAccessToken, changeCurrentPassword, updateAccountDetails, getcurrentUser, updateAvatar, updateCoverImage, getSuscription, watchHistory } from "../controllers/User.controller.js";
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

router.route('/change_password').post(jwtverify,changeCurrentPassword)

router.route('/update_profile').patch(jwtverify,updateAccountDetails)

router.route('/get_current_user').get(jwtverify,getcurrentUser)

router.route('/update_profile_image').patch(jwtverify,upload.single("avatar"),updateAvatar)

router.route('/update_cover_image').patch(jwtverify,updateCoverImage)

router.route('/c/:username').get(jwtverify,getSuscription)

router.route('/history').get(jwtverify,watchHistory)


export default router