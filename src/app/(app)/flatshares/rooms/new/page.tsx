"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function NewFlatshareRoomPage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [homeName, setHomeName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [code, setCode] = useState("");
  const [rent, setRent] = useState("650");
  const [deposit, setDeposit] = useState("650");
  const [error, setError] = useState("");

  const properties = useQuery({
    queryKey: ["flatshare-properties", session?.organization.id],
    queryFn: () =>
      apiRequest<{ data: Array<{ id: string; name: string }> }>("/api/flatshares/properties", {
        token: session?.token,
      }),
    enabled: !!session?.token,
  });
  const [propertyId, setPropertyId] = useState("__new__");
  const homes = properties.data?.data ?? [];
  const creatingHome = propertyId === "__new__" || homes.length === 0;

  const save = useMutation({
    mutationFn: async () => {
      let resolved = creatingHome ? "" : propertyId;
      if (creatingHome) {
        const created = await apiRequest<{ id: string }>("/api/flatshares/properties", {
          method: "POST",
          token: session?.token,
          body: { name: homeName.trim(), addressLine1: addressLine1.trim(), city: city.trim(), postcode: postcode.trim(), ownershipModel: "OWNED" },
        });
        resolved = created.id;
      }
      return apiRequest("/api/flatshares/rooms", {
        method: "POST",
        token: session?.token,
        body: { propertyId: resolved, code: code.trim(), advertisedRent: Number(rent), deposit: Number(deposit) },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flatshare-rooms"] });
      router.replace("/flatshares/rooms");
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("common.somethingWentWrong")),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("flatshares.addRoom")} />
      <ErrorBanner message={error} />
      {homes.length > 0 ? (
        <label className="mb-3 block text-sm">
          Home
          <select className="field mt-1" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
            <option value="__new__">{t("supported.addNewHome")}</option>
            {homes.map((home) => (
              <option key={home.id} value={home.id}>
                {home.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {creatingHome ? (
        <>
          <Field label={t("supported.homeName")} value={homeName} onChange={setHomeName} />
          <Field label="Address" value={addressLine1} onChange={setAddressLine1} />
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Postcode" value={postcode} onChange={setPostcode} />
        </>
      ) : null}
      <Field label={t("flatshares.roomCode")} value={code} onChange={setCode} />
      <Field label={t("flatshares.rent")} value={rent} onChange={setRent} />
      <Field label={t("flatshares.deposit")} value={deposit} onChange={setDeposit} />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        {t("common.save")}
      </Button>
    </div>
  );
}
