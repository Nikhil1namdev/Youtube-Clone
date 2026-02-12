import { Router } from "express";
import { loginUser, registerUser ,logoutUser} from "../controllers/user.controller.js";
import {upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    //middleware use kiya bich me 
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
    ]),
    registerUser)

router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(
    //middleware use kiya bich me verifyJWT jisse use ka access ho logout ke liye
    verifyJWT,
    logoutUser)

export default router   