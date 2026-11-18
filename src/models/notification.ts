export type SiteNotificationType =
  | "CONTEST_ANNOUNCEMENT"
  | "CONTEST_ANNOUNCEMENT_UPDATED"
  | "CLARIFICATION_ANSWERED"
  | "CLARIFICATION_ANSWER_UPDATED"
  | "CLARIFICATION_PUBLIC"
  | "CLARIFICATION_ASKED";

/** 一条还没弹过的通知 */
export interface SiteNotification {
  id: number;
  type: SiteNotificationType;
  contest_id: number | null;
  contest_title: string | null;
  ref_id: number | null;
  created_at: string;
}

/** items 是最早的若干条，total 是一共积压了多少条 */
export interface PendingNotifications {
  items: SiteNotification[];
  total: number;
}
