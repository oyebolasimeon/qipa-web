"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, FormSelect, PageHeader } from "@/components/ui";
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
  const [basePrice, setBasePrice] = useState("120");
  const [bedrooms, setBedrooms] = useState("1");
  const [maxGuests, setMaxGuests] = useState("2");
  const [propertyType, setPropertyType] = useState("APARTMENT");
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
          propertyType,
          unitType: "ENTIRE_PLACE",
          bedrooms: Number(bedrooms) || 1,
          beds: Number(bedrooms) || 1,
          bathrooms: 1,
          maxGuests: Number(maxGuests) || 2,
          basePrice: Number(basePrice) || 0,
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
      <PageHeader title="Add property" subtitle="Create a home Ocupai can operate" />
      <ErrorBanner message={error} />
      <div className="form-panel">
        <Field label="Name" value={name} onChange={setName} placeholder="Shoreditch Loft" />
        <Field label="Address" value={address} onChange={setAddress} />
        <Field label="City" value={city} onChange={setCity} />
        <Field label="Postcode" value={postcode} onChange={setPostcode} />
        <FormSelect
          label="Type"
          value={propertyType}
          onChange={setPropertyType}
          options={[
            { value: "APARTMENT", label: "Apartment" },
            { value: "HOUSE", label: "House" },
            { value: "STUDIO", label: "Studio" },
            { value: "VILLA", label: "Villa" },
          ]}
        />
        <Field label="Nightly rate" value={basePrice} onChange={setBasePrice} />
        <Field label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
        <Field label="Max guests" value={maxGuests} onChange={setMaxGuests} />
        <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
          Save property
        </Button>
      </div>
    </div>
  );
}
