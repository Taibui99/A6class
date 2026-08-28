export type UserRole = "TEACHER" | "STUDENT";

export type MemberRole =
  | "CLASS_MONITOR"
  | "ACADEMIC_VICE_MONITOR"
  | "ACTIVITY_VICE_MONITOR"
  | "LABOR_VICE_MONITOR"
  | "TEAM_LEADER"
  | "TEAM_VICE_LEADER"
  | "STUDENT";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVIEWING"
  | "COMPLETED"
  | "REJECTED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: string;
}

export interface ClassMembership {
  id: string;
  userId: string;
  classId: string;
  role: MemberRole;
  teamId?: string;
  user: User;
  team?: Team;
}

export interface Team {
  id: string;
  name: string;
  color?: string;
  totalScore: number;
  rank?: number;
  leaderId?: string;
  viceLeaderId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  points?: number;
  assigneeType: string;
  creator: User;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  amount: number;
  reason: string;
  category?: string;
  giver: User;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrls: string[];
  isPinned: boolean;
  author: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  content?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
