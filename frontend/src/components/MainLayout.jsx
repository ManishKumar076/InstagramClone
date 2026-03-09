import React from "react";
import LeftSidebar from "./LeftSidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex [--sidebar-width:16rem]">
      <LeftSidebar />
      <main className="flex-1 pl-[var(--sidebar-width)]">
        <Outlet />
      </main>
    </div>
  );
}
