import React from "react";

export default function Comment({ comment }) {
  if (!comment) return null;
  const author = comment.author;
  const name = typeof author === "object" ? author?.username : "User";
  const avatar = typeof author === "object" ? author?.profilePicture : null;

  return (
    <div className="flex gap-3 items-start py-2">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-black">
          <span className="font-semibold mr-2 text-black">{name}</span>
          <span className="text-black">{comment.text}</span>
        </p>
      </div>
    </div>
  );
}
