import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { MoreHorizontal, MessageCircle, Send, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { Dialog, DialogContent, DialogDescription, DialogTrigger, DialogTitle } from "./ui/dialog";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setAuthUser } from "@/redux/authSlice";

export default function Post({ post }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id) ?? false);
  const [postLike, setPostLike] = useState(post.likes?.length ?? 0);
  const [comment, setComment] = useState(post.comments ?? []);
  const [bookmarked, setBookmarked] = useState(
    (user?.bookmarks ?? []).some((id) => String(id) === String(post?._id)),
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setBookmarked((user?.bookmarks ?? []).some((id) => String(id) === String(post?._id)));
  }, [user?.bookmarks, post?._id]);

  const authorId = post?.author?._id ?? post?.author;
  const isOwnPost =
    user?._id && authorId && String(user._id) === String(authorId);

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const likeOrDislikeHandler = async () => {
    try {
      const endpoint = liked ? "dislike" : "like";
      const res = await axios.post(
        `/api/v1/post/${post._id}/${endpoint}`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        const newCount = liked ? postLike - 1 : postLike + 1;
        setPostLike(newCount);
        setLiked(!liked);

        const updatedPosts = (posts ?? []).map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? (p.likes || []).filter((id) => id !== user?._id)
                  : [...(p.likes || []), user?._id],
              }
            : p,
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update like");
    }
  };

  const commentHandler = async () => {
    if (!text?.trim()) return;
    try {
      const res = await axios.post(
        `/api/v1/post/${post?._id}/comment`,
        { text: text.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        const newComment = res.data.comment;
        const updatedCommentData = [...comment, newComment];
        setComment(updatedCommentData);
        setText("");

        const updatedPosts = (posts ?? []).map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p,
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message || "Comment added");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const deletePostHandler = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await axios.delete(
        `/api/v1/post/delete/${post._id}`,
        { withCredentials: true },
      );
      if (res.data?.success) {
        const updatedPosts = (posts ?? []).filter(
          (item) => String(item._id) !== String(post._id),
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message || "Post deleted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.post(
        `/api/v1/post/${post._id}/bookmark`,
        {},
        { withCredentials: true },
      );

      if (res.data?.success) {
        const currentBookmarks = user?.bookmarks ?? [];
        const isSaved = res.data?.type === "saved";
        const updatedBookmarks = isSaved
          ? Array.from(new Set([...currentBookmarks, post._id]))
          : currentBookmarks.filter((id) => String(id) !== String(post._id));

        setBookmarked(isSaved);
        dispatch(
          setAuthUser({
            ...user,
            bookmarks: updatedBookmarks,
          }),
        );
        toast.success(res.data.message || (isSaved ? "Post saved" : "Post unsaved"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bookmark");
    }
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture || undefined} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
            <h1>{post.author?.username}</h1>
            {user?._id == post.author._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex-col items-center text-sm text-center">
            <DialogTitle className="sr-only">Post Options</DialogTitle>
            <DialogDescription className="sr-only">
              Options for interacting with this post.
            </DialogDescription>
            <Button
              variant="ghost"
              className="cursor-pointer w-fit text-[#ED4956] font-bold"
            >
              Unfollow
            </Button>
            <Button variant="ghost" className="cursor-pointer w-fit">
              Add to favorites
            </Button>
            {isOwnPost && (
              <Button
                type="button"
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit text-red-600 font-medium"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_img"
      />
      <div className="">
        <div className="flex items-center justify-between my-2">
          <div className="flex items-center gap-3">
            {liked ? (
              <FaHeart
                onClick={likeOrDislikeHandler}
                size={24}
                className="cursor-pointer text-red-600"
              />
            ) : (
              <FaRegHeart
                onClick={likeOrDislikeHandler}
                size={22}
                className="cursor-pointer hover:opacity-80"
              />
            )}
            <MessageCircle
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="cursor-pointer hover:text-gray-600"
            />
            <Send className="cursor-pointer hover:text-gray-600" />
          </div>
          <Bookmark
            onClick={bookmarkHandler}
            className={`cursor-pointer hover:text-gray-600 ${bookmarked ? "fill-black text-black" : ""}`}
          />
        </div>
        <span className="font-medium block mb-2">{postLike} likes</span>
        <p>
          <span className="font-medium mr-2">{post.author?.username}</span>
          {post.caption}
        </p>
        {comment.length > 0 && (
          <span
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer text-sm text-gray-400 hover:underline"
          >
            {" "}
            View all {comment?.length ?? 0} comments
          </span>
        )}
        <CommentDialog open={open} setOpen={setOpen} />
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="outline-none text-sm w-full bg-white text-black placeholder:text-gray-500 border border-gray-200 rounded px-2 py-1"
          />
          {text?.trim() && (
            <button
              type="button"
              onClick={commentHandler}
              className="text-[#3BADF8] font-semibold cursor-pointer bg-transparent border-none p-0 hover:opacity-80 disabled:opacity-50"
            >
              Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
