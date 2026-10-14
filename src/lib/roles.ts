export function isInvestor(role?: string) {
  return role === "OWNER";
}

export function isOperationalStaff(role?: string) {
  return role === "CLEANER" || role === "RUNNER" || role === "MAINTENANCE";
}

export function canViewAiActivity(role?: string) {
  return (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "MANAGER" ||
    role === "REVENUE_MANAGER" ||
    role === "GUEST_SERVICES"
  );
}
