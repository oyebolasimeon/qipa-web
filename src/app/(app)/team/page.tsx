"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { SkeletonList } from "@/components/skeleton";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Worker = {
  membershipId: string;
  userId?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  invitationState?: string;
};

export default function TeamPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const team = useQuery({
    queryKey: ["workers", session?.organization.id],
    queryFn: () => apiRequest<Worker[]>("/api/workers", { token: session?.token }),
    enabled: !!session?.token,
  });
  const resend = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/workers/${id}/resend`, { method: "POST", token: session?.token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workers"] }),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/workers/${id}/revoke`, { method: "POST", token: session?.token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workers"] }),
  });
  const people = Array.isArray(team.data) ? team.data : [];

  return (
    <div>
      <PageHeader
        title={t("screens.team")}
        subtitle={t("screens.teamSubtitle")}
        action={
          <Link href="/team/new" className="btn btn-primary btn-sm">
            {t("screens.addStaff")}
          </Link>
        }
      />
      {team.isPending ? <SkeletonList rows={5} /> : null}
      {people.length === 0 && !team.isPending ? (
        <EmptyState title="No team members yet." action={t("screens.addStaff")} href="/team/new" />
      ) : null}
      {people.length ? (
        <div className="list-stack">
          {people.map((person) => {
            const initials = person.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();
            return (
              <div key={person.membershipId} className="list-row">
                <div className="avatar">{initials || "?"}</div>
                <div className="list-row-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="list-row-title">{person.name}</div>
                    <StatusPill>{(person.invitationState ?? person.status ?? "active").replace(/_/g, " ")}</StatusPill>
                  </div>
                  <div className="list-row-meta">{person.role.replace(/_/g, " ")}</div>
                  <div className="list-row-sub">{person.email}</div>
                  <div className="mt-2 flex gap-3">
                    {person.invitationState === "pending" || person.invitationState === "expired" ? (
                      <button type="button" className="text-sm font-semibold text-[var(--mist)]" onClick={() => resend.mutate(person.membershipId)}>
                        {t("screens.resendInvitation")}
                      </button>
                    ) : null}
                    {person.invitationState !== "revoked" && person.userId !== session?.user.id ? (
                      <button type="button" className="text-sm font-semibold text-[var(--accent)]" onClick={() => revoke.mutate(person.membershipId)}>
                        {t("screens.removeAccess")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
