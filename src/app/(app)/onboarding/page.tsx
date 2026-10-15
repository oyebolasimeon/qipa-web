"use client";

import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function OnboardingPage() {
  const { session } = useAuth();
  const router = useRouter();
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`Welcome, ${session?.user.firstName ?? ""}`} subtitle="Connect platforms so bookings land in Ocupai." />
      <Button className="w-full" onClick={() => router.push("/onboarding/platforms")}>
        Continue
      </Button>
      <button type="button" className="mt-4 w-full text-sm text-[var(--text-muted)]" onClick={() => router.replace("/home")}>
        Skip for now
      </button>
    </div>
  );
}
