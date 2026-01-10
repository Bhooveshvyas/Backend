import { asyncHandeler } from '../utils/asyncHandeler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

// HUM TOKENS KA METHOD ISLIE BANARHE HAI KYOKI BAR BAR USE HOGA YEH

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Somethign went wrong while generating `access` token.")
    }
}


const registerUser = asyncHandeler(async (req, res) => {

    console.log("REQ.FILES 👉", req.files);
    console.log("REQ.FILE 👉", req.file);
    // WHAT ALL STEPS WILL BE THERE A USER WILL GET REGISTER?
    // 1.GET USERNAME FROM FRONTEND(ABI TO FROM POSTMAN).
    // 2.CHECK IF USER IS ALREADY REGISTERED OR NOT:VIA USERNAME/EMAIL.
    // 3.CHECK FOR THE IMAGES/AVATAR.
    // 4.UPLOAD THEM ON CLOUDINARY(AVATAR).
    // 5.CREATE AN USER OBJECT - CREATE ENTRY IN DB.
    // 6.REMOVE PASSWORD, REFRESH TOKEN FROM RESPONSE
    // 7.CHECK FOR USER CREATION.
    // 8.RETURN RES.

    const { email, fullName, password, userName } = req.body;

    if (
        [fullName, email, password, userName].some((field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, 'All Fields Are Required!!..')
    }

    // User.findOne({email})//for single

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    console.log(email);
    console.log(fullName);
    console.log(password);

    if (existedUser) {
        throw new ApiError(409, "User Already Exists.");
    }

    // console.log(existedUser);
    // console.log(req.files);
    // console.log();
    // console.log();


    const avatarLocalPath = req.files?.avatar?.[0]?.path
    console.log("AYA");
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required!!!....")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar File is Required!!!....")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName?.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"//jo jo nahi chahiye uske uske agee minus sign lagado.
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong!!..")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})

const loginUser = asyncHandeler(async (req, res) => {
    console.log("LOGIN HIT", req.body);
    // WHAT ALL THINGS TO DO WHEN LOGIN
    // 1.TAKE DATA FROM REQ,BODY
    // 2.USERNAME / EMAIL, PASSWORD
    // 3.FIND USER
    // 4.IF EMAIL IS NOT REGISTERED (SIGN-UP{REGISTER})
    // 5.USERNAME / EMAIL / PASSWORD WRONG
    // 6.IF EVERYTHIGN VERRIFIED THEN GRANT THE USER BOTH ACCESS AND REFRESH TOKEN
    // 7.SENT TOKENS IN COKIES

    // 1.TAKE DATA FROM REQ,BODY
    const { userName, email, password } = req.body;

    // 2.USERNAME / EMAIL, PASSWORD
    if (!userName && !email) {
        throw new ApiError(400, "Username  or email is Required.");
    }

    // 3.FIND USER
    // 4.IF EMAIL IS NOT REGISTERED (SIGN-UP{REGISTER})
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);


    // 5.USERNAME / EMAIL / PASSWORD WRONG
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Wrong Credentials!!..");
    }
    // 6.IF EVERYTHIGN VERRIFIED THEN GRANT THE USER BOTH ACCESS AND REFRESH TOKEN
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // JUST AN OBJECT, BY WHICH ONLY SERVER CAN MODIFY OUR COOKIES.
    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
})


const logoutUser = asyncHandeler(async (req, res) => {
    // STEPS -> 
    // CLEAR COOKIES
    // CLEAR TOKENS

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully."))
})


const refreshAccessToken = asyncHandeler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unautorized Error!!!!!!!!!!!!......")
    }


    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token.")
        }

        if (incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, "Refresh token expired.")

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("access token:", accessToken, options)
            .cookie("`refresh` token:", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }),
                "Access token refreshed"
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token.")
    }

})

const changeCurrentPassword = asyncHandeler(async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;//user se dono cheez li

    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "New Password does not matches.")
    }

    const user = await User.findById(req.user?._id)//old password check krne k liye user lagega.

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!oldPassword) {
        throw new ApiError(400, "Invalid Old Password.")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed."))
})

const getCurrentUser = asyncHandeler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fetched successfully.")
})

const updateAccountDetails = asyncHandeler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName && !email)
        throw new ApiError(400, "All fields are required.")

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email//dono syntax same hi hai iske upr fullName jesa likha hai wese bi likh skte hai
            }
        },
        { new: true }//after updation wala user return krdega.
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully."))
})

const updateUserAvatar = asyncHandeler(async (req, res) => {
    const localAvatarPath = req.file?.path

    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar file is missing.")
    }

    const avatar = await uploadOnCloudinary(localAvatarPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar Uploaded"));
})


const updateUserCoverImage = asyncHandeler(async (req, res) => {
    const localCoverImage = req.file?.path

    if (!localCoverImage) {
        throw new ApiError(400, "Cover-Image file is missing.")
    }

    const coverImage = await uploadOnCloudinary(localCoverImage);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading Cover-Image.")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage: coverImage.url }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Cover-Image Uploaded"))
})


// PIPELINE KA KAM DATA KO FILTER OUT KRNA.
const getUserChannelProfile = asyncHandeler(async (req, res) => {
    const { username } = req.params;
    // PIPELINE KA KAM DATA KO FILTER OUT KRNA.
    if (!username?.trim()) {
        throw new ApiError(400, "username is misssing.")
    }

    const channel = await User.aggregate([
        {//kon kon si data feilds ye wali condition satisfy ka rrhi hai
            $match: {
                username: username?.toLowerCase()//https://chaicode.com/->chaicode
            }
        },
        {//apko kitno ne subscribe kr rkha hai.
            $lookup: {
                from: "subscrptions",
                localField: "_id",//current model(jaha tu abi hai{channel}) ka field(_id).
                foreignField: "channel",//jis model(jaha join krna hai) ka field(channel._id).
                as: "subscribers"//kis kis ne subscribe kr rkha hai
            }
        },
        {//apne kitno ko subscribe kr rkha hai.
            $lookup: {
                from: "subscrptions",
                localField: "_id",//current model(jaha tu abi hai{channel}) ka field(_id).
                foreignField: "subscriber",//jis model(jaha join krna hai) ka field(channel._id).
                as: "subscriberedTo"//jisko subscribe kr rkha hai
            }
        },
        {//jo data pehle se hi jarha hai uske sath aur additional data konsa jayega.
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscriberedToCount: {
                    $size: "$subscriberedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                            then: true,
                            else: false
                        }
                    }
                }
            }
        },
        {//data konsa konsa jayega.
            $project: {
                fullName: 1,
                userName: 1,
                subscriberCount: 1,
                channelSubscriberedToCount: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist.")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(201, channel[0], "User channel fetched successfully.")
        )
})

const getWatchHistory = asyncHandeler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history Fetched successfully."
        ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile, getWatchHistory
};