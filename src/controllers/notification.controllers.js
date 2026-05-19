import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { Apierror } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        recipient: req.user?._id
    })
        .populate("sender", "username fullName avatar")
        .populate("video", "title thumbnail")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
        throw new Apierror(400, "Invalid notificationId");
    }

    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            recipient: req.user?._id
        },
        {
            $set: { isRead: true }
        },
        {
            new: true
        }
    );

    if (!notification) {
        throw new Apierror(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read successfully")
    );
});

const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({
        recipient: req.user?._id
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications cleared successfully")
    );
});

export {
    getNotifications,
    markNotificationAsRead,
    clearAllNotifications
};
