const { AddComment, GetComments, AddLikes, EditComment, DeleteComment, Comments, DeleteDashComment } = require("../controllers/Comment.controller.js");
const verifyJwt = require("../middlewares/user.middlewares");

const commentRouter = require("express").Router();
commentRouter.route("/create-comment").post(verifyJwt,AddComment);
commentRouter.route("/get-comments/:postId").get(GetComments);
commentRouter.route("/likes/:commentId").post(verifyJwt,AddLikes);
commentRouter.route("/edit-comment/:commentId").patch(verifyJwt,EditComment);
commentRouter.route("/delete-comment/:commentId").delete(verifyJwt,DeleteComment);
commentRouter.route("/comments").get(verifyJwt,Comments);
commentRouter.route("/dashComment/:commentID").delete(verifyJwt,DeleteDashComment);

module.exports = commentRouter;
