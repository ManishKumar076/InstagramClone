import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

// Create a post (image upload optional if using cloudinary middleware)
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const authorId = req.id;
    let imageUrl = null;

    if (req.file) {
      // If file buffer provided, upload to cloudinary
      const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      imageUrl = cloudResponse.secure_url;
    }

    if (!imageUrl) return res.status(400).json({ message: "Image required", success: false });

    const post = await Post.create({ caption, image: imageUrl, author: authorId });
    await post.populate({ path: "author", select: "-password" });

    // attach post to user
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    return res.status(201).json({ message: "New post added", post, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({ path: "comments", populate: { path: "author", select: "username profilePicture" } });
    return res.status(200).json({ posts, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({ path: "comments", populate: { path: "author", select: "username profilePicture" } });
    return res.status(200).json({ posts, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });
    // update likes
    await post.updateOne({ $addToSet: { likes: userId } });

    // update likes
    await post.updateOne({ $addToSet: { likes: userId } });

    return res.status(200).json({ message: "Post liked", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });
    await post.updateOne({ $pull: { likes: userId } });
    return res.status(200).json({ message: "Post disliked", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required", success: false });
    const comment = await Comment.create({ text, author: authorId, post: postId });
    const post = await Post.findById(postId);
    if (post) {
      post.comments.push(comment._id);
      await post.save();
    }
    await comment.populate({ path: "author", select: "username profilePicture" });
    return res.status(201).json({ message: "Comment Added", comment, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate("author", "username profilePicture").sort({ createdAt: -1 });
    return res.status(200).json({ comments, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: `Post not found`, success: false });
    if (post.author.toString() !== authorId) return res.status(403).json({ message: "unauthorized" });
    await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ post: postId });
    const user = await User.findById(authorId);
    if (user) {
      user.posts = user.posts.filter((id) => id.toString() !== postId);
      await user.save();
    }
    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });
    const user = await User.findById(authorId);
    if (!user) return res.status(404).json({ message: "User not found", success: false });
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      return res.status(200).json({ type: "unsaved", message: "Post removed from bookmarks", success: true });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      return res.status(200).json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
