"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChannelsPage() {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["channels", session?.organization.id],
    queryFn: () => apiRequest<{ data?: unknown[] } | Record<string, unknown>>("/api/channels", { token: session?.token }),
    enabled: !!session?.token,
  });

  return (
    <div>
      <PageHeader title="Booking platforms" subtitle="Connect Airbnb, Booking.com and other channels from the same backend as mobile." />
      <Card>
        <pre className="overflow-auto text-xs text-[var(--text-secondary)]">{JSON.stringify(data ?? { message: "No channel payload yet." }, null, 2)}</pre>
      </Card>
    </div>
  );
}
