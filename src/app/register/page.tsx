"use client";

import {
  ArrowLeft,
  BedDouble,
  Building2,
  Check,
  Hammer,
  HeartHandshake,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AuthBrand } from "@/components/brand";
import { AuthShell } from "@/components/auth-shell";
import { Button, ErrorBanner, Field } from "@/components/ui";
import { ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import type { OrganizationKind } from "@/lib/types";

const MODES: Array<{
  id: OrganizationKind;
  icon: ReactNode;
  tint: string;
}> = [
  { id: "HOSPITALITY", icon: <Building2 size={18} />, tint: "#4F7CFF" },
  { id: "FLATSHARES", icon: <BedDouble size={18} />, tint: "#3DD68C" },
  { id: "MAINTENANCE", icon: <Hammer size={18} />, tint: "#F5A524" },
  { id: "SUPPORTED_ACCOMMODATION", icon: <HeartHandshake size={18} />, tint: "#FF5A5F" },
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationKind, setOrganizationKind] = useState<OrganizationKind | null>(null);
  const [operatorType, setOperatorType] = useState<"LANDLORD" | "MAINTENANCE_COMPANY">("LANDLORD");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const stepLabels = [
    t("auth.stepAboutYou"),
    t("auth.stepOrganization"),
    t("auth.stepMode"),
    t("auth.stepAccount"),
  ];

  useEffect(() => {
    setAnimKey((value) => value + 1);
  }, [step]);

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
      router.replace("/onboarding");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 0) {
      router.push("/login");
      return;
    }
    setStep((value) => value - 1);
  };

  return (
    <AuthShell align="start">
      <button type="button" className="auth-back" onClick={handleBack} aria-label={t("common.back")}>
        <ArrowLeft size={20} />
      </button>

      {step === 0 ? <AuthBrand compact /> : null}

      <div key={`head-${animKey}`} className="auth-fade">
        <h1 className="auth-title">{t("auth.registerTitle")}</h1>
        <p className="auth-subtitle">
          {step === 0 && t("auth.registerStepAboutYou")}
          {step === 1 && t("auth.registerStepOrganization")}
          {step === 2 && t("auth.registerStepMode")}
          {step === 3 && t("auth.registerStepCredentials")}
        </p>
      </div>

      <div className="auth-steps">
        <div className="auth-steps-track">
          {stepLabels.map((label, index) => (
            <div
              key={label}
              className={`auth-step-seg ${index <= step ? "on" : ""} ${index === step ? "current" : ""}`}
            />
          ))}
        </div>
        <div className="auth-steps-label">
          Step {step + 1} of {stepLabels.length} · {stepLabels[step]}
        </div>
      </div>

      <ErrorBanner message={error} />

      <div key={`body-${animKey}`} className="auth-slide min-h-[180px]">
        {step === 0 ? (
          <div className="auth-name-row">
            <Field label={t("auth.firstName")} value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <Field label={t("auth.lastName")} value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
        ) : null}

        {step === 1 ? (
          <>
            <Field
              label={t("auth.organizationName")}
              value={organizationName}
              onChange={setOrganizationName}
              placeholder="Nova Elite Homes"
              autoComplete="organization"
            />
            <div className="auth-hint">
              <Info size={18} className="shrink-0 text-[var(--primary)]" />
              <p>{t("auth.organizationHint")}</p>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <div className="space-y-2">
            <div className="field-label">{t("auth.chooseMode")}</div>
            {MODES.map((mode) => {
              const active = organizationKind === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  className={`auth-mode-card ${active ? "on" : ""}`}
                  onClick={() => setOrganizationKind(mode.id)}
                >
                  <span className="auth-mode-icon" style={{ background: `${mode.tint}22`, color: mode.tint }}>
                    {mode.icon}
                  </span>
                  <span className="auth-mode-copy">
                    <span className="auth-mode-title">{t(`workspaces.kinds.${mode.id}` as TranslationKey)}</span>
                    <span className="auth-mode-hint">{t(`workspaces.kindHints.${mode.id}` as TranslationKey)}</span>
                  </span>
                  <span className={`auth-mode-check ${active ? "on" : ""}`}>
                    {active ? <Check size={14} /> : null}
                  </span>
                </button>
              );
            })}
            {organizationKind === "MAINTENANCE" ? (
              <div className="auth-operator-row">
                {(["LANDLORD", "MAINTENANCE_COMPANY"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`auth-operator-chip ${operatorType === id ? "on" : ""}`}
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
            <Field
              label={t("auth.email")}
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              autoComplete="email"
            />
            <Field
              label={t("auth.password")}
              value={password}
              onChange={setPassword}
              type="password"
              placeholder={t("auth.passwordMin")}
              autoComplete="new-password"
            />
          </>
        ) : null}
      </div>

      <Button className="mt-2 w-full" loading={loading} onClick={handleNext}>
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
