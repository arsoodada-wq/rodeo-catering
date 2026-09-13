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

export const SOCIAL_STATUS_LABELS: Record<string, string> = {
  IDEA: "Idea",
  DRAFT: "Draft",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
};

export const SOCIAL_STATUS_TONES: Record<string, BadgeTone> = {
  IDEA: "neutral",
  DRAFT: "info",
  APPROVED: "warning",
  SCHEDULED: "warning",
  PUBLISHED: "success",
};

export const OUTREACH_STATUS_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  RESPONDED: "Responded",
  INTERESTED: "Interested",
  LINK_ACQUIRED: "Link Acquired",
  NOT_INTERESTED: "Not Interested",
  FOLLOW_UP: "Follow-Up",
};

export const OUTREACH_STATUS_TONES: Record<string, BadgeTone> = {
  PROSPECT: "neutral",
  CONTACTED: "info",
  RESPONDED: "warning",
  INTERESTED: "warning",
  LINK_ACQUIRED: "success",
  NOT_INTERESTED: "danger",
  FOLLOW_UP: "warning",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  CATERING_WIZARD: "Guided Wizard",
  AI_CONCIERGE: "AI Concierge",
  QUOTE_FORM: "Quote Form",
  PHONE: "Phone",
  EMAIL: "Email",
  WALK_IN: "Walk-In",
  REFERRAL: "Referral",
  SOCIAL_MEDIA: "Social Media",
  OTHER: "Other",
};
