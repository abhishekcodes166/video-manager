import {Router} from 'express';
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getcurrentUser,
    updateProfile,
    getuserprofile,
    getWatchHistory,
    searchUsers
} from '../controllers/user.controllers.js';
import {upload} from '../middlewares/multer.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

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
    registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, getcurrentUser);
router.route("/update-account").patch(verifyJWT, updateProfile);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateProfile);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateProfile);
router.route("/c/:username").get(verifyJWT, getuserprofile);
router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/search").get(verifyJWT, searchUsers);

export default router;