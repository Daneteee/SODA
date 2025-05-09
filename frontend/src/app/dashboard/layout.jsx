"use client";

import React from "react";
import DrawerSide from "@/components/DrawerSide";
import Chat from "@/components/ChatWidget";

export default function DashboardLayout({ children }) {
  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200 flex flex-col min-h-screen">
        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>
      </div>
      <DrawerSide />
      <Chat />
    </div>
  );
}