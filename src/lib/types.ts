export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}

export type OrganizationKind =
  | "HOSPITALITY"
  | "FLATSHARES"
  | "MAINTENANCE"
  | "SUPPORTED_ACCOMMODATION"
  | "MIXED";

export interface Organization {
  id: string;
  name: string;
  legalName?: string;
  slug: string;
  timezone: string;
  defaultCurrency: string;
  kind?: OrganizationKind;
}

export interface Membership {
  id: string;
  role: string;
  status: string;
  organizationId: string;
  readOnly?: boolean;
  propertyIds?: string[];
}

export interface AuthSession {
  token: string;
  user: User;
  organization: Organization;
  membership: Membership;
}

export interface WorkspaceMembership {
  organizationId: string;
  organizationName: string;
  kind?: OrganizationKind;
  legalName?: string;
  role: string;
  status: string;
  invitationState: "pending" | "accepted" | "expired" | "revoked";
}

export interface Property {
  id: string;
  organizationId: string;
  displayName?: string;
  internalName: string;
  publicName: string;
  propertyType: string;
  unitType: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime?: string;
  checkOutTime?: string;
  basePrice: number;
  currency: string;
  cleaningFee: number;
  minimumStay: number;
  status: string;
  amenities: string[];
  photos: Array<{ url: string; publicId?: string; isCover: boolean }>;
  notes?: string;
}

export interface ExecutiveBriefing {
  greeting: string;
  summary: {
    propertyCount: number;
    occupiedCount: number;
    arrivalsToday: number;
    departuresToday: number;
    cleansScheduled: number;
    maintenanceIssues: number;
    conversationsHandled: number;
    activeNegotiations: number;
    decisionsWaiting: number;
  };
  kpis: {
    revenueThisMonth: number;
    occupancy: number;
    adr: number;
    revpar: number;
    bookings: number;
    availableNights: number;
  };
  autonomy: {
    autonomyRate: number;
    humanTouchRate: number;
    ownerInterventionsThisWeek: number;
  };
  needsAttention: Array<{
    id: string;
    propertyName: string;
    message: string;
    severity: "info" | "warning" | "critical";
  }>;
  qipaActivity: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    risk: "GREEN" | "AMBER" | "RED";
    recommendedAction?: string;
  }>;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  language?: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  guestId: string;
  guest?: { fullName: string; email?: string; phone?: string };
  property?: {
    publicName: string;
    internalName: string;
    city?: string;
    coverPhotoUrl?: string;
  };
  confirmationCode: string;
  source: string;
  status: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  stayStatus?: "upcoming" | "in_house" | "checked_out" | "cancelled";
  notes?: string;
}

export interface CalendarView {
  startDate: string;
  endDate: string;
  properties: Array<{
    id: string;
    internalName: string;
    publicName: string;
    coverPhotoUrl?: string;
    city?: string;
    basePrice: number;
    currency: string;
    days: Array<{ date: string; status: string; nightlyRate: number }>;
    reservations: Array<{
      id: string;
      guestName: string;
      source: string;
      status?: string;
      checkIn: string;
      checkOut: string;
    }>;
  }>;
}

export interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  description?: string;
  property?: { publicName: string; city?: string };
  deadline?: string;
}

export interface Conversation {
  id: string;
  channel: string;
  subject?: string;
  status: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  reservationId?: string;
  guest?: { id?: string; fullName: string; email?: string; phone?: string };
  property?: { id?: string; publicName: string };
  messages?: Array<{
    id: string;
    direction: string;
    senderType: string;
    senderName?: string;
    content: string;
    sentAt: string;
  }>;
}

export interface QipaChatResponse {
  role: "assistant";
  content: string;
}
