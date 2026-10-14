"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function RootPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(session ? "/home" : "/login");
  }, [isLoading, session, router]);

  return <div className="page-bg min-h-dvh" />;
}
