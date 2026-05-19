import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Apierror } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadToCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pipeline = [];

    // search query
    if (query) {
        pipeline.push({
            $match: {
                title: {
                    $regex: query,
                    $options: "i"
                }
            }
        })
    }

    // if userId provided, fetch videos of that user
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new Apierror(400, "Invalid userId");
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    // only fetch published videos
    pipeline.push({
        $match: {
            isPublished: true
        }
    })

    // sorting
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        })
    } else {
        pipeline.push({
            $sort: {
                createdAt: -1
            }
        })
    }

    // lookup for owner details
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        fullName: 1,
                        username: 1,
                        avatar: 1
                    }
                }
            ]
        }
    })

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new Apierror(400, "All fields are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new Apierror(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new Apierror(400, "Thumbnail is required");
    }

    const videoFile = await uploadToCloudinary(videoFileLocalPath);
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new Apierror(500, "Failed to upload video file");
    }

    if (!thumbnail) {
        throw new Apierror(500, "Failed to upload thumbnail");
    }

    const video = await Video.create({
        title,
        description,
        // Cloudinary duration is usually available in the upload response
        duration: videoFile.duration || 0,
        videoFile: videoFile.secure_url,
        thumbnail: thumbnail.secure_url,
        owner: req.user?._id,
        isPublished: true
    })

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new Apierror(500, "Failed to upload video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoUploaded, "Video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId).populate("owner", "fullName username avatar");

    if (!video) {
        throw new Apierror(404, "Video not found");
    }

    // Increment views
    video.views += 1;
    await video.save({ validateBeforeSave: false });

    // Add to user watch history if logged in
    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $pull: { watchHistory: videoId }
            }
        );
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: { watchHistory: { $each: [videoId], $position: 0 } }
            }
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new Apierror(403, "You can't edit this video");
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (req.file?.path) {
        const thumbnailLocalPath = req.file.path;
        const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

        if (!thumbnail) {
            throw new Apierror(500, "Failed to upload thumbnail");
        }

        updateData.thumbnail = thumbnail.secure_url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateData
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new Apierror(403, "You can't delete this video");
    }

    // In a real app we'd also delete files from Cloudinary here
    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new Apierror(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new Apierror(403, "You can't toggle publish status for this video");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
