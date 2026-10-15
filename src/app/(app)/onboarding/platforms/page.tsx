"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Glass, PageHeader } from "@/components/ui";
import { OTA_PLATFORM_META, OTA_PLATFORMS, type OtaPlatform } from "@/lib/ota-platforms";

export default function OnboardingPlatformsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<OtaPlatform[]>(["AIRBNB"]);

  function toggle(platform: OtaPlatform) {
    setSelected((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Which platforms?" subtitle="Pick where guests already book you." />
      <div className="space-y-3">
        {OTA_PLATFORMS.map((platform) => {
          const meta = OTA_PLATFORM_META[platform];
          const on = selected.includes(platform);
          return (
            <Glass key={platform} onClick={() => toggle(platform)} accent={on}>
              <div className="font-semibold">{meta.label}</div>
              <div className="text-sm text-[var(--text-secondary)]">{meta.subtitle}</div>
            </Glass>
          );
        })}
      </div>
      <Button
        className="mt-6 w-full"
        onClick={() => router.push(selected[0] ? `/onboarding/connect?platform=${selected[0]}` : "/home")}
      >
        Continue
      </Button>
    </div>
  );
}
