import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import Comment from "./Comment";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

export default function CommentDialog({ open, setOpen }) {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { selectedPost } = useSelector((store) => store.post);
  const { posts } = useSelector((store) => store.post);

  const postId = selectedPost?._id;

  // Fetch comments when dialog opens
  useEffect(() => {
    if (!open || !postId) {
      setComments([]);
      return;
    }
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/v1/post/${postId}/comment/all`,
          { withCredentials: true },
        );
        if (res.data?.success && Array.isArray(res.data.comments)) {
          setComments(res.data.comments);
        } else {
          setComments(selectedPost?.comments ?? []);
        }
      } catch (err) {
        setComments(selectedPost?.comments ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [open, postId]);

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async () => {
    if (!text?.trim() || !postId) return;
    setSending(true);
    try {
      const res = await axios.post(
        `/api/v1/post/${postId}/comment`,
        { text: text.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      if (res.data?.success && res.data.comment) {
        setComments((prev) => [res.data.comment, ...prev]);
        setText("");
        toast.success(res.data.message || "Comment added");
        // Keep Redux in sync
        const updatedPosts = (posts ?? []).map((p) =>
          p._id === selectedPost?._id
            ? { ...p, comments: [res.data.comment, ...comments] }
            : p,
        );
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSending(false);
    }
  };

  if (!selectedPost) return null;
  const postImage = selectedPost?.image?.trim() || null;
  const authorAvatar = selectedPost?.author?.profilePicture?.trim() || null;

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex flex-col bg-white text-black shadow-none border-0 rounded-none max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Post Comments</DialogTitle>
        <DialogDescription className="sr-only">
          View and add comments for this post.
        </DialogDescription>
        <div className="flex flex-1 min-h-[70vh]">
          <div className="w-1/2 h-full min-w-0">
            {postImage ? (
              <img
                src={postImage}
                alt="post_img"
                className="w-full h-full object-cover rounded-l-lg"
              />
            ) : (
              <div className="w-full h-full rounded-l-lg bg-gray-100" />
            )}
          </div>
          <div className="w-1/2 flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex gap-3 items-center">
                <Link to="/profile">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                  )}
                </Link>
                <div className="leading-tight">
                  <Link className="font-semibold text-sm block">
                    {selectedPost?.author?.username}
                  </Link>
                  <span className="text-gray-600 text-xs">Bio here...</span>
                </div>
              </div>
              <MoreHorizontal className="cursor-pointer w-6 h-6 text-gray-700" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
              {loading ? (
                <p className="text-sm text-gray-500">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))
              )}
            </div>

            <div className="p-4 border-t flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="flex-1 outline-none border border-gray-200 rounded px-3 py-2 text-sm bg-white text-black placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessageHandler();
                  }}
                />
                <Button
                  type="button"
                  disabled={!text.trim() || sending}
                  onClick={sendMessageHandler}
                  className="!bg-[#0095F6] !text-white hover:!bg-[#258bcf] transition-colors disabled:!bg-[#9fd4fb] disabled:!text-white"
                  size="sm"
                >
                  {sending ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
