import { asyncHandeler } from '../utils/asyncHandeler.js'
import { ApiError } from '../utils/ApiError.js'
import User from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { createRef } from 'react'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandeler(async (req, res) => {
    // WHAT ALL STEPS WILL BE THERE A USER WILL GET REGISTER?
    // 1.GET USERNAME FROM FRONTEND(ABI TO FROM POSTMAN).
    // 2.CHECK IF USER IS ALREADY REGISTERED OR NOT:VIA USERNAME/EMAIL.
    // 3.CHECK FOR THE IMAGES/AVATAR.
    // 4.UPLOAD THEM ON CLOUDINARY(AVATAR).
    // 5.CREATE AN USER OBJECT - CREATE ENTRY IN DB.
    // 6.REMOVE PASSWORD, REFRESH TOKEN FROM RESPONSE
    // 7.CHECK FOR USER CREATION.
    // 8.RETURN RES.

    const { email, fullname, password } = req.body;

    // console.log(email);
    // console.log(fullname);
    // console.log(password);

    if (
        [fullname, email, password].some((field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, 'All Fields Are Required!!..')
    }

    // User.findOne({email})//for single

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User Already Exists.");
    }
    console.log("AYA");

    // console.log(existedUser);
    // console.log(req.files);
    // console.log();
    // console.log();


    const avatarLocalPath = req.files.avatar[0]?.path
    const coverImageLocalPath = req.files.coverImage[0]?.path

    if (avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required!!!....")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (avatar) {
        throw new ApiError(400, "Avatar File is Required!!!....")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refrshToken"//jo jo nahi chahiye uske uske agee minus sign lagado.
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong!!..")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})

export default registerUser