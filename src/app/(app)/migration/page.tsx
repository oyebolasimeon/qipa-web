"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, ErrorBanner, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest, ApiRequestError, uploadForm } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { canOperate } from "@/lib/roles";

type BookingImport = {
  id: string;
  fileName?: string;
  status: string;
  createdAt?: string;
  rowCount?: number;
  importedCount?: number;
};

export default function MigrationPage() {
  const { session } = useAuth();
  const operate = canOperate(session?.membership.role);
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [active, setActive] = useState<BookingImport | null>(null);

  const query = useQuery({
    queryKey: ["migration-uploads", session?.organization.id],
    queryFn: () => apiRequest<{ data: BookingImport[] }>("/api/migration", { token: session?.token }),
    enabled: !!session?.token,
  });
  const rows = query.data?.data ?? [];

  const preview = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return uploadForm<BookingImport>("/api/migration/preview", form, session?.token);
    },
    onSuccess: (result) => {
      setActive(result);
      void queryClient.invalidateQueries({ queryKey: ["migration-uploads"] });
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not read CSV"),
  });

  const importRows = useMutation({
    mutationFn: (id: string) =>
      apiRequest<BookingImport>(`/api/migration/${id}/import`, { method: "POST", token: session?.token }),
    onSuccess: (result) => {
      setActive(result);
      void queryClient.invalidateQueries({ queryKey: ["migration-uploads"] });
    },
  });

  return (
    <div>
      <PageHeader title="Migration station" subtitle="Import historic bookings from a CSV" />
      <ErrorBanner message={error} />
      {operate ? (
        <label className="btn btn-primary mb-4 inline-flex cursor-pointer">
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) preview.mutate(file);
            }}
          />
        </label>
      ) : null}
      {active ? (
        <Glass className="mb-4">
          <div className="font-semibold">{active.fileName ?? "Preview"}</div>
          <div className="text-sm text-[var(--text-secondary)]">
            {active.rowCount ?? 0} rows · {active.status}
          </div>
          {active.status !== "IMPORTED" ? (
            <Button className="mt-3" loading={importRows.isPending} onClick={() => importRows.mutate(active.id)}>
              Import
            </Button>
          ) : null}
        </Glass>
      ) : null}
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title="No uploads yet." /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Glass key={row.id} onClick={() => setActive(row)}>
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-semibold">{row.fileName ?? row.id}</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {row.createdAt ? formatDate(row.createdAt) : ""} · {row.importedCount ?? 0} imported
                </div>
              </div>
              <StatusPill>{row.status}</StatusPill>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
