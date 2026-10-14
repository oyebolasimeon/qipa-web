"use client";

import type { ReactNode } from "react";
import { SpaceBackdrop } from "./space-backdrop";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-root">
      <SpaceBackdrop />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
        {children}
      </div>
    </div>
  );
}
