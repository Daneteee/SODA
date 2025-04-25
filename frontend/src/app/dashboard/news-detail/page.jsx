"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const NewsDetailClient = dynamic(
  () => import("./NewsDetailClient"),
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <NewsDetailClient />
    </Suspense>
  );
}
