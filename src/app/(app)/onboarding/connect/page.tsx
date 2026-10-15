"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button, Glass, PageHeader } from "@/components/ui";
import { OTA_PLATFORM_META, type OtaPlatform } from "@/lib/ota-platforms";

function ConnectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const platform = (params.get("platform") ?? "AIRBNB") as OtaPlatform;
  const meta = OTA_PLATFORM_META[platform] ?? OTA_PLATFORM_META.AIRBNB;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`Connect ${meta.label}`} subtitle={meta.subtitle} />
      <Glass className="mb-4">
        Ocupai will open the same mapping flow as mobile so listings and reservations stay in sync.
      </Glass>
      <Button className="w-full" onClick={() => router.push(`/channels`)}>
        Connect now
      </Button>
      <button type="button" className="mt-4 w-full text-sm text-[var(--text-muted)]" onClick={() => router.replace("/home")}>
        Later
      </button>
    </div>
  );
}

export default function OnboardingConnectPage() {
  return (
    <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
      <ConnectInner />
    </Suspense>
  );
}
