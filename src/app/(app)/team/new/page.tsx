"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, FormSelect, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { propertiesQuery } from "@/lib/queries";

const ROLES = ["CLEANER", "RUNNER", "MAINTENANCE", "MANAGER", "ADMIN", "OWNER", "GUEST_SERVICES"];

export default function NewTeamMemberPage() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLEANER");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const staffRole = ["CLEANER", "RUNNER", "MAINTENANCE"].includes(role);

  const save = useMutation({
    mutationFn: () =>
      apiRequest("/api/workers", {
        method: "POST",
        token: session?.token,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          role,
          password: staffRole ? undefined : password.trim() || undefined,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workers"] });
      router.replace("/team");
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not add team member"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add staff" />
      <ErrorBanner message={error} />
      <Field label="First name" value={firstName} onChange={setFirstName} />
      <Field label="Last name" value={lastName} onChange={setLastName} />
      <Field label="Email" value={email} onChange={setEmail} />
      <FormSelect
        label="Role"
        value={role}
        onChange={setRole}
        options={ROLES.map((item) => ({ value: item, label: item.replace(/_/g, " ") }))}
      />
      {staffRole ? null : <Field label="Sign-in password" value={password} onChange={setPassword} type="password" />}
      <p className="mb-4 text-xs text-[var(--text-muted)]">{properties.data?.data?.length ?? 0} properties in this business.</p>
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save
      </Button>
    </div>
  );
}
