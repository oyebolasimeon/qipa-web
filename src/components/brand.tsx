"use client";

import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function OcupaiMark({ size = 88 }: { size?: number }) {
  const radius = Math.round(size * 0.223);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/ocupai-logo.png"
      alt={BRAND_NAME}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: radius }}
    />
  );
}

export function Wordmark({ size = 34 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size, lineHeight: 1.1 }}>
      {BRAND_NAME}
    </span>
  );
}

export function AuthBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${compact ? "mb-6" : "mb-8"}`}>
      <OcupaiMark size={compact ? 64 : 88} />
      <div className="mt-4">
        <Wordmark size={compact ? 28 : 34} />
      </div>
      {compact ? null : (
        <p className="mt-2 max-w-sm px-4 text-center text-[15px] leading-6 text-[var(--text-secondary)]">
          {BRAND_TAGLINE}
        </p>
      )}
    </div>
  );
}
