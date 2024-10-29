import {Router} from "express"
import { registerUser  , loginUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

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
router.route("/logout").post(verifyJWT /*middleware*/, logoutUser)

export default router
