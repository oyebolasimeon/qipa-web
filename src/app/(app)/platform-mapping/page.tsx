"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBanner, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { ensurePlatformSyncChannel, markOtaPlatformConnected, openPlatformMappingIframe, startAirbnbConnect } from "@/lib/channel-sync";
import { OTA_CHANNEL_CODES, OTA_PLATFORM_META, type OtaPlatform } from "@/lib/ota-platforms";

function MappingInner() {
  const { session } = useAuth();
  const params = useSearchParams();
  const platform = (params.get("platform") ?? "AIRBNB") as OtaPlatform;
  const propertyId = params.get("propertyId") ?? "";
  const meta = OTA_PLATFORM_META[platform] ?? OTA_PLATFORM_META.AIRBNB;
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session?.token) return;
      try {
        await ensurePlatformSyncChannel(session.token);
        const iframe =
          platform === "AIRBNB"
            ? await startAirbnbConnect(session.token)
            : await openPlatformMappingIframe(session.token, propertyId, OTA_CHANNEL_CODES[platform]);
        if (cancelled) return;
        setUrl(iframe.url);
        await markOtaPlatformConnected(session.token, platform).catch(() => undefined);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not open mapping");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [platform, propertyId, session?.token]);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader title={`Map ${meta.label}`} subtitle="Same connection flow as the mobile app." />
      <ErrorBanner message={error} />
      {url ? (
        <iframe title={`${meta.label} mapping`} src={url} className="h-[70vh] w-full rounded-2xl border border-[var(--border)] bg-white" />
      ) : (
        <p className="text-[var(--text-muted)]">Opening mapping…</p>
      )}
    </div>
  );
}

export default function PlatformMappingPage() {
  return (
    <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
      <MappingInner />
    </Suspense>
  );
}
