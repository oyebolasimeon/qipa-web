"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SkeletonList } from "@/components/skeleton";
import { Button, EmptyState, Field, FormSelect, Glass, PageHeader, StatusPill } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { docId, formatCurrency } from "@/lib/format";
import { canOperate } from "@/lib/roles";

type Rule = {
  id?: string;
  _id?: string;
  name: string;
  ruleType: string;
  adjustmentValue: number;
  active?: boolean;
};

type Recommendation = { id?: string; title?: string; summary?: string; suggestedRate?: number; currency?: string };

const TYPES = ["WEEKEND", "LAST_MINUTE", "SEASONAL", "LENGTH_OF_STAY", "CUSTOM"];

export default function PricingPage() {
  const { session } = useAuth();
  const operate = canOperate(session?.membership.role);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [ruleType, setRuleType] = useState("WEEKEND");
  const [adjustmentValue, setAdjustmentValue] = useState("10");

  const rules = useQuery({
    queryKey: ["pricing-rules", session?.organization.id],
    queryFn: () => apiRequest<Rule[]>("/api/pricing/rules", { token: session?.token }),
    enabled: !!session?.token,
  });
  const recs = useQuery({
    queryKey: ["pricing-recommendations", session?.organization.id],
    queryFn: () => apiRequest<Recommendation[]>("/api/pricing/recommendations", { token: session?.token }),
    enabled: !!session?.token,
  });

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name,
        ruleType,
        adjustmentType: "PERCENT",
        adjustmentValue: Number(adjustmentValue),
        active: true,
      };
      if (editId) {
        return apiRequest(`/api/pricing/rules/${editId}`, { method: "PATCH", token: session?.token, body });
      }
      return apiRequest("/api/pricing/rules", { method: "POST", token: session?.token, body });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      setShowForm(false);
      setEditId(null);
      setName("");
    },
  });

  return (
    <div>
      <PageHeader
        title="Pricing"
        subtitle="Rules and recommendations for nightly rates"
        action={
          operate ? (
            <Button onClick={() => setShowForm((value) => !value)}>Add rule</Button>
          ) : undefined
        }
      />
      {showForm ? (
        <Glass className="mb-4">
          <Field label="Name" value={name} onChange={setName} />
          <FormSelect
            label="Type"
            value={ruleType}
            onChange={setRuleType}
            options={TYPES.map((item) => ({ value: item, label: item.replace(/_/g, " ") }))}
          />
          <Field label="Adjustment %" value={adjustmentValue} onChange={setAdjustmentValue} />
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Save
          </Button>
        </Glass>
      ) : null}
      {(recs.data ?? []).length ? (
        <div className="mb-6 space-y-3">
          {recs.data!.map((item, index) => (
            <Glass key={item.id ?? index} accent>
              <div className="font-semibold">{item.title ?? "Recommendation"}</div>
              <div className="text-sm text-[var(--text-secondary)]">{item.summary}</div>
              {item.suggestedRate ? <div className="mt-1">{formatCurrency(item.suggestedRate, item.currency)}</div> : null}
            </Glass>
          ))}
        </div>
      ) : null}
      {rules.isPending ? <SkeletonList rows={5} /> : null}
      {(rules.data ?? []).length === 0 && !rules.isPending ? <EmptyState title="No pricing rules yet." /> : null}
      <div className="space-y-3">
        {(rules.data ?? []).map((rule) => (
          <Glass
            key={docId(rule)}
            onClick={
              operate
                ? () => {
                    setEditId(docId(rule));
                    setName(rule.name);
                    setRuleType(rule.ruleType);
                    setAdjustmentValue(String(rule.adjustmentValue));
                    setShowForm(true);
                  }
                : undefined
            }
          >
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{rule.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {rule.ruleType.replace(/_/g, " ")} · {rule.adjustmentValue}%
                </div>
              </div>
              <StatusPill>{rule.active === false ? "Off" : "On"}</StatusPill>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
