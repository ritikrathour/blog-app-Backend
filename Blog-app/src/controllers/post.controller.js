const Post = require("../models/post.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/Cloudinary");
const CreatePost = asyncHandler(async (req, res) => {
    const admin = req.user?.isAdmin; 
    if (!admin) {
        throw new ApiError("You are not allowed to create this post");
    }
    const { title, content, category,blogPostImg } = req.body;
    if (!title && !content && title === "" && content === "") {
        throw new ApiError("All Fields are required..")
    }  
    const slug = req.body.title.split(' ').join('_').toLowerCase().replace(/[^a-zA-Z0-9-]/g, "")
    const post = await Post.create({ 
        title,
        content,
        category,
        image:blogPostImg,
        slug,
        userId: req.user.id, 
    }) 
    res.status(201).json(new ApiResponse(201, post, "Created Post Successfully"))
});

const Posts = asyncHandler(async (req, res) => { 
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const posts = await Post.find({
        ...(req.query.userId && { userId: req.query.userId }),
        ...(req.query.category && { category: req.query.category }),
        ...(req.query.slug && { slug: req.query.slug }),
        ...(req.query.postId && { _id: req.query.postId }),
        ...(req.query.searchTerm && {
            $or: [
                { title: { $regex: req.query.searchTerm, $options: "i" } },
                { content: { $regex: req.query.searchTerm, $options: "i" } },
                { category: { $regex: req.query.searchTerm, $options: "i" } }
            ]
        })
    }).sort({ updatedAt: sortDirection }).skip(startIndex).limit(limit);

    const totalPosts = await Post.countDocuments();
    const now = new Date();

    const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
    )
    const lastMonthPosts = await Post.countDocuments({
        createdAt: { $gte: oneMonthAgo }
    });
    res.status(200).json(new ApiResponse(200, { posts, totalPosts, lastMonthPosts }, "Get posts Successfully"))
})
const DeletePost = asyncHandler(async(req,res)=>{ 
    if(!req.user.isAdmin || req.user.id !== req.params.userId){
        throw new ApiError(403,"You are not allowed to delete this post")
    }
    const deletedPost = await Post.findByIdAndDelete(req.params.postId); 
    if(!deletedPost){
        throw new ApiError(400,"req faild while deleting post")
    }
    res.status(200).json(new ApiResponse(200,"The post has been deleted"))
})
const UpdatePost = asyncHandler(async(req,res)=>{  
    if(!req.user.isAdmin){
        throw new ApiError(403,"You are not allowed to update this post")
    }
    const updatedPost = await Post.findByIdAndUpdate(
        req.params.postId,
        {
            $set :{
                title:req.body.title,
                content:req.body.content,
                category:req.body.category,
                image:req.body.image,

            }
        },
        {
            new:true
        }
    );
    res.status(200).json(new ApiResponse(200,updatedPost,"Post updated successfully"));
})
const UploadeBlogImage = asyncHandler(async(req,res)=>{
    const admin = req.user?.isAdmin;
    if (!admin) {
        throw new ApiError("You are not allowed to create this post");
    }
    console.log(req.body);
    if(!req.body.image?.path){
        throw new ApiError(400,"Blog Image is Empty")
    }
    const blogImage = await uploadOnCloudinary(req.body.image?.path)
    const addedToPost = await Post.create({
        image:blogImage
    });
    res.status(200).json(ApiResponse(200,addedToPost,"Uploade blog image successfully"))
})
module.exports = { CreatePost, Posts,DeletePost,UpdatePost,UploadeBlogImage };