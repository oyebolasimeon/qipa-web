export type BookingApprovalPropertyMode = "INHERIT" | "ALWAYS_ON" | "ALWAYS_OFF";

export type BookingApprovalSettings = {
  account: { enabled: boolean; windowHours: number };
  note?: string;
  properties: Array<{
    id: string;
    name: string;
    bookingApprovalMode: BookingApprovalPropertyMode;
    approvalRequired: boolean;
  }>;
};

export function formatApprovalCountdown(
  deadlineIso: string | undefined,
  expired: boolean | undefined,
  now = Date.now(),
): string | null {
  if (expired) return "Expired";
  if (!deadlineIso) return null;
  const deadline = new Date(deadlineIso).getTime();
  if (!Number.isFinite(deadline)) return null;
  const ms = deadline - now;
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(1, minutes)}m left`;
}
