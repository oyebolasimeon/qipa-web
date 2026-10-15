const formatLocale = "en-GB";

export function formatCurrency(value: number, currency = "GBP") {
  return new Intl.NumberFormat(formatLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(formatLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatWhen(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString(formatLocale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function occupancyPct(value: number) {
  return `${Math.round((Number.isFinite(value) ? value : 0) * 100)}%`;
}

export function docId(item?: { id?: string; _id?: string } | string | null) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.id ?? item._id ?? "";
}
