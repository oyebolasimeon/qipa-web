export const BOOKING_SOURCE_COLOR = {
  DIRECT: "#2DB49B",
  AIRBNB: "#FF5960",
  BOOKING_COM: "#003680",
  VRBO: "#70B6DE",
  OTHER: "#70B6DE",
} as const;

export function bookingSourceColor(source?: string | null) {
  if (source === "DIRECT") return BOOKING_SOURCE_COLOR.DIRECT;
  if (source === "AIRBNB") return BOOKING_SOURCE_COLOR.AIRBNB;
  if (source === "BOOKING_COM") return BOOKING_SOURCE_COLOR.BOOKING_COM;
  if (source === "VRBO") return BOOKING_SOURCE_COLOR.VRBO;
  return BOOKING_SOURCE_COLOR.OTHER;
}
