import { asyncHandler } from "/Users/abhishekjha/Desktop/video manager/src/utils/aysncHandler.js";
import { Apierror } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    // Trim check
    if (
        [fullName, email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new Apierror(400, "All fields are required");
    }

    // IMPORTANT: await is missing
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new Apierror(
            409,
            "User already exists with this email or username"
        );
    }

    console.log("Files received in controller:", req.files);

    // safer optional chaining
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new Apierror(400, "Avatar is required");
    }

    // upload avatar
    const avatarUploadResponse = await uploadToCloudinary(avatarLocalPath);

    // upload cover image if exists
    const coverImageUploadResponse = coverImageLocalPath
        ? await uploadToCloudinary(coverImageLocalPath)
        : null;

    if (!avatarUploadResponse) {
        throw new Apierror(400, "Avatar upload failed");
    }

    // create user
    const user = await User.create({
        fullName,
        avatar: avatarUploadResponse.secure_url,
        coverImage: coverImageUploadResponse?.secure_url || "",
        email,
        username: username.toLowerCase(),
        password
    });

    // remove sensitive fields
    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new Apierror(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {

    // req body se data lao
    // username ya email se user dhundo
    // password check karo
    // access token generate karo
    // refresh token generate karo and save in db
    // response me access token bhejo

    const { username, password } = req.body;

    if (!username || !password) {
        throw new Apierror(400, "Username and password are required");
    }

    const user = await User.findOne({
        $or: [
            { email: username },
            { username: username.toLowerCase() }
        ]
    }).select("+password +refreshToken");

    if (!user) {
        throw new Apierror(
            404,
            "User not found with this email or username"
        );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new Apierror(401, "Incorrect password");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const loggedinUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );

});

const logoutUser = asyncHandler(async (req, res) => {

    const refreshToken =
        req.cookies?.refreshToken ||
        req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
        throw new Apierror(400, "Refresh token is required");
    }

    const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new Apierror(404, "User not found");
    }

    user.refreshToken = null;

    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
    };

    return res
        .status(200)
        .cookie("refreshToken", "", options)
        .cookie("accessToken", "", options)
        .json(
            new ApiResponse(
                200,
                null,
                "User logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const refreshToken =
        req.cookies?.refreshToken ||
        req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
        throw new Apierror(400, "Refresh token is required");
    }

    const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user) {
        throw new Apierror(404, "User not found");
    }

    if (user.refreshToken !== refreshToken) {
        throw new Apierror(401, "Invalid refresh token");
    }

    const newAccessToken = user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken
                },
                "Access token refreshed successfully"
            )
        );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };