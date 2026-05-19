import { Router } from 'express';
import {
    getNotifications,
    markNotificationAsRead,
    clearAllNotifications
} from '../controllers/notification.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route("/").get(getNotifications);
router.route("/clear").delete(clearAllNotifications);
router.route("/:notificationId/read").patch(markNotificationAsRead);

export default router;
