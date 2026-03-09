import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
	addNewPost,
	getAllPost,
	getUserPost,
	likePost,
	dislikePost,
	addComment,
	getCommentsOfPost,
	deletePost,
	bookmarkPost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/addpost", isAuthenticated, upload.single("image"), addNewPost);
router.get("/all", getAllPost); // public feed
router.get("/userpost/all", isAuthenticated, getUserPost);
router.post("/:id/like", isAuthenticated, likePost);
router.post("/:id/dislike", isAuthenticated, dislikePost);
router.post("/:id/comment", isAuthenticated, addComment);
router.get("/:id/comment/all", getCommentsOfPost);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.post("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;