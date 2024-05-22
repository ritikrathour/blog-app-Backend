const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const app = express();
const userRoute = require("./routes/user.route.js"); 
const postRoute = require("./routes/post.route.js");
const commentRouter = require("./routes/Comment.route.js");
const path = require("path")

// cors setup 
app.use(cors({
    origin:"https://mern-stack-blog-app-alpha.vercel.app",
    credentials:true
})); 
// middleweares
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")))

app.use("/api/v1/user",userRoute); 
app.use("/api/v1/post",postRoute); 
app.use("/api/v1/comment",commentRouter);
 
module.exports = app;
