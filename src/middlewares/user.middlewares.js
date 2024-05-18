const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js")
const verifyJwt = asyncHandler(async (req , _ , next) => {
try {   
    const token = req?.cookies?.accessToken || req.header("Authorization") // for mobile cookies   
        if (!token) {
            throw new ApiError(401, "Unauthorised requiest");
        };
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);  
        const user = await User.findById(decodedToken?._id);  
        if (!user) {
            throw new ApiError(401, "Invalid access Token")
        };  
        req.user = user; 
        next();
    } catch (error) {
        console.log(error);
        throw new ApiError(401, error?.message || "Invalid access token")
    }
}); 
module.exports = verifyJwt;