import {Router} from "express"
import { registerUser  ,logoutUser, loginUser , refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyJWT } from './../middlewares/auth.middleware';

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),

    //method se pehle middleware use karlo
    registerUser)
//router.route("/login").post(registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/update-account").patch(verifyJWT , updateAccountDetails)
router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)

router.route("/cover-image").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage)

router.route("/c/:username").get(verifyJWT , getUserChannelProfile)   //becoz of req.params

router.route("/history").get(verifyJWT , getWatchHistory)

export default router
