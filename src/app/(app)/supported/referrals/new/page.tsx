"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function NewReferralPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [source, setSource] = useState("Council");
  const [referrerName, setReferrerName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localAuthority, setLocalAuthority] = useState("");
  const [fundingMaxWeekly, setFundingMaxWeekly] = useState("400");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest<{ id: string }>("/api/supported/referrals", {
        method: "POST",
        token: session?.token,
        body: {
          source: source.trim(),
          referrerName: referrerName.trim() || undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          localAuthority: localAuthority.trim() || undefined,
          fundingMaxWeekly: Number(fundingMaxWeekly) || undefined,
        },
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["supported-referrals"] });
      router.replace(`/supported/referrals/${created.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not save"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("supported.newReferral")} subtitle={t("supported.referralsSubtitle")} />
      <ErrorBanner message={error} />
      <Field label={t("supported.source")} value={source} onChange={setSource} />
      <Field label={t("supported.referrerName")} value={referrerName} onChange={setReferrerName} />
      <Field label={t("supported.firstName")} value={firstName} onChange={setFirstName} />
      <Field label={t("supported.lastName")} value={lastName} onChange={setLastName} />
      <Field label={t("supported.localAuthority")} value={localAuthority} onChange={setLocalAuthority} />
      <Field label={t("supported.maxFunding")} value={fundingMaxWeekly} onChange={setFundingMaxWeekly} />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        {t("common.save")}
      </Button>
    </div>
  );
}
