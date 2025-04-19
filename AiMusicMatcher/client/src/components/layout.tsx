import React from "react";
import Sidebar from "./sidebar";
import MusicPlayer from "./music-player";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-secondary text-neutral-100">
      <Sidebar />
      <div className="flex-1 overflow-auto pb-24 md:pb-20">
        {children}
      </div>
      <MusicPlayer />
    </div>
  );
};

export default Layout;
