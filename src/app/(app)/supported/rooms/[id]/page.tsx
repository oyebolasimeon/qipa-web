"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";

type Room = {
  id: string;
  roomNumber: string;
  status: string;
  weeklyRate: number;
  currency: string;
  propertyName?: string;
  city?: string;
  localAuthority?: string;
};

export default function SupportedRoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["supported-room", id],
    queryFn: () => apiRequest<Room>(`/api/supported/rooms/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const room = query.data;

  return (
    <div>
      <PageHeader title={room ? `${room.propertyName ?? "Room"} · ${room.roomNumber}` : "Room"} action={<StatusPill>{room?.status}</StatusPill>} />
      <Glass>
        <div>{room?.city}</div>
        <div className="mt-1">{formatCurrency(room?.weeklyRate ?? 0, room?.currency)} / week</div>
        <div className="mt-2 text-sm text-[var(--text-muted)]">{room?.localAuthority}</div>
      </Glass>
    </div>
  );
}
