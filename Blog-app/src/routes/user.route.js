const userRoute = require("express").Router();  
const { SignUp, SignIn, UpdateUserDetails, CorrentUser, SignOut, DeleteUser, RefreshAccessToken, Users, DeletSingleUser, GetUser, EditUserRole } = require("../controllers/user.controller.js");
const verifyJwt = require("../middlewares/user.middlewares.js");  
userRoute.route("/signup").post(
    SignUp);  
userRoute.route("/sign-in").post(SignIn);     
userRoute.route("/update-user/:userId").patch(verifyJwt,UpdateUserDetails);
userRoute.route("/update-user-role/:userId").patch(verifyJwt,EditUserRole);
userRoute.route("/me").get(verifyJwt,CorrentUser);
userRoute.route("/sign-out").patch(verifyJwt,SignOut);
userRoute.route("/users").get(verifyJwt,Users); 
userRoute.route("/get-user/:userId").get(GetUser); 
userRoute.route("/delete-user/:userId").delete(verifyJwt,DeleteUser);
userRoute.route("/refreshToken").post(verifyJwt,RefreshAccessToken);
userRoute.route("/singleUser-delete/:userId").delete(verifyJwt,DeletSingleUser);
module.exports = userRoute; 
