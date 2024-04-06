import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import { jwtverify } from '../middlewares/auth.middleware.js';
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(jwtverify); // Apply verifyJWT middleware to all routes in this file

router
    .route("/video_upload")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single('thumbnail'), updateVideo);

router.route("/toggle/publish/:videoId").get(togglePublishStatus);

export default router