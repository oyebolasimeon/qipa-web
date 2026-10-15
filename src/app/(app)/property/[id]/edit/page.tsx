"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ErrorBanner, Field, FormSelect, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Property } from "@/lib/types";

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["property", id],
    queryFn: () => apiRequest<Property>(`/api/properties/${id}`, { token: session?.token }),
    enabled: !!session?.token && !!id,
  });
  const [publicName, setPublicName] = useState("");
  const [internalName, setInternalName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [basePrice, setBasePrice] = useState("0");
  const [bedrooms, setBedrooms] = useState("1");
  const [maxGuests, setMaxGuests] = useState("2");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setPublicName(query.data.publicName);
    setInternalName(query.data.internalName);
    setAddress(query.data.addressLine1);
    setCity(query.data.city);
    setPostcode(query.data.postcode);
    setBasePrice(String(query.data.basePrice ?? 0));
    setBedrooms(String(query.data.bedrooms ?? 1));
    setMaxGuests(String(query.data.maxGuests ?? 2));
    setStatus(query.data.status);
  }, [query.data]);

  const save = useMutation({
    mutationFn: () =>
      apiRequest(`/api/properties/${id}`, {
        method: "PATCH",
        token: session?.token,
        body: {
          publicName: publicName.trim(),
          internalName: internalName.trim(),
          addressLine1: address.trim(),
          city: city.trim(),
          postcode: postcode.trim(),
          basePrice: Number(basePrice),
          bedrooms: Number(bedrooms),
          maxGuests: Number(maxGuests),
          status,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["property", id] });
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      router.replace(`/property/${id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not save"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Edit property" />
      <ErrorBanner message={error} />
      <Field label="Public name" value={publicName} onChange={setPublicName} />
      <Field label="Internal name" value={internalName} onChange={setInternalName} />
      <Field label="Address" value={address} onChange={setAddress} />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="Postcode" value={postcode} onChange={setPostcode} />
      <Field label="Nightly rate" value={basePrice} onChange={setBasePrice} />
      <Field label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
      <Field label="Max guests" value={maxGuests} onChange={setMaxGuests} />
      <FormSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
      />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save changes
      </Button>
    </div>
  );
}
