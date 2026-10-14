"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { propertiesQuery } from "@/lib/queries";
import type { Property } from "@/lib/types";

export default function NewMaintenanceIssuePage() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const homes = properties.data?.data ?? [];
  const [propertyId, setPropertyId] = useState("");
  const [homeName, setHomeName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const creatingHome = homes.length === 0;

  const save = useMutation({
    mutationFn: async () => {
      let resolved = propertyId;
      if (creatingHome) {
        const created = await apiRequest<Property>("/api/properties", {
          method: "POST",
          token: session?.token,
          body: {
            internalName: homeName.trim(),
            publicName: homeName.trim(),
            addressLine1: addressLine1.trim(),
            city: city.trim(),
            postcode: postcode.trim(),
            country: "GB",
          },
        });
        resolved = created.id;
      }
      return apiRequest("/api/maintenance/issues", {
        method: "POST",
        token: session?.token,
        body: { propertyId: resolved, title: title.trim(), description: description.trim() },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["maintenance-issues"] });
      router.replace("/maintenance/issues");
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : t("common.somethingWentWrong")),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("maintenance.addIssue")} />
      <ErrorBanner message={error} />
      {creatingHome ? (
        <>
          <Field label="Home name" value={homeName} onChange={setHomeName} />
          <Field label="Address" value={addressLine1} onChange={setAddressLine1} />
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Postcode" value={postcode} onChange={setPostcode} />
        </>
      ) : (
        <label className="mb-3 block text-sm">
          Property
          <select className="field mt-1" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
            <option value="">Select</option>
            {homes.map((home) => (
              <option key={home.id} value={home.id}>
                {home.publicName || home.internalName}
              </option>
            ))}
          </select>
        </label>
      )}
      <Field label={t("maintenance.title")} value={title} onChange={setTitle} />
      <Field label={t("maintenance.description")} value={description} onChange={setDescription} />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        {t("common.save")}
      </Button>
    </div>
  );
}
