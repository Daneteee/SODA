// src/app/dashboard/layout.tsx
"use client";

import React from "react";
import DrawerSide from "@/components/DrawerSide";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200">
        {children}
      </div>
      <DrawerSide />
    </div>
  );
}
