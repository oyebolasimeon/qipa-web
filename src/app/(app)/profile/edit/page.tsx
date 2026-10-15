"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthSession } from "@/lib/types";

export default function EditProfilePage() {
  const { session, applySessionProfile } = useAuth();
  const router = useRouter();
  const allowCompany = session?.membership.role === "SUPER_ADMIN" || session?.membership.role === "ADMIN";
  const [firstName, setFirstName] = useState(session?.user.firstName ?? "");
  const [lastName, setLastName] = useState(session?.user.lastName ?? "");
  const [phone, setPhone] = useState(session?.user.phone ?? "");
  const [organizationName, setOrganizationName] = useState(session?.organization.name ?? "");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest<{
        user: AuthSession["user"];
        organization: AuthSession["organization"];
        membership: AuthSession["membership"];
      }>("/api/auth/me", {
        method: "PATCH",
        token: session?.token,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          ...(allowCompany ? { organizationName: organizationName.trim() } : {}),
        },
      }),
    onSuccess: (profile) => {
      applySessionProfile(profile);
      router.back();
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not save"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Edit profile" />
      <ErrorBanner message={error} />
      <Field label="First name" value={firstName} onChange={setFirstName} />
      <Field label="Last name" value={lastName} onChange={setLastName} />
      <Field label="Phone" value={phone} onChange={setPhone} />
      {allowCompany ? <Field label="Business name" value={organizationName} onChange={setOrganizationName} /> : null}
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save changes
      </Button>
    </div>
  );
}
