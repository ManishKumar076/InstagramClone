import React from "react";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

export default function Home() {
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const res = await axios.get("/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data?.success) {
        navigate("/login");
        toast.success(res.data.message || "Logged out");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Logout failed";
      toast.error(message);
      navigate("/login");
    }
  };
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
}
