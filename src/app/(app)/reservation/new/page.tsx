"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PropertyPicker } from "@/components/property-picker";
import { RangePicker, addDays, todayIso } from "@/components/range-picker";
import { SkeletonForm } from "@/components/skeleton";
import { Button, ErrorBanner, FormDropdown, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { guestsQuery, propertiesQuery } from "@/lib/queries";
import type { Reservation } from "@/lib/types";

function NewReservationInner() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const guests = useQuery(guestsQuery(session?.organization.id, session?.token));
  const seededIn = params.get("checkIn")?.slice(0, 10) ?? todayIso();
  const [propertyId, setPropertyId] = useState(params.get("propertyId") ?? "");
  const [guestId, setGuestId] = useState("");
  const [checkIn, setCheckIn] = useState(seededIn);
  const [checkOut, setCheckOut] = useState(params.get("checkOut")?.slice(0, 10) ?? addDays(seededIn, 2));
  const [error, setError] = useState("");
  const homes = properties.data?.data ?? [];

  const save = useMutation({
    mutationFn: () =>
      apiRequest<Reservation>("/api/reservations", {
        method: "POST",
        token: session?.token,
        body: {
          propertyId,
          guestId,
          checkIn: new Date(`${checkIn}T14:00:00`).toISOString(),
          checkOut: new Date(`${checkOut}T11:00:00`).toISOString(),
          source: "DIRECT",
          status: "CONFIRMED",
          paymentStatus: "UNPAID",
        },
      }),
    onSuccess: async (reservation) => {
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["calendar"] });
      router.replace(`/reservation/${reservation.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not create booking"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add booking" subtitle="Pick the stay nights, then guest and property" />
      <ErrorBanner message={error} />
      <div className="form-panel space-y-1">
        <PropertyPicker
          label="Property"
          value={propertyId}
          onChange={setPropertyId}
          properties={homes}
          variant="list"
          loading={properties.isPending}
          placeholder="Choose a property"
        />
        <FormDropdown
          label="Guest"
          value={guestId}
          onChange={setGuestId}
          options={(guests.data?.data ?? []).map((item) => ({
            value: item.id,
            label: item.fullName,
          }))}
        />
        <div className="field-label">Stay dates</div>
        <RangePicker
          startDate={checkIn}
          endDate={checkOut}
          onChange={(start, end) => {
            setCheckIn(start);
            setCheckOut(end);
          }}
        />
        <Button
          className="mt-2 w-full"
          loading={save.isPending}
          onClick={() => {
            if (!propertyId || !guestId) {
              setError("Select a property and guest");
              return;
            }
            if (!checkIn || !checkOut || checkOut < checkIn) {
              setError("Check the stay dates");
              return;
            }
            setError("");
            save.mutate();
          }}
        >
          Create booking
        </Button>
      </div>
    </div>
  );
}

export default function NewReservationPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl"><SkeletonForm fields={3} /></div>}>
      <NewReservationInner />
    </Suspense>
  );
}
