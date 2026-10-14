"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ErrorBanner, Field, PageHeader } from "@/components/ui";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { propertiesQuery } from "@/lib/queries";
import type { Task } from "@/lib/types";

export default function NewTaskPage() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const [title, setTitle] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest<Task>("/api/tasks", {
        method: "POST",
        token: session?.token,
        body: { title: title.trim(), type: "MAINTENANCE", propertyId, priority: "NORMAL" },
      }),
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.replace(`/task/${task.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not create task"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add task" />
      <ErrorBanner message={error} />
      <Field label="Title" value={title} onChange={setTitle} />
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
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        Save
      </Button>
    </div>
  );
}
