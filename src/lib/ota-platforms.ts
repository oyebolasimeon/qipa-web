export type OtaPlatform = "AIRBNB" | "BOOKING_COM" | "VRBO";

export const OTA_CHANNEL_CODES: Record<OtaPlatform, string> = {
  AIRBNB: "ABB",
  BOOKING_COM: "BDC",
  VRBO: "VRB",
};

export const OTA_PLATFORMS: OtaPlatform[] = ["AIRBNB", "BOOKING_COM", "VRBO"];

export const OTA_PLATFORM_META: Record<OtaPlatform, { label: string; shortLabel: string; color: string; subtitle: string }> = {
  AIRBNB: { label: "Airbnb", shortLabel: "Airbnb", color: "#E85D6A", subtitle: "Listings & reservations" },
  BOOKING_COM: { label: "Booking.com", shortLabel: "Booking.com", color: "#003580", subtitle: "Hotels & apartments" },
  VRBO: { label: "Vrbo", shortLabel: "Vrbo", color: "#4DB4E7", subtitle: "Vacation rentals" },
};
