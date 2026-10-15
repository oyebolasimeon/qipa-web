"use client";

import { CheckCircle2 } from "lucide-react";
import { OTA_PLATFORM_META, type OtaPlatform } from "@/lib/ota-platforms";
import { useTranslation } from "@/lib/i18n";
import { Glass } from "@/components/ui";

function PlatformLogo({ platform }: { platform: OtaPlatform }) {
  if (platform === "AIRBNB") {
    return <span className="font-bold" style={{ color: "#FF5A5F" }}>airbnb</span>;
  }
  if (platform === "BOOKING_COM") {
    return <span className="font-bold" style={{ color: "#003580" }}>Booking.com</span>;
  }
  return <span className="font-bold" style={{ color: "#1A56DB" }}>Vrbo</span>;
}

export function PlatformCard({
  platform,
  connected,
  loading,
  syncLoading,
  disconnectLoading,
  onConnect,
  onSync,
  onDisconnect,
}: {
  platform: OtaPlatform;
  connected: boolean;
  loading?: boolean;
  syncLoading?: boolean;
  disconnectLoading?: boolean;
  onConnect: () => void;
  onSync?: () => void;
  onDisconnect?: () => void;
}) {
  const { t } = useTranslation();
  const meta = OTA_PLATFORM_META[platform];

  return (
    <Glass className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="logo-badge">
          <PlatformLogo platform={platform} />
        </span>
        {connected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
            <CheckCircle2 size={14} />
            {t("channels.connected")}
          </span>
        ) : (
          <span className="text-xs font-medium text-[var(--text-muted)]">{t("channels.notConnected")}</span>
        )}
      </div>
      <div className="font-[family-name:var(--font-outfit)] text-[17px] font-bold">{meta.label}</div>
      <div className="mb-4 text-[13px] text-[var(--text-muted)]">{meta.subtitle}</div>
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary min-h-11 flex-1 rounded-xl px-4 py-2 text-sm" disabled={loading} onClick={onConnect}>
          {loading ? t("channels.opening") : connected ? t("channels.manage", { platform: meta.shortLabel }) : t("channels.connect", { platform: meta.shortLabel })}
        </button>
        {connected && onSync ? (
          <button type="button" className="btn btn-ghost min-h-11 rounded-xl px-4 py-2 text-sm" disabled={syncLoading} onClick={onSync}>
            {syncLoading ? t("channels.syncing") : t("channels.sync")}
          </button>
        ) : null}
      </div>
      {connected && onDisconnect ? (
        <button type="button" className="mt-2 w-full py-2 text-sm font-semibold text-[var(--danger)]" disabled={disconnectLoading} onClick={onDisconnect}>
          {disconnectLoading ? t("channels.disconnecting") : t("channels.disconnect")}
        </button>
      ) : null}
    </Glass>
  );
}
