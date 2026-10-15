"use client";

import type { ReactNode } from "react";
import { SpaceBackdrop } from "./space-backdrop";

export function AuthShell({
  children,
  align = "center",
}: {
  children: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className="space-root space-root-auth">
      <SpaceBackdrop />
      <div
        className={`relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10 ${
          align === "center" ? "justify-center" : "justify-start pt-6 pb-12 sm:justify-center sm:pt-10"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
