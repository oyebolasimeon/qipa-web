"use client";

import { Check, ChevronDown, Search, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Guest } from "@/lib/types";

type GuestLike = Pick<Guest, "id" | "fullName" | "email" | "phone">;

function GuestThumb({ name }: { name?: string }) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return <span className="prop-pick-thumb prop-pick-thumb-empty guest-pick-thumb">{initial}</span>;
}

function GuestMeta({ guest }: { guest: GuestLike }) {
  const bits = [guest.email, guest.phone].filter(Boolean);
  return <div className="prop-pick-meta">{bits.length ? bits.join(" · ") : "No contact details"}</div>;
}

export function GuestPicker({
  label = "Guest",
  value,
  guests,
  onChange,
  placeholder = "Choose a guest",
  variant = "sheet",
  loading = false,
}: {
  label?: string;
  value: string;
  guests: GuestLike[];
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "sheet" | "list";
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = guests.find((item) => item.id === value);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return guests;
    return guests.filter((item) => {
      const haystack = [item.fullName, item.email, item.phone].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [guests, query]);

  useEffect(() => {
    if (variant !== "sheet" || !open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const searchField = guests.length > 0 ? (
    <label className="prop-pick-search">
      <Search size={16} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, email, or phone"
        autoComplete="off"
      />
      {query ? (
        <button type="button" className="prop-pick-search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
          <X size={14} />
        </button>
      ) : null}
    </label>
  ) : null;

  const rows = (
    <>
      {guests.length === 0 ? (
        <div className="prop-pick-empty">No guests yet.</div>
      ) : filtered.length === 0 ? (
        <div className="prop-pick-empty">No matches for “{query.trim()}”.</div>
      ) : (
        filtered.map((guest) => {
          const active = guest.id === value;
          return (
            <button
              key={guest.id}
              type="button"
              className={`prop-pick-card ${active ? "on" : ""}`}
              onClick={() => (variant === "sheet" ? pick(guest.id) : onChange(guest.id))}
            >
              <GuestThumb name={guest.fullName} />
              <div className="prop-pick-copy">
                <div className="prop-pick-name">{guest.fullName}</div>
                <GuestMeta guest={guest} />
              </div>
              {active ? <Check size={18} className="prop-pick-check" /> : null}
            </button>
          );
        })
      )}
    </>
  );

  if (variant === "list") {
    return (
      <div className="field-wrap">
        <div className="field-label">{label}</div>
        {loading ? null : searchField}
        <div className="prop-pick-list">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="prop-pick-card" aria-hidden>
                  <span className="sk sk-avatar" style={{ width: 44, height: 44, borderRadius: 12 }} />
                  <div className="prop-pick-copy sk-col">
                    <span className="sk" style={{ width: "45%", height: 14 }} />
                    <span className="sk" style={{ width: "70%", height: 11 }} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            rows
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="field-wrap">
      <div className="field-label">{label}</div>
      {loading ? (
        <div className="prop-pick-trigger" aria-busy="true">
          <span className="sk" style={{ width: 44, height: 44, borderRadius: 12 }} />
          <div className="prop-pick-copy sk-col">
            <span className="sk" style={{ width: "48%", height: 14 }} />
            <span className="sk" style={{ width: "64%", height: 11 }} />
          </div>
        </div>
      ) : (
        <button type="button" className={`prop-pick-trigger ${selected ? "has-value" : ""}`} onClick={() => setOpen(true)}>
          {selected ? (
            <>
              <GuestThumb name={selected.fullName} />
              <div className="prop-pick-copy">
                <div className="prop-pick-name">{selected.fullName}</div>
                <GuestMeta guest={selected} />
              </div>
            </>
          ) : (
            <>
              <span className="prop-pick-thumb prop-pick-thumb-empty">
                <UserRound size={16} />
              </span>
              <div className="prop-pick-copy">
                <div className="prop-pick-placeholder">{placeholder}</div>
              </div>
            </>
          )}
          <ChevronDown size={18} className="text-[var(--text-muted)]" />
        </button>
      )}

      {open ? (
        <div className="sheet-root prop-pick-sheet">
          <button type="button" className="sheet-backdrop" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="sheet prop-pick-panel">
            <div className="sheet-grabber" />
            <div className="prop-pick-head">
              <div className="sheet-title">{label}</div>
              <button type="button" className="prop-pick-close" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {searchField}
            <div className="prop-pick-scroll">{rows}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
