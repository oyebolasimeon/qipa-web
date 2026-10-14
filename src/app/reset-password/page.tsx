"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthBrand } from "@/components/brand";
import { AuthShell } from "@/components/auth-shell";
import { Button, ErrorBanner, Field } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

function ResetForm() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t("auth.resetLinkMissing"));
      return;
    }
    apiRequest<{ email?: string }>(`/api/auth/reset-password/verify?token=${encodeURIComponent(token)}`)
      .then((result) => setEmail(result.email ?? ""))
      .catch(() => setError(t("auth.resetLinkExpired")));
  }, [token, t]);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 8) {
      setError(t("auth.passwordMinError"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/auth/reset-password", { method: "POST", body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("auth.couldNotResetPassword"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthBrand compact />
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold">{t("auth.chooseNewPassword")}</h1>
      <p className="mb-6 mt-2 text-[15px] text-[var(--text-muted)]">
        {done ? t("auth.passwordResetDone") : email ? t("auth.createPasswordFor", { email }) : t("auth.createPasswordAccount")}
      </p>
      <ErrorBanner message={error} />
      {!done ? (
        <>
          <Field label={t("auth.newPassword")} value={password} onChange={setPassword} type="password" />
          <Field label={t("auth.confirmPassword")} value={confirm} onChange={setConfirm} type="password" />
          <Button className="w-full" loading={loading} onClick={handleSubmit}>
            {t("auth.updatePassword")}
          </Button>
        </>
      ) : (
        <Link href="/login" className="btn btn-primary w-full">
          {t("auth.signIn")}
        </Link>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
