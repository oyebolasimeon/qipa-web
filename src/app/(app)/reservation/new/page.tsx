"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { guestsQuery, propertiesQuery } from "@/lib/queries";
import type { Reservation } from "@/lib/types";

export default function NewReservationPage() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const guests = useQuery(guestsQuery(session?.organization.id, session?.token));
  const [propertyId, setPropertyId] = useState("");
  const [guestId, setGuestId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest<Reservation>("/api/reservations", {
        method: "POST",
        token: session?.token,
        body: { propertyId, guestId, checkIn, checkOut, source: "DIRECT" },
      }),
    onSuccess: async (reservation) => {
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
      router.replace(`/reservation/${reservation.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not create booking"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add booking" />
      <ErrorBanner message={error} />
      <label className="mb-3 block text-sm">
        Property
        <select className="field mt-1" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
          <option value="">Select</option>
          {(properties.data?.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.publicName || item.internalName}
            </option>
          ))}
        </select>
      </label>
      <label className="mb-3 block text-sm">
        Guest
        <select className="field mt-1" value={guestId} onChange={(event) => setGuestId(event.target.value)}>
          <option value="">Select</option>
          {(guests.data?.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.fullName}
            </option>
          ))}
        </select>
      </label>
      <Field label="Check in" value={checkIn} onChange={setCheckIn} type="date" />
      <Field label="Check out" value={checkOut} onChange={setCheckOut} type="date" />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save
      </Button>
    </div>
  );
}
