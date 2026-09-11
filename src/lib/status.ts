import type { BadgeTone } from "@/components/ui/Badge";

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTE_SENT: "Quote Sent",
  FOLLOW_UP: "Follow-Up",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  LOST: "Lost",
};

export const LEAD_STATUS_TONES: Record<string, BadgeTone> = {
  NEW: "info",
  CONTACTED: "info",
  QUOTE_SENT: "warning",
  FOLLOW_UP: "warning",
  CONFIRMED: "success",
  COMPLETED: "success",
  LOST: "danger",
};

export const QUOTE_STATUS_TONES: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  SENT: "info",
  VIEWED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  EXPIRED: "danger",
};
