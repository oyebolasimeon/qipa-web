"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBrand } from "@/components/brand";
import { AuthShell } from "@/components/auth-shell";
import { Button, ErrorBanner, Field, Glass } from "@/components/ui";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import type { OrganizationKind } from "@/lib/types";

const MODES: OrganizationKind[] = [
  "HOSPITALITY",
  "FLATSHARES",
  "MAINTENANCE",
  "SUPPORTED_ACCOMMODATION",
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationKind, setOrganizationKind] = useState<OrganizationKind | null>(null);
  const [operatorType, setOperatorType] = useState<"LANDLORD" | "MAINTENANCE_COMPANY">("LANDLORD");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (step === 0 && (!firstName.trim() || !lastName.trim())) return t("auth.enterName");
    if (step === 1 && organizationName.trim().length < 2) return t("auth.organizationMin");
    if (step === 2 && !organizationKind) return t("auth.chooseModeError");
    if (step === 3 && !email.trim()) return t("auth.enterEmail");
    if (step === 3 && password.length < 8) return t("auth.passwordMinError");
    return null;
  };

  const handleNext = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }
    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organizationName: organizationName.trim(),
        organizationKind: organizationKind ?? "HOSPITALITY",
        operatorType: organizationKind === "MAINTENANCE" ? operatorType : undefined,
      });
      router.replace("/home");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <button
        type="button"
        className="mb-4 self-start text-sm text-[var(--text-secondary)]"
        onClick={() => (step === 0 ? router.push("/login") : setStep((value) => value - 1))}
      >
        ← {t("common.back")}
      </button>
      {step === 0 ? <AuthBrand compact /> : null}
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold">{t("auth.registerTitle")}</h1>
      <p className="mb-5 mt-2 text-[15px] text-[var(--text-muted)]">
        {step === 0 && t("auth.registerStepAboutYou")}
        {step === 1 && t("auth.registerStepOrganization")}
        {step === 2 && t("auth.registerStepMode")}
        {step === 3 && t("auth.registerStepCredentials")}
      </p>
      <div className="mb-5 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`h-1.5 rounded-full ${index <= step ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
        ))}
      </div>
      <ErrorBanner message={error} />
      {step === 0 ? (
        <>
          <Field label={t("auth.firstName")} value={firstName} onChange={setFirstName} />
          <Field label={t("auth.lastName")} value={lastName} onChange={setLastName} />
        </>
      ) : null}
      {step === 1 ? (
        <>
          <Field label={t("auth.organizationName")} value={organizationName} onChange={setOrganizationName} placeholder="Nova Elite Homes" />
          <Glass className="mb-4">
            <p className="text-sm text-[var(--text-secondary)]">{t("auth.organizationHint")}</p>
          </Glass>
        </>
      ) : null}
      {step === 2 ? (
        <div className="mb-4 space-y-2">
          <div className="field-label">{t("auth.chooseMode")}</div>
          {MODES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setOrganizationKind(id)}
              className="w-full text-left"
            >
              <div className={`glass ${organizationKind === id ? "glass-primary" : ""}`}>
                <div className="glass-inner p-3">
                  <div className="font-semibold">{t(`workspaces.kinds.${id}` as TranslationKey)}</div>
                  <div className="mt-1 text-sm text-[var(--text-muted)]">{t(`workspaces.kindHints.${id}` as TranslationKey)}</div>
                </div>
              </div>
            </button>
          ))}
          {organizationKind === "MAINTENANCE" ? (
            <div className="flex gap-2 pt-2">
              {(["LANDLORD", "MAINTENANCE_COMPANY"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm ${operatorType === id ? "border-[var(--primary)] bg-[var(--primary-muted)]" : "border-[var(--border)]"}`}
                  onClick={() => setOperatorType(id)}
                >
                  {id === "LANDLORD" ? t("auth.operatorLandlord") : t("auth.operatorCompany")}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {step === 3 ? (
        <>
          <Field label={t("auth.email")} value={email} onChange={setEmail} placeholder="you@company.com" />
          <Field label={t("auth.password")} value={password} onChange={setPassword} type="password" placeholder={t("auth.passwordMin")} />
        </>
      ) : null}
      <Button className="w-full" loading={loading} onClick={handleNext}>
        {step === 3 ? t("auth.createAccount") : t("common.continue")}
      </Button>
      <p className="mt-6 text-center text-[15px] text-[var(--text-secondary)]">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-[var(--mist)]">
          {t("auth.signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
