"use client";

import React from "react";
import DrawerSide from "@/components/DrawerSide";
import Chat from "@/components/ChatWidget";

export default function DashboardLayout({ children }) {
  return (
    <div className="drawer lg:drawer-open" style={{ height: 'calc(100vh - 5em)' }}>
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="overflow-y-auto drawer-content bg-base-200 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </div>
      </div>
      <DrawerSide />
      <Chat />
    </div>
  );
}