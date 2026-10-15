"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { importAirbnbListings } from "@/lib/channel-sync";

function AirbnbReturnInner() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Importing Airbnb listings…");

  useEffect(() => {
    let cancelled = false;
    async function finish() {
      if (params.get("success") === "false") {
        setStatus("Airbnb connection was cancelled.");
        setTimeout(() => router.replace("/channels"), 1200);
        return;
      }
      if (!session?.token) return;
      try {
        const result = await importAirbnbListings(session.token);
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
        await queryClient.invalidateQueries({ queryKey: ["channels"] });
        setStatus(`Imported ${result.imported} listings.`);
      } catch {
        if (!cancelled) setStatus("Connected. Listings will appear after the next sync.");
      } finally {
        if (!cancelled) setTimeout(() => router.replace("/channels"), 1400);
      }
    }
    void finish();
    return () => {
      cancelled = true;
    };
  }, [params, queryClient, router, session?.token]);

  return (
    <div>
      <PageHeader title="Airbnb" subtitle={status} />
    </div>
  );
}

export default function AirbnbConnectPage() {
  return (
    <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
      <AirbnbReturnInner />
    </Suspense>
  );
}
