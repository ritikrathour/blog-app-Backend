const ApiResponse = require("../utils/ApiResponse.js")
const asyncHandler = require("../utils/asyncHandler.js")
const ApiError = require("../utils/ApiError.js");
const Comment = require("../models/Comment.model.js")
const AddComment = asyncHandler(async (req, res) => {
    const { content, likes, userId, postId } = req.body;
    if (!content || content === "") {
        throw new ApiError(400, "comment is required")
    }
    if (userId !== req.user.id) {
        throw new ApiError(401, "You are not allwed to make a comment.")
    }
    const comment = await Comment.create({
        content, likes, userId, postId
    })
    if (!comment) {
        throw ApiError(401, "Comment not created")
    }
    res.status(201).json(new ApiResponse(200, comment, "Comment Created Successfully"))
})
const GetComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find({ postId: req?.params?.postId }).sort({
        createdAt: -1
    });
    res.status(200).json(new ApiResponse(200, comments, "Get Comments successfully"))

})
const AddLikes = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
        throw new ApiError(400, "comment not found");
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
        comment.numberOfLikes += 1;
        comment.likes.push(req.user.id)
    } else {
        comment.numberOfLikes -= 1;
        comment.likes.splice(userIndex, 1)
    }
    await comment.save();
    res.status(200).json(new ApiResponse(200, comment))
})
const EditComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
        throw new ApiError(400, "comment not found");
    }
    if (comment.userId !== req.user.id) {
        throw new ApiError(403, "you are not allowed to edit this post");
    }
    const editComment = await Comment.findByIdAndUpdate(req.params.commentId,
        {
            content: req.body.content
        }, {
        new: true
    }
    )
    res.status(200).json(new ApiResponse(200, editComment, "Updated comment successfully"))
})
const DeleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
        throw new ApiError(400, "Comment not found");
    }
    if (req.user.id !== comment?.userId) {
        throw new ApiError(403, "You are not allowed to delete this post");
    }
    await Comment.findByIdAndDelete(req.params.commentId)
    res.status(200).json(new ApiResponse(200, {}, "Comment Deleted successfully"));
})
const Comments = asyncHandler(async (req, res) => {
    if (!req.user?.isAdmin) {
        throw new ApiError(400, "Only admin can get these data")
    }
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? 1 : -1;
    const comments = await Comment.find().sort({ createdAt: sortDirection }).skip(startIndex).limit(limit);
    const totalComments = await Comment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
        createdAt: { $gte: oneMonthAgo }
    })
    res.status(200).json(new ApiResponse(200, { comments, totalComments, lastMonthComments }, "get Comments successfully"))
})
const DeleteDashComment = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin && req.user.id != req.params.commentID) {
        throw new ApiError(400, "you are not allowed to delete this comment")
    }
    const deleteCommnet = await Comment.findByIdAndDelete(req.params.commentID);
    if (!deleteCommnet) {
        throw new ApiError(401, "Comment not delete yet")
    }
    res.status(200).json(new ApiResponse(200, {}, "commnet deleted successfully"))
})
module.exports = { AddComment, GetComments, AddLikes, EditComment, DeleteComment, Comments, DeleteDashComment }