import { Router } from "express";
import { logOut, loginUser, registerUser } from "../controllers/User.controller.js";
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

export default router