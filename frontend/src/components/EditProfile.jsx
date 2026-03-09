import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { readFileAsDataURL } from "@/lib/utils";
import { setAuthUser } from "@/redux/authSlice";

const EditProfile = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const imageRef = useRef();
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);

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

  const updateProfileHandler = async () => {
    const formData = new FormData();
    if (bio) formData.append("bio", bio);
    if (file) formData.append("profilePicture", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "/api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message || "Profile updated successfully");
        setOpen(false);
        // Reset form
        setFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-center font-semibold">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="sr-only">
            Update your profile photo and bio.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24">
              <AvatarImage src={imagePreview || undefined} alt="profile" />
              <AvatarFallback className="text-2xl">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={fileChangeHandler}
            />
            <Button
              type="button"
              onClick={() => imageRef.current?.click()}
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-md border border-black !bg-black !text-white hover:!bg-zinc-800 transition-colors"
            >
              Change Photo
            </Button>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="focus-visible:ring-transparent"
              placeholder="Write a bio..."
              rows={3}
            />
          </div>
          {loading ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </Button>
          ) : (
            <Button
              onClick={updateProfileHandler}
              className="w-full bg-[#0095F6] hover:bg-[#258bcf]"
            >
              Save Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
