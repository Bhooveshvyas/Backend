import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controller/user.controller.js'


const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ])
    , registerUser);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route('/refresh-token').post(refreshAccessToken)
export default router;