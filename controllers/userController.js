import asyncErrorHandler from "../middleware/catchAsyncErrors.js"
import User from "../models/userModel.js"
import ErrorHandler from "../utils/errorhandler.js"
import sendToken from "../utils/jwtToken.js"
import sendEmail from "../utils/sendEmail.js"
import crypto from "crypto";
import cloudinary from "cloudinary";

// * Register a User
export const registerUser = asyncErrorHandler(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    })

    const { name, email, password } = req.body

    const users = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    })

    sendToken(users, 201, res)
})

//* Login User
export const loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body

    //  Check if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400))
    }

    //  Finding user in database
    const user = await User.findOne({
        email,
    }).select("+password")

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401))
    }

    //  Check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401))
    }

    sendToken(user, 200, res)
})

//* Logout User
export const logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logged out",
    })
})

//! Later modification Required for Compatibility

//* Forgot Password
export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404))
    }

    //  Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({
        validateBeforeSave: false,
    })

    // ${req.protocol}://${req.get(
    //     "host"
    // )}
    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`

    const message = `Your password reset token is temp :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: "LocalStore Password Recovery",
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email} successfully`,
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({
            validateBeforeSave: false,
        })

        return next(new ErrorHandler(error.message, 500))
    }
})

//* Reset Password
export const resetPassword = asyncErrorHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    })

    if (!user) {
        return next(
            new ErrorHandler(
                "Password reset token is invalid or has been expired",
                400
            )
        )
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400))
    }

    // Setup new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
})

//* Get User Details
export const getUserDetails = asyncErrorHandler(async (req, res) => {
    const { id } = req.user
    const user = await User.findById(id)

    res.status(200).json({
        success: true,
        user,
    })
})

//* Update User Password
export const updatePassword = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.user
    const user = await User.findById(id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400))
    }

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)
})

//* Update User Profile
export const updateProfile = asyncErrorHandler(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }
    //* Will add Cloudinary later
    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        user,
    })
})

// ------------------ ADMIN PANEL ------------------ //

//* Get all Users --- ADMIN ONLY
export const getAllUser = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users,
    })
})

//* Get Single User Details --- ADMIN ONLY
export const getSingleUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
        )
    }

    res.status(200).json({
        success: true,
        user,
    })
})

//* Update User Role --- ADMIN ONLY
export const updateUserRole = asyncErrorHandler(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        )
    }

    res.status(200).json({
        success: true,
    })
})

//* Delete User --- ADMIN ONLY
export const deleteUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        )
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne()

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    })
})
