
export type UserRole = "admin" | "director" | "owner" | "viewer";

export interface Profile {
  user_id: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  avatar_url?: string;
}

export interface GovernanceArea {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
  created_at: string;
}

export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export type CycleStatus = "pending" | "in_progress" | "in_review" | "done" | "late" | "cancelled";

export interface ApprovalStep {
  user_id: string;
  user_name: string;
  status: "pending" | "approved" | "rejected";
  order: number;
  completed_at?: string;
}

export interface GovernanceRoutine {
  id: string;
  area_id: string;
  title: string;
  description?: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly" | "event";
  day_of_month?: number;
  priority: "low" | "medium" | "high" | "critical";
  is_active: boolean;
  created_at: string;
  owners?: Profile[];
  scope?: BusinessUnit[];
  approval_chain?: string[]; // IDs of profiles in order
  risk_score?: number; // 0 to 100
}

export interface GovernanceCycle {
  id: string;
  routine_id: string;
  due_date: string;
  status: CycleStatus;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  created_at: string;
  approval_steps?: ApprovalStep[];
  // Joins
  routine?: GovernanceRoutine;
  area?: GovernanceArea;
}

export interface GovernanceEvidence {
  id: string;
  cycle_id: string;
  type: "file" | "link" | "note";
  title?: string;
  url?: string;
  note?: string;
  created_by: string;
  created_at: string;
}

export interface GovernanceComment {
  id: string;
  cycle_id: string;
  author_id: string;
  author_name?: string;
  message: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "danger";
  read: boolean;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  cycle_id: string;
  user_id: string;
  user_name: string;
  action: string;
  details?: string;
  created_at: string;
}
