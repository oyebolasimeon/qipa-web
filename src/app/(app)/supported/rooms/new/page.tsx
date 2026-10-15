"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ErrorBanner, Field, FormDropdown, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ocupaiPropertyName } from "@/lib/property-name";
import { propertiesQuery } from "@/lib/queries";
import type { Property } from "@/lib/types";

const NEW_HOME = "__new_home__";

export default function NewSupportedRoomPage() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const homes = properties.data?.data ?? [];
  const [propertyId, setPropertyId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("350");
  const [localAuthority, setLocalAuthority] = useState("");
  const [homeName, setHomeName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");
  const creatingNewHome = propertyId === NEW_HOME || (!properties.isPending && homes.length === 0);
  const weeklyAmount = Number(weeklyRate);

  const save = useMutation({
    mutationFn: async () => {
      let resolved = propertyId;
      if (creatingNewHome) {
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
            propertyType: "HOUSE",
            unitType: "ROOM",
            currency: "GBP",
            basePrice: weeklyAmount,
          },
        });
        resolved = created.id;
      }
      return apiRequest<{ id: string }>("/api/supported/rooms", {
        method: "POST",
        token: session?.token,
        body: {
          propertyId: resolved,
          roomNumber: roomNumber.trim(),
          weeklyRate: weeklyAmount,
          localAuthority: localAuthority.trim() || city.trim() || undefined,
          status: "AVAILABLE",
          readyForReferral: true,
        },
      });
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["supported-rooms"] });
      router.replace(`/supported/rooms/${created.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not save room"),
  });

  const selected = useMemo(() => propertyId || homes[0]?.id || NEW_HOME, [homes, propertyId]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add room" />
      <ErrorBanner message={error} />
      <FormDropdown
        label="Home"
        value={creatingNewHome ? NEW_HOME : selected}
        onChange={setPropertyId}
        options={[
          ...homes.map((home) => ({ value: home.id, label: ocupaiPropertyName(home) })),
          { value: NEW_HOME, label: "New home" },
        ]}
      />
      {creatingNewHome ? (
        <>
          <Field label="Home name" value={homeName} onChange={setHomeName} />
          <Field label="Address" value={addressLine1} onChange={setAddressLine1} />
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Postcode" value={postcode} onChange={setPostcode} />
        </>
      ) : null}
      <Field label="Room number" value={roomNumber} onChange={setRoomNumber} />
      <Field label="Weekly rate" value={weeklyRate} onChange={setWeeklyRate} />
      <Field label="Local authority" value={localAuthority} onChange={setLocalAuthority} />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save
      </Button>
    </div>
  );
}
