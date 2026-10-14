"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { en, type TranslationTree } from "./en";

type LeafPaths<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: LeafPaths<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

export type TranslationKey = LeafPaths<TranslationTree>;
type Params = Record<string, string | number>;

function lookup(tree: TranslationTree, key: string): string | undefined {
  const parts = key.split(".");
  let node: unknown = tree;
  for (const part of parts) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, params?: Params) {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function translate(key: TranslationKey, params?: Params) {
  return interpolate(lookup(en, key) ?? key, params);
}

const I18nContext = createContext({ t: translate });

export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ t: translate }), []);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
