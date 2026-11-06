import type { AppNotification, EmailMessage } from "../../types";
import { readJSON, removeKey, writeJSON } from "../storage";
import type { NotificationService } from "../types";

const inboxKey = (userId: string) => `notifications:${userId}`;
const outboxKey = (userId: string) => `emails:${userId}`;
const deliveredKey = (userId: string) => `notifications:delivered:${userId}`;
const LIMIT = 100;

export const mockNotificationService: NotificationService = {
  async listNotifications(userId) {
    return readJSON<AppNotification[]>(inboxKey(userId)) ?? [];
  },

  async listEmails(userId) {
    return readJSON<EmailMessage[]>(outboxKey(userId)) ?? [];
  },

  async deliveredKeys(userId) {
    return readJSON<string[]>(deliveredKey(userId)) ?? [];
  },

  async record(userId, notifications, emails) {
    const inbox = readJSON<AppNotification[]>(inboxKey(userId)) ?? [];
    const outbox = readJSON<EmailMessage[]>(outboxKey(userId)) ?? [];
    const delivered = readJSON<string[]>(deliveredKey(userId)) ?? [];
    writeJSON(inboxKey(userId), [...notifications, ...inbox].slice(0, LIMIT));
    writeJSON(outboxKey(userId), [...emails, ...outbox].slice(0, LIMIT));
    writeJSON(deliveredKey(userId), [...new Set([...delivered, ...notifications.map((n) => n.key)])].slice(-500));
  },

  async markNotificationsRead(userId, ids) {
    const inbox = readJSON<AppNotification[]>(inboxKey(userId)) ?? [];
    writeJSON(
      inboxKey(userId),
      inbox.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, read: true } : n)),
    );
  },

  async markEmailRead(userId, id) {
    const outbox = readJSON<EmailMessage[]>(outboxKey(userId)) ?? [];
    writeJSON(outboxKey(userId), outbox.map((e) => (e.id === id ? { ...e, read: true } : e)));
  },

  async clear(userId) {
    removeKey(inboxKey(userId));
    removeKey(outboxKey(userId));
    removeKey(deliveredKey(userId));
  },
};
