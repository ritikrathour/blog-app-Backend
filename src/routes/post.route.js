const { CreatePost, Posts, DeletePost, UpdatePost, UploadeBlogImage } = require("../controllers/post.controller");
const upload = require("../middlewares/multer.middleware");
const verifyJwt = require("../middlewares/user.middlewares"); 

const postRoute = require("express").Router(); 
postRoute.route("/create-post").post(verifyJwt,CreatePost);
const postImg = upload.single({
    name:"blogImage",
    maxCount:1
})
postRoute.route("/uploadBlogImage").post(verifyJwt,postImg,UploadeBlogImage);
postRoute.route("/posts").get(Posts);
postRoute.route("/posts/:postId/:userId").delete(verifyJwt,DeletePost);
postRoute.route("/posts/:postId/:userId").patch(verifyJwt,UpdatePost);

module.exports = postRoute; 