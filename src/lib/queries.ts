import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "./api";
import type {
  CalendarView,
  Conversation,
  ExecutiveBriefing,
  Guest,
  Property,
  Reservation,
  Task,
} from "./types";

export const briefingQuery = (orgId?: string, token?: string) =>
  queryOptions({
    queryKey: ["briefing", orgId],
    queryFn: () => apiRequest<ExecutiveBriefing>("/api/briefing", { token }),
    enabled: !!token && !!orgId,
    staleTime: 4_000,
    refetchInterval: 8_000,
  });

export const calendarQuery = (orgId?: string, year?: number, token?: string) => {
  const y = year ?? new Date().getFullYear();
  return queryOptions({
    queryKey: ["calendar", y, orgId],
    queryFn: () =>
      apiRequest<CalendarView>(`/api/calendar?start=${y}-01-01&end=${y + 1}-01-31`, { token }),
    enabled: !!token && !!orgId,
  });
};

export const reservationsQuery = (orgId?: string, filter = "upcoming", token?: string) =>
  queryOptions({
    queryKey: ["reservations", filter, orgId],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" });
      if (filter) params.set("filter", filter);
      return apiRequest<{ data: Reservation[]; total: number }>(`/api/reservations?${params}`, {
        token,
      });
    },
    enabled: !!token && !!orgId,
  });

export const conversationsQuery = (orgId?: string, token?: string) =>
  queryOptions({
    queryKey: ["conversations", orgId],
    queryFn: () => apiRequest<{ data: Conversation[] }>("/api/conversations", { token }),
    enabled: !!token && !!orgId,
    refetchInterval: 10_000,
  });

export const propertiesQuery = (orgId?: string, token?: string) =>
  queryOptions({
    queryKey: ["properties", orgId],
    queryFn: () => apiRequest<{ data: Property[]; total: number }>("/api/properties?limit=100", { token }),
    enabled: !!token && !!orgId,
  });

export const guestsQuery = (orgId?: string, token?: string) =>
  queryOptions({
    queryKey: ["guests", orgId],
    queryFn: () => apiRequest<{ data: Guest[]; total: number }>("/api/guests?limit=100", { token }),
    enabled: !!token && !!orgId,
  });

export const tasksQuery = (orgId?: string, token?: string) =>
  queryOptions({
    queryKey: ["tasks", orgId],
    queryFn: () => apiRequest<{ data: Task[] }>("/api/tasks?limit=50", { token }),
    enabled: !!token && !!orgId,
  });
