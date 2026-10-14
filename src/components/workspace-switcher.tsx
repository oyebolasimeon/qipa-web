"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import { isOperationalStaff } from "@/lib/roles";
import type { AuthSession, OrganizationKind, WorkspaceMembership } from "@/lib/types";
import { Button, Field, Glass } from "./ui";

const KINDS: OrganizationKind[] = [
  "HOSPITALITY",
  "FLATSHARES",
  "MAINTENANCE",
  "SUPPORTED_ACCOMMODATION",
];

export function WorkspaceSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { t } = useTranslation();
  const { session, establishSession } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canCreate = !isOperationalStaff(session?.membership.role);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<OrganizationKind>("HOSPITALITY");

  const workspaces = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => apiRequest<WorkspaceMembership[]>("/api/auth/workspaces", { token: session?.token }),
    enabled: !!session?.token,
  });

  const applySession = async (next: AuthSession) => {
    onSwitch?.();
    await queryClient.cancelQueries();
    establishSession(next);
    await queryClient.invalidateQueries();
    router.push("/home");
  };

  const switchWorkspace = useMutation({
    mutationFn: (organizationId: string) =>
      apiRequest<AuthSession>("/api/auth/workspaces/switch", {
        method: "POST",
        token: session?.token,
        body: { organizationId },
      }),
    onSuccess: applySession,
  });

  const acceptInvite = useMutation({
    mutationFn: (organizationId: string) =>
      apiRequest<AuthSession>("/api/auth/workspaces/accept", {
        method: "POST",
        token: session?.token,
        body: { organizationId },
      }),
    onSuccess: applySession,
  });

  const createWorkspace = useMutation({
    mutationFn: () =>
      apiRequest<AuthSession>("/api/auth/workspaces", {
        method: "POST",
        token: session?.token,
        body: { name: name.trim(), kind },
      }),
    onSuccess: async (next) => {
      setCreating(false);
      setName("");
      await applySession(next);
    },
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-secondary)]">{t("workspaces.hint")}</p>
      {(workspaces.data ?? []).map((workspace) => {
        const current = workspace.organizationId === session?.organization.id;
        return (
          <Glass key={workspace.organizationId}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{workspace.organizationName}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {t(`workspaces.kinds.${workspace.kind ?? "HOSPITALITY"}` as TranslationKey)} · {workspace.role}
                </div>
              </div>
              {workspace.invitationState === "pending" ? (
                <Button onClick={() => acceptInvite.mutate(workspace.organizationId)}>{t("workspaces.accept")}</Button>
              ) : (
                <Button
                  variant={current ? "ghost" : "primary"}
                  onClick={() => !current && switchWorkspace.mutate(workspace.organizationId)}
                >
                  {current ? t("workspaces.current") : t("workspaces.switch")}
                </Button>
              )}
            </div>
          </Glass>
        );
      })}
      {canCreate ? (
        creating ? (
          <Glass>
            <Field label={t("workspaces.name")} value={name} onChange={setName} placeholder={t("workspaces.namePlaceholder")} />
            <div className="mb-3 grid gap-2">
              {KINDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`rounded-xl border px-3 py-2 text-left ${kind === id ? "border-[var(--primary)] bg-[var(--primary-muted)]" : "border-[var(--border)]"}`}
                  onClick={() => setKind(id)}
                >
                  <div className="font-medium">{t(`workspaces.kinds.${id}` as TranslationKey)}</div>
                  <div className="text-xs text-[var(--text-muted)]">{t(`workspaces.kindHints.${id}` as TranslationKey)}</div>
                </button>
              ))}
            </div>
            <Button loading={createWorkspace.isPending} onClick={() => createWorkspace.mutate()}>
              {t("workspaces.create")}
            </Button>
          </Glass>
        ) : (
          <Button variant="ghost" onClick={() => setCreating(true)}>
            {t("workspaces.add")}
          </Button>
        )
      ) : null}
    </div>
  );
}
