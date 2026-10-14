"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBrand } from "@/components/brand";
import { AuthShell } from "@/components/auth-shell";
import { Button, ErrorBanner, Field } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string>();

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError(t("auth.enterEmailAddress"));
      return;
    }
    setLoading(true);
    try {
      const result = await apiRequest<{ message: string; devResetUrl?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });
      setSent(true);
      setDevResetUrl(result.devResetUrl);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("auth.couldNotSendReset"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthBrand compact />
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold">{t("auth.forgotPasswordTitle")}</h1>
      <p className="mb-6 mt-2 text-[15px] text-[var(--text-muted)]">
        {sent ? t("auth.forgotPasswordSent") : t("auth.forgotPasswordBody")}
      </p>
      <ErrorBanner message={error} />
      {!sent ? (
        <>
          <Field label={t("auth.email")} value={email} onChange={setEmail} />
          <Button className="w-full" loading={loading} onClick={handleSubmit}>
            {loading ? t("auth.sending") : t("auth.sendResetLink")}
          </Button>
        </>
      ) : null}
      {devResetUrl ? (
        <Link href={devResetUrl.replace(/^.*reset-password/, "/reset-password")} className="mt-4 block text-sm text-[var(--mist)]">
          {t("auth.devResetLink")}
        </Link>
      ) : null}
      <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[var(--mist)]">
        {t("auth.backToSignIn")}
      </Link>
    </AuthShell>
  );
}
