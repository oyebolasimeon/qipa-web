"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthBrand } from "@/components/brand";
import { AuthShell } from "@/components/auth-shell";
import { Button, ErrorBanner, Field } from "@/components/ui";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn, session, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && session) router.replace("/home");
  }, [isLoading, session, router]);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError(t("auth.enterEmailPassword"));
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthBrand />
      <h1 className="mb-1 font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">{t("auth.signIn")}</h1>
      <p className="mb-6 text-[15px] leading-6 text-[var(--text-muted)]">{t("auth.signInSubtitle")}</p>
      <ErrorBanner message={error} />
      <Field label={t("auth.email")} value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" />
      <Field label={t("auth.password")} value={password} onChange={setPassword} type="password" placeholder="••••••••" autoComplete="current-password" />
      <Button className="w-full" loading={loading} onClick={handleLogin}>
        {t("auth.signIn")}
      </Button>
      <Link href="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-[var(--primary)]">
        {t("auth.forgotPassword")}
      </Link>
      <button
        type="button"
        className="mt-3 w-full py-3 text-center text-sm font-semibold text-[var(--mist)]"
        onClick={() => {
          setEmail("demo@qipa.app");
          setPassword("QipaDemo123!");
        }}
      >
        Use demo account
      </button>
      <p className="mt-4 text-center text-[15px] text-[var(--text-secondary)]">
        No account?{" "}
        <Link href="/register" className="font-semibold text-[var(--mist)]">
          Create one
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
        Invited to a team?{" "}
        <Link href="/accept-invite" className="font-semibold text-[var(--mist)]">
          Join here
        </Link>
      </p>
    </AuthShell>
  );
}
