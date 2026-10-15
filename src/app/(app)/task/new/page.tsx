"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PropertyPicker } from "@/components/property-picker";
import { Button, ErrorBanner, Field, FormSelect, PageHeader } from "@/components/ui";
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
  const [type, setType] = useState("CLEANING");
  const [priority, setPriority] = useState("NORMAL");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: () =>
      apiRequest<Task>("/api/tasks", {
        method: "POST",
        token: session?.token,
        body: {
          title: title.trim(),
          type,
          propertyId,
          priority,
          description: description.trim() || undefined,
        },
      }),
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.replace(`/task/${task.id}`);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Could not create task"),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add task" subtitle="Assign operational work for a home" />
      <ErrorBanner message={error} />
      <div className="form-panel">
        <Field label="Title" value={title} onChange={setTitle} placeholder="Turnover clean" />
        <PropertyPicker
          label="Property"
          value={propertyId}
          onChange={setPropertyId}
          properties={properties.data?.data ?? []}
          loading={properties.isPending}
          placeholder="Select a property"
        />
        <FormSelect
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: "CLEANING", label: "Cleaning" },
            { value: "MAINTENANCE", label: "Maintenance" },
            { value: "INSPECTION", label: "Inspection" },
            { value: "OTHER", label: "Other" },
          ]}
        />
        <FormSelect
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={[
            { value: "LOW", label: "Low" },
            { value: "NORMAL", label: "Normal" },
            { value: "HIGH", label: "High" },
            { value: "URGENT", label: "Urgent" },
          ]}
        />
        <Field label="Notes" value={description} onChange={setDescription} multiline />
        <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
          Save task
        </Button>
      </div>
    </div>
  );
}
