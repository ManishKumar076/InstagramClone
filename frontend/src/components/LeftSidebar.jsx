import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  Search,
  TrendingUp,
  PlusSquare,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import EditProfile from "./EditProfile";
import BrandLogo from "./BrandLogo";

export default function LeftSidebar() {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get("/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res?.data?.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message || "Logged out");
        return;
      }
      const msg = res?.data?.message || "Logout failed";
      toast.error(msg);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Logout failed";
      toast.error(message);
      dispatch(setAuthUser(null));
      navigate("/login");
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      setOpenEditProfile(true);
    }
  };

  const sidebarItems = [
    { icon: Home, text: "Home" },
    { icon: Search, text: "Search" },
    { icon: TrendingUp, text: "Explore" },
    { icon: MessageCircle, text: "Message" },
    { icon: Heart, text: "Notifications" },
    { icon: PlusSquare, text: "Create" },
    {
      icon: (props) => (
        user?.profilePicture ? (
          <img
            {...props}
            src={user.profilePicture}
            alt="@shadcn"
            className={"w-8 h-8 rounded-full " + (props?.className || "")}
          />
        ) : (
          <div
            {...props}
            aria-hidden="true"
            className={"w-8 h-8 rounded-full bg-gray-200 " + (props?.className || "")}
          />
        )
      ),
      text: "Profile",
    },
    { icon: LogOut, text: "Logout" },
  ];

  const mainItems = sidebarItems.filter((i) => i.text !== "Logout");
  const logoutItem = sidebarItems.find((i) => i.text === "Logout");

  return (
    <aside className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[var(--sidebar-width)] h-screen bg-white">
      <div className="flex flex-col p-4 h-full justify-between pb-10">
        <div>
          <div className="mt-4 mb-2 pl-3">
            <BrandLogo className="text-4xl font-extrabold tracking-tight text-black" />
          </div>
          <nav className="flex flex-col gap-3">
            {mainItems.map((item, index) => (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {(() => {
                  const Icon = item.icon;
                  return <Icon className="w-6 h-6 text-gray-700" />;
                })()}
                <span className="ml-2">{item.text}</span>
              </div>
            ))}
          </nav>
        </div>

        {logoutItem && (
          <div>
            <div
              onClick={() => sidebarHandler(logoutItem.text)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && sidebarHandler(logoutItem.text)
              }
              className="flex items-center gap-3 hover:bg-gray-100 cursor-pointer rounded-lg p-3 mb-4"
            >
              {(() => {
                const Icon = logoutItem.icon;
                return <Icon className="w-6 h-6 text-gray-700" />;
              })()}
              <span className="ml-2">{logoutItem.text}</span>
            </div>
          </div>
        )}
      </div>
      <CreatePost open={open} setOpen={setOpen} />
      <EditProfile open={openEditProfile} setOpen={setOpenEditProfile} />
    </aside>
  );
}
