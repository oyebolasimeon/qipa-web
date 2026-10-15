"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, Field, Glass, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ocupaiPropertyName } from "@/lib/property-name";
import { propertiesQuery } from "@/lib/queries";

type KnowledgeItem = { id?: string; title: string; content: string; category?: string; propertyId?: string };

export default function KnowledgePage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("WiFi");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const query = useQuery({
    queryKey: ["knowledge", session?.organization.id],
    queryFn: () => apiRequest<KnowledgeItem[]>("/api/knowledge", { token: session?.token }),
    enabled: !!session?.token,
  });
  const properties = useQuery(propertiesQuery(session?.organization.id, session?.token));
  const save = useMutation({
    mutationFn: () =>
      apiRequest("/api/knowledge", {
        method: "POST",
        token: session?.token,
        body: { title: title.trim(), content: content.trim(), category: "ACCESS" },
      }),
    onSuccess: async () => {
      setAdding(false);
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
  const rows = query.data ?? [];

  return (
    <div>
      <PageHeader
        title="Property knowledge"
        subtitle="Answers Ocupai uses for guest messages"
        action={
          <Button size="sm" onClick={() => setAdding((value) => !value)}>
            {adding ? "Close" : "Add"}
          </Button>
        }
      />
      {adding ? (
        <Glass className="form-panel mb-4">
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Content" value={content} onChange={setContent} multiline />
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Save
          </Button>
        </Glass>
      ) : null}
      {query.isPending ? <SkeletonList rows={5} /> : null}
      {rows.length === 0 && !query.isPending ? <EmptyState title="No knowledge notes yet." /> : null}
      {rows.length ? (
        <div className="list-stack">
          {rows.map((row, index) => (
            <div key={row.id ?? index} className="list-row !items-start">
              <div className="list-row-body">
                <div className="list-row-title">{row.title}</div>
                <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                  {row.content}
                </div>
                <div className="list-row-sub">
                  {row.category}
                  {row.propertyId
                    ? ` · ${ocupaiPropertyName(properties.data?.data.find((item) => item.id === row.propertyId))}`
                    : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
