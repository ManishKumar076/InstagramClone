import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { setPosts } from "@/redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      try {
        setFile(file);
        const dataUrl = await readFileAsDataURL(file);
        setImagePreview(dataUrl);
      } catch (error) {
        toast.error("Failed to load image. Please try again.");
        console.error(error);
      }
    }
  };

  const createPostHandler = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/v1/post/addpost",
        formData,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        const currentPosts = Array.isArray(posts) ? posts : [];
        dispatch(setPosts([res.data.post, ...currentPosts]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setImagePreview("");
        setFile(null);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-center font-semibold">
            Create New Post
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new post with image and caption.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilePicture || undefined} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="font-semibold text-xs">{user?.username}</h1>
          <span className="text-gray-600 text-xs">Bio here...</span>
        </div>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption"
        />
        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="preview_img"
              className="object-cover h-full w-full rounded-md"
            />
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={fileChangeHandler}
        />
        <Button
          onClick={() => imageRef.current.click()}
          className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]"
        >
          Select from computer
        </Button>
        {imagePreview &&
          (loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={createPostHandler}
              type="submit"
              className="w-full"
            >
              Post
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
