 const AsyncHandler = require("../utils/asyncHandler.js")
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken")

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Somethin went wrong while generating refresh and access token");
    }
}
const SignUp = AsyncHandler(async (req, res) => { 
    const { userName, email, password, avatar } = req.body;
    if (!userName || !email || !password || userName === "" || email === "" || password === "") {
        throw new ApiError(400, "All filed are required!")
    };
    const IsUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (IsUser) {
        throw new ApiError(400, "User Already Exist With this Email or UserName!")
    }
    const user = await User.create({
        userName, email, password,
        avatar,
    });
    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError(401, "Something went wrong while registering user!")
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User Sign Up successfully!"))
});
const EditUserRole = asyncHandler(async (req, res) => {
    const {isAdmin} = req.body; 
    if (!isAdmin) {
        new ApiError(400, "please check role")
    }
    const user = await User.findById(req.user);
    if (!user) {
        new ApiError(400, "unauthorized request");
    }
    const { accessToken } = await generateAccessTokenAndRefreshToken(user?._id);
    const updateRole = await User.findByIdAndUpdate(req.user, {
        $set: {
            isAdmin:req.body?.isAdmin
        }
    }, {
        new: true
    })
    return res.status(200).cookie("accessToken", accessToken, { maxAge: 3 * 24 * 60 * 60 * 1000 }).json(new ApiResponse(200, updateRole, accessToken,"User Role Updated Successfully..."))
})
const SignIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
        throw new ApiError(400, "All filed are required!")
    };
    const user = await User.findOne({
        $or: [{ email }]
    })
    if (!user) {
        throw new ApiError(400, "User Not Find With this Email or username");
    };
    const checkPassword = await user.IsCorrectPassword(password);
    if (!checkPassword) {
        throw new ApiError(401, "Invalid Password!")
    }
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    const signInUser = await User.findById(user._id).select("-password -refreshToken");
    if (!signInUser) {
        throw new ApiError(401, "SomeThing went wrong!")
    }
    const options = {
        secure: true,
        httpOnly: true,
        sameSite:true,
        
    }
    res.status(200)
        .cookie("accessToken", accessToken, {
            secure: true,
            httpOnly: true,
            sameSite:true, maxAge: 5 * 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, {
            secure: true,
            httpOnly: true,
            sameSite:true,
            maxAge: 7 * 24 * 60 * 60 * 1000 }).json(
            new ApiResponse(200, { user: signInUser, accessToken }, "User Sign in successfully")
        )

})
const UpdateUserDetails = asyncHandler(async (req, res) => {
    const { userName, email, password,avatar } = req.body;
    if (req.user.id !== req.params.userId) {
        throw new ApiError(400, "unauthorized request")
    }
    const IsUpdatedUser = await User.findByIdAndUpdate(req.params.userId, {
        $set: {
            userName,
            email,
            password,
            avatar
        }
    }, { new: true });
    const updatedUser = await User.findById(IsUpdatedUser._id).select("-password -refreshToken");
    // return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "User Updated Successfully..."))
})
const CorrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "current user fetched successfully"))
});
const Users = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
        throw new ApiError(403, "You are not allowed to get users");
    }
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const users = await User.find().sort({ createdAt: sortDirection }).skip(startIndex).limit(limit);

    const UsersWithoutPassword = users.map((user) => {
        const { password, ...rest } = user._doc;
        return rest
    })
    const now = new Date();
    const totalUsers = await User.countDocuments();
    const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
    )
    const lastMonthUsers = await User.countDocuments({
        createdAt: { $gte: oneMonthAgo }
    })

    res.status(200).json(new ApiResponse(200, { users: UsersWithoutPassword, totalUsers, lastMonthUsers }, "get User successfully"))
})
const DeleteUser = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId) {
        throw new ApiError(403, "Unauthorized request");
    }
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
        throw new ApiError(401, "something went wrong")
    }
    const options = {
        httpOnly: true,
        secure: true ,
        sameSite:true
    }
    res.status(200).clearCookie("accessToken", { expire: 360000 + Date.now() }, options).clearCookie("refreshToken", options).json(new ApiResponse(200, "User has been deleted"))
})
const SignOut = asyncHandler(async (req, res) => {
    console.log("snkdfhs");
    await User.findByIdAndUpdate(req.user?._id, {
        $unset: {
            refreshToken: 1
        }
    }, {
        new: true
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged Out!"))
})
const RefreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefeshToken = req.cookies?.accessToken || req.body.refreshToken;
    if (!incommingRefeshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }
    const decodedRefreshToken = jwt.verify(incommingRefeshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedRefreshToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refreshToken");
    }
    if (incommingRefeshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user?._id);
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, { accessToken, refreshToken }, "accessToken refreshed"));
})
const DeletSingleUser = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
        throw new ApiError(403, "You are not allowed to delete this user");
    }
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
        throw new ApiError(401, "something went wrong")
    }
    res.status(200).json(new ApiResponse(200, "user deleted successfully"))
})
const GetUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
        throw new ApiError(400, "User Not found");
    }
    res.status(200).json(new ApiResponse(200, user, "User get Successfully"))
})

module.exports = { SignUp, SignIn, EditUserRole, UpdateUserDetails, DeleteUser, CorrentUser, SignOut, RefreshAccessToken, Users, DeletSingleUser, GetUser };
