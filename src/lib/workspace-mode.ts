import type { OrganizationKind } from "./types";

export function isSupportedWorkspace(kind?: OrganizationKind | string | null) {
  return kind === "SUPPORTED_ACCOMMODATION";
}

export function isHospitalityWorkspace(kind?: OrganizationKind | string | null) {
  return kind === "HOSPITALITY";
}

export function isFlatsharesWorkspace(kind?: OrganizationKind | string | null) {
  return kind === "FLATSHARES";
}

export function isMaintenanceWorkspace(kind?: OrganizationKind | string | null) {
  return kind === "MAINTENANCE";
}

export function showsSupportedNav(kind?: OrganizationKind | string | null) {
  return kind === "SUPPORTED_ACCOMMODATION" || kind === "MIXED";
}

export function showsHospitalityNav(kind?: OrganizationKind | string | null) {
  return kind === "HOSPITALITY" || kind === "MIXED";
}

export function showsFlatsharesNav(kind?: OrganizationKind | string | null) {
  return kind === "FLATSHARES";
}

export function showsMaintenanceNav(kind?: OrganizationKind | string | null) {
  return (
    kind === "MAINTENANCE" ||
    kind === "FLATSHARES" ||
    kind === "HOSPITALITY" ||
    kind === "SUPPORTED_ACCOMMODATION" ||
    kind === "MIXED"
  );
}
