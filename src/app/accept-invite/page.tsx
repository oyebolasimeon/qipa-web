"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthBrand } from "@/components/brand";
import { AuthShell } from "@/components/auth-shell";
import { Button, ErrorBanner, Field } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import type { AuthSession } from "@/lib/types";

function AcceptInner() {
  const { t } = useTranslation();
  const { establishSession, session, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(true);
  const [invite, setInvite] = useState<{ organizationName: string; email: string; role: string } | null>(null);

  useEffect(() => {
    if (!isLoading && session) router.replace("/home");
  }, [isLoading, session, router]);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setError(t("auth.invitationMissing"));
      return;
    }
    apiRequest<{ organizationName: string; role: string; email: string; needsPassword: boolean }>(
      `/api/auth/accept-invite/verify?token=${encodeURIComponent(token)}`,
    )
      .then((result) => {
        setNeedsPassword(result.needsPassword);
        setInvite({
          organizationName: result.organizationName,
          email: result.email,
          role: result.role.replaceAll("_", " ").toLowerCase(),
        });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : t("auth.invitationInvalid")))
      .finally(() => setChecking(false));
  }, [t, token]);

  const accept = async () => {
    if (!token) return;
    if (needsPassword && password.length < 8) {
      setError(t("auth.passwordMinError"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const next = await apiRequest<AuthSession>("/api/auth/accept-invite", {
        method: "POST",
        body: { token, password: password.trim() || undefined },
      });
      establishSession(next);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("auth.couldNotAcceptInvitation"));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthShell>
        <p className="text-[var(--text-muted)]">{t("common.loading")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthBrand compact />
      <h1 className="mb-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold">{t("screens.joinTeam")}</h1>
      <p className="mb-6 text-[15px] text-[var(--text-muted)]">
        {invite
          ? t("auth.invitationSummary", {
              organization: invite.organizationName,
              email: invite.email,
              role: invite.role,
            })
          : t("auth.invitationDefault")}
      </p>
      <ErrorBanner message={error} />
      {needsPassword ? (
        <Field label={t("auth.password")} value={password} onChange={setPassword} type="password" />
      ) : null}
      <Button className="w-full" loading={loading} onClick={() => void accept()}>
        {t("screens.joinTeam")}
      </Button>
    </AuthShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<p className="p-8 text-[var(--text-muted)]">Loading…</p>}>
      <AcceptInner />
    </Suspense>
  );
}
