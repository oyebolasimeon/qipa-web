"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Property } from "@/lib/types";

export default function NewPropertyPage() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest<Property>("/api/properties", {
        method: "POST",
        token: session?.token,
        body: {
          internalName: name.trim(),
          publicName: name.trim(),
          addressLine1: address.trim(),
          city: city.trim(),
          postcode: postcode.trim(),
          country: "GB",
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
          maxGuests: 2,
          basePrice: 0,
          currency: session?.organization.defaultCurrency ?? "GBP",
        },
      }),
    onSuccess: async (property) => {
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      router.replace(`/property/${property.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not add property"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add property" />
      <ErrorBanner message={error} />
      <Field label="Name" value={name} onChange={setName} />
      <Field label="Address" value={address} onChange={setAddress} />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="Postcode" value={postcode} onChange={setPostcode} />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save
      </Button>
    </div>
  );
}
