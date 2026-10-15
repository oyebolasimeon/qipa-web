"use client";

import { Check, ChevronDown, Home, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { ocupaiPropertyName } from "@/lib/property-name";
import type { Property } from "@/lib/types";

type PropertyLike = Pick<
  Property,
  "id" | "publicName" | "internalName" | "city" | "basePrice" | "currency" | "maxGuests" | "bedrooms" | "status"
> & {
  displayName?: string;
  photos?: Array<{ url: string; isCover?: boolean }>;
  coverPhotoUrl?: string;
};

function coverOf(property: PropertyLike) {
  if (property.coverPhotoUrl) return property.coverPhotoUrl;
  return property.photos?.find((photo) => photo.isCover)?.url ?? property.photos?.[0]?.url;
}

function PropertyThumb({ property }: { property: PropertyLike }) {
  const cover = coverOf(property);
  if (cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl(cover)} alt="" className="prop-pick-thumb" />
    );
  }
  return (
    <span className="prop-pick-thumb prop-pick-thumb-empty">
      <Home size={16} />
    </span>
  );
}

function PropertyMeta({ property }: { property: PropertyLike }) {
  const bits = [
    property.internalName && property.internalName !== ocupaiPropertyName(property) ? property.internalName : null,
    property.city,
    property.maxGuests ? `${property.maxGuests} guests` : null,
    property.basePrice != null ? formatCurrency(property.basePrice, property.currency) : null,
  ].filter(Boolean);
  return <div className="prop-pick-meta">{bits.join(" · ")}</div>;
}

export function PropertyPicker({
  label = "Property",
  value,
  properties,
  onChange,
  placeholder = "Choose a property",
  variant = "sheet",
  allowEmpty = false,
  emptyLabel = "All properties",
  loading = false,
}: {
  label?: string;
  value: string;
  properties: PropertyLike[];
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "sheet" | "list";
  allowEmpty?: boolean;
  emptyLabel?: string;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = properties.find((item) => item.id === value);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return properties;
    return properties.filter((item) => {
      const haystack = [ocupaiPropertyName(item), item.internalName, item.city, item.publicName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [properties, query]);

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

  const searchField = properties.length > 0 ? (
    <label className="prop-pick-search">
      <Search size={16} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, code, or city"
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
      {allowEmpty && variant === "sheet" ? (
        <button type="button" className={`prop-pick-card ${!value ? "on" : ""}`} onClick={() => pick("")}>
          <span className="prop-pick-thumb prop-pick-thumb-empty">
            <Home size={16} />
          </span>
          <div className="prop-pick-copy">
            <div className="prop-pick-name">{emptyLabel}</div>
            <div className="prop-pick-meta">No property filter</div>
          </div>
          {!value ? <Check size={18} className="prop-pick-check" /> : null}
        </button>
      ) : null}
      {properties.length === 0 ? (
        <div className="prop-pick-empty">No properties yet.</div>
      ) : filtered.length === 0 ? (
        <div className="prop-pick-empty">No matches for “{query.trim()}”.</div>
      ) : (
        filtered.map((property) => {
          const active = property.id === value;
          return (
            <button
              key={property.id}
              type="button"
              className={`prop-pick-card ${active ? "on" : ""}`}
              onClick={() => (variant === "sheet" ? pick(property.id) : onChange(property.id))}
            >
              <PropertyThumb property={property} />
              <div className="prop-pick-copy">
                <div className="prop-pick-name">{ocupaiPropertyName(property)}</div>
                <PropertyMeta property={property} />
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
            <PropertyThumb property={selected} />
            <div className="prop-pick-copy">
              <div className="prop-pick-name">{ocupaiPropertyName(selected)}</div>
              <PropertyMeta property={selected} />
            </div>
          </>
        ) : (
          <>
            <span className="prop-pick-thumb prop-pick-thumb-empty">
              <Home size={16} />
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
