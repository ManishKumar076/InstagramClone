import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const SuggestedUsers = () => {
  const { suggestedUsers = [] } = useSelector((store) => store.auth || {});
  return (
    <div className="my-10">
      <div className="space-y-3">
        {suggestedUsers.map((user) => (
          <div key={user._id}>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  {user?.profilePicture ? (
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.username || "avatar"}
                    />
                  ) : (
                    <AvatarFallback>
                      {(user?.username &&
                        user.username.slice(0, 2).toUpperCase()) ||
                        "NA"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className="text-gray-600 text-sm">{user?.bio}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
