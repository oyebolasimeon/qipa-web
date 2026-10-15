"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PropertyPicker } from "@/components/property-picker";
import { Button, ErrorBanner, Field, FormSelect, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { propertiesQuery } from "@/lib/queries";

export default function NewOwnerPage() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [ownershipPercent, setOwnershipPercent] = useState("100");
  const [managementFeePercent, setManagementFeePercent] = useState("15");
  const [payoutSchedule, setPayoutSchedule] = useState("MONTHLY");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest("/api/owners", {
        method: "POST",
        token: session?.token,
        body: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          propertyIds: propertyId ? [propertyId] : [],
          ownershipPercent: Number(ownershipPercent),
          managementFeePercent: Number(managementFeePercent),
          payoutSchedule,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["owners"] });
      router.replace("/owners");
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not save owner"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add owner" />
      <ErrorBanner message={error} />
      <Field label="Name" value={name} onChange={setName} />
      <Field label="Email" value={email} onChange={setEmail} />
      <Field label="Phone" value={phone} onChange={setPhone} />
      <PropertyPicker
        label="Property"
        value={propertyId}
        onChange={setPropertyId}
        properties={properties.data?.data ?? []}
        loading={properties.isPending}
        placeholder="Choose a property"
      />
      <Field label="Ownership %" value={ownershipPercent} onChange={setOwnershipPercent} />
      <Field label="Management fee %" value={managementFeePercent} onChange={setManagementFeePercent} />
      <FormSelect
        label="Payout schedule"
        value={payoutSchedule}
        onChange={setPayoutSchedule}
        options={[
          { value: "MONTHLY", label: "Monthly" },
          { value: "QUARTERLY", label: "Quarterly" },
        ]}
      />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save
      </Button>
    </div>
  );
}
