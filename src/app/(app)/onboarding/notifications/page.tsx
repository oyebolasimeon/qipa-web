"use client";

import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@/components/ui";

export default function OnboardingNotificationsPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Stay in the loop" subtitle="Alerts, drafts and arrivals appear in the same places as the mobile app." />
      <Button className="w-full" onClick={() => router.replace("/home")}>
        Go to home
      </Button>
    </div>
  );
}
