import { apiRequest } from "./api";
import { docId } from "./format";

export type ChannelConnection = {
  id?: string;
  _id?: string;
  provider: string;
  name?: string;
  status?: string;
  config?: { lastSyncAt?: string; connectedPlatforms?: string[]; airbnbChannelId?: string };
};

export async function ensurePlatformSyncChannel(token: string): Promise<ChannelConnection> {
  const channels = await apiRequest<ChannelConnection[]>("/api/connect", { token });
  const existing = channels.find((channel) => channel.provider === "CHANNEX");
  if (existing) return existing;
  return apiRequest<ChannelConnection>("/api/connect", {
    method: "POST",
    token,
    body: { provider: "CHANNEX", name: "Platform sync" },
  });
}

export async function syncPlatformChannel(token: string, channel: ChannelConnection) {
  return apiRequest(`/api/connect/${docId(channel)}/sync`, { method: "POST", token });
}

export async function openPlatformMappingIframe(token: string, propertyId: string, platformCode?: string) {
  const query = platformCode
    ? `?propertyId=${propertyId}&channels=${platformCode}`
    : `?propertyId=${propertyId}`;
  return apiRequest<{ url: string }>(`/api/connect/channex/iframe${query}`, { token });
}

export function platformSyncChannel(channels: ChannelConnection[] | undefined) {
  return channels?.find((channel) => channel.provider === "CHANNEX");
}

export async function startAirbnbConnect(token: string) {
  return apiRequest<{ url: string }>("/api/connect/airbnb/connect", { method: "POST", token });
}

export async function markOtaPlatformConnected(token: string, platform: string) {
  return apiRequest(`/api/connect/platforms/${platform}/connected`, { method: "POST", token });
}

export async function disconnectOtaPlatform(token: string, platform: string) {
  return apiRequest(`/api/connect/platforms/${platform}/disconnect`, { method: "POST", token });
}

export async function importAirbnbListings(token: string) {
  return apiRequest<{ imported: number; mapped: number; skipped: number; errors: string[] }>(
    "/api/connect/airbnb/import",
    { method: "POST", token },
  );
}
