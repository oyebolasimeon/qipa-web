"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlatformCard } from "@/components/platform-card";
import { SkeletonCards } from "@/components/skeleton";
import { ErrorBanner, Glass, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  disconnectOtaPlatform,
  ensurePlatformSyncChannel,
  markOtaPlatformConnected,
  platformSyncChannel,
  startAirbnbConnect,
  syncPlatformChannel,
  type ChannelConnection,
} from "@/lib/channel-sync";
import { formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { ocupaiPropertyName } from "@/lib/property-name";
import { OTA_PLATFORM_META, OTA_PLATFORMS, type OtaPlatform } from "@/lib/ota-platforms";
import { propertiesQuery } from "@/lib/queries";
import { isSupportedWorkspace } from "@/lib/workspace-mode";

function storageKey(orgId: string) {
  return `qipa_connected_platforms_${orgId}`;
}

function readLocal(orgId: string): OtaPlatform[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(orgId)) ?? "[]") as OtaPlatform[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(orgId: string, platforms: OtaPlatform[]) {
  localStorage.setItem(storageKey(orgId), JSON.stringify(platforms));
}

export default function ChannelsPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState<OtaPlatform | null>(null);
  const [disconnecting, setDisconnecting] = useState<OtaPlatform | null>(null);
  const [localConnected, setLocalConnected] = useState<OtaPlatform[]>([]);
  const [error, setError] = useState("");
  const orgId = session?.organization.id ?? "";

  useEffect(() => {
    if (orgId) setLocalConnected(readLocal(orgId));
  }, [orgId]);

  const supported = isSupportedWorkspace(session?.organization.kind);
  useEffect(() => {
    if (supported) router.replace("/supported/rooms");
  }, [router, supported]);

  const channels = useQuery({
    queryKey: ["channels", orgId],
    queryFn: async () => {
      await ensurePlatformSyncChannel(session!.token);
      return apiRequest<ChannelConnection[]>("/api/connect", { token: session!.token });
    },
    enabled: !!session?.token && !supported,
  });
  const properties = useQuery(propertiesQuery(orgId, session?.token));
  const syncChannel = platformSyncChannel(channels.data);
  const firstProperty = properties.data?.data?.[0];
  const lastSyncAt = syncChannel?.config?.lastSyncAt;
  const serverPlatforms = syncChannel?.config?.connectedPlatforms ?? [];

  const sync = useMutation({
    mutationFn: async () => {
      const token = session!.token;
      const channel = await ensurePlatformSyncChannel(token);
      return syncPlatformChannel(token, channel);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["channels"] });
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("channels.syncFailed")),
  });

  async function connect(platform: OtaPlatform) {
    if (!session?.token) return;
    setError("");
    setConnecting(platform);
    try {
      await ensurePlatformSyncChannel(session.token);
      if (platform === "AIRBNB") {
        const { url } = await startAirbnbConnect(session.token);
        const next = [...new Set([...localConnected, platform])];
        writeLocal(orgId, next);
        window.location.href = url;
        return;
      }
      if (!firstProperty) {
        setError(t("channels.addPropertyBody"));
        return;
      }
      await markOtaPlatformConnected(session.token, platform).catch(() => undefined);
      const next = [...new Set([...localConnected, platform])];
      writeLocal(orgId, next);
      setLocalConnected(next);
      router.push(`/platform-mapping?platform=${platform}&propertyId=${firstProperty.id}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("channels.couldNotConnect"));
    } finally {
      setConnecting(null);
    }
  }

  async function disconnect(platform: OtaPlatform) {
    if (!session?.token) return;
    if (!confirm(t("channels.disconnectTitle", { platform: OTA_PLATFORM_META[platform].label }))) return;
    setDisconnecting(platform);
    try {
      await disconnectOtaPlatform(session.token, platform);
      const next = localConnected.filter((item) => item !== platform);
      writeLocal(orgId, next);
      setLocalConnected(next);
      await queryClient.invalidateQueries({ queryKey: ["channels"] });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("channels.disconnectFailed"));
    } finally {
      setDisconnecting(null);
    }
  }

  if (supported) return null;

  return (
    <div>
      <PageHeader title={t("channels.title")} subtitle={t("channels.subtitle")} />
      <ErrorBanner message={error} />
      <Glass className="mb-6">
        <div className="font-[family-name:var(--font-outfit)] text-base font-bold">{t("channels.syncStatus")}</div>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {syncChannel?.status === "ACTIVE"
            ? lastSyncAt
              ? t("channels.lastSynced", { date: formatDate(lastSyncAt) })
              : t("channels.readyToSync")
            : t("channels.connectBelow")}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {firstProperty ? t("channels.property", { name: ocupaiPropertyName(firstProperty) }) : t("channels.addPropertyHint")}
        </p>
        <button
          type="button"
          className="btn btn-primary mt-4 w-full rounded-xl"
          disabled={sync.isPending || !firstProperty}
          onClick={() => sync.mutate()}
        >
          {sync.isPending ? t("channels.syncing") : t("channels.syncAll")}
        </button>
      </Glass>
      <div className="mb-3 font-[family-name:var(--font-outfit)] text-[15px] font-bold">{t("channels.supported")}</div>
      {channels.isPending ? <SkeletonCards count={3} /> : null}
      {!channels.isPending ? (
        <div className="grid gap-0 md:grid-cols-3 md:gap-3">
          {OTA_PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform}
              platform={platform}
              connected={
                serverPlatforms.includes(platform) ||
                localConnected.includes(platform) ||
                (platform === "AIRBNB" && Boolean(syncChannel?.config?.airbnbChannelId))
              }
              loading={connecting === platform}
              onConnect={() => connect(platform)}
              onSync={() => sync.mutate()}
              onDisconnect={() => disconnect(platform)}
              syncLoading={sync.isPending}
              disconnectLoading={disconnecting === platform}
            />
          ))}
        </div>
      ) : null}
      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">{t("channels.afterConnectHint")}</p>
    </div>
  );
}
