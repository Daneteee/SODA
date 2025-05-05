"use client";

import React from "react";
import DrawerSide from "@/components/DrawerSide";
import Chat from "@/components/ChatWidget";

export default function DashboardLayout({ children }) {
  return (
    <div className="drawer lg:drawer-open h-full">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200 h-full">
        {children}
      </div>
      <DrawerSide />
      <Chat />
    </div>
  );
}