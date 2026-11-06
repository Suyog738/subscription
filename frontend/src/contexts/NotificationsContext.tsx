import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { notificationService } from "../services";
import type { AppNotification, DemoUser, EmailMessage, NotificationChannel } from "../types";
import { dueReminders, type ReminderCandidate } from "../utils/reminders";
import { useBank } from "./BankContext";
import { useSubscriptions } from "./SubscriptionsContext";
import { useToast } from "./ToastContext";

type Permission = NotificationPermission | "unsupported";

interface NotificationsContextValue {
  notifications: AppNotification[];
  emails: EmailMessage[];
  unread: number;
  unreadEmails: number;
  browserPermission: Permission;
  requestBrowserPermission: () => Promise<Permission>;
  markRead: (ids: string[] | "all") => Promise<void>;
  markEmailRead: (id: string) => Promise<void>;
  sendTest: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const SENDER = "Mohar <reminders@mohar.app>";
const CHECK_EVERY_MS = 60_000;

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function currentPermission(): Permission {
  return typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "unsupported";
}

export function NotificationsProvider({ user, children }: { user: DemoUser; children: ReactNode }) {
  const { subscriptions, settings, loading: subsLoading } = useSubscriptions();
  const { connection, tracked, trials, loading: bankLoading } = useBank();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [browserPermission, setBrowserPermission] = useState<Permission>(currentPermission);
  const delivered = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      notificationService.listNotifications(user.id),
      notificationService.listEmails(user.id),
      notificationService.deliveredKeys(user.id),
    ]).then(([inbox, outbox, keys]) => {
      if (cancelled) return;
      setNotifications(inbox);
      setEmails(outbox);
      delivered.current = new Set(keys);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Re-check every minute and whenever the tab comes back, so reminders appear
  // without a reload (and a new day's reminders show up after midnight).
  useEffect(() => {
    const interval = window.setInterval(() => setTick((t) => t + 1), CHECK_EVERY_MS);
    const onVisible = () => document.visibilityState === "visible" && setTick((t) => t + 1);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const deliver = useCallback(
    async (candidates: (ReminderCandidate | (ReminderCandidate & { event: "test" }))[], announce = true) => {
      if (candidates.length === 0) return;
      const prefs = settings.notifications;
      const permission = currentPermission();
      const channels: NotificationChannel[] = ["in-app"];
      if (prefs.browser && permission === "granted") channels.push("browser");
      if (prefs.email) channels.push("email");

      const now = new Date().toISOString();
      const created: AppNotification[] = candidates.map((c) => ({
        id: newId("ntf"),
        key: c.key,
        event: c.event,
        title: c.title,
        body: c.body,
        link: c.link,
        createdAt: now,
        read: false,
        channels,
      }));
      const mails: EmailMessage[] = prefs.email
        ? candidates.map((c, index) => ({
            id: newId("eml"),
            notificationId: created[index].id,
            from: SENDER,
            to: user.email,
            subject: c.email.subject,
            preview: c.email.paragraphs[0] ?? c.body,
            heading: c.email.heading,
            paragraphs: c.email.paragraphs,
            details: c.email.details,
            cta: { label: c.email.cta, link: c.link },
            sentAt: now,
            read: false,
          }))
        : [];

      candidates.forEach((c) => delivered.current.add(c.key));
      await notificationService.record(user.id, created, mails);
      setNotifications((current) => [...created, ...current]);
      if (mails.length) setEmails((current) => [...mails, ...current]);

      if (channels.includes("browser")) {
        const show = (title: string, body: string, link: string, tag: string) => {
          try {
            const n = new window.Notification(title, { body, tag, icon: "/favicon.svg" });
            n.onclick = () => {
              window.focus();
              navigate(link);
              n.close();
            };
          } catch {
            // Some browsers only allow notifications from a service worker.
          }
        };
        if (created.length <= 3) created.forEach((n) => show(n.title, n.body, n.link, n.key));
        else show(`${created.length} new reminders from Mohar`, created.slice(0, 3).map((n) => n.title).join(" · "), "/app", "summary");
      }

      if (announce) {
        const emailNote = "";
        notify(
          created.length === 1
            ? { tone: "info", title: created[0].title, description: created[0].body + emailNote }
            : {
                tone: "info",
                title: `${created.length} new reminders`,
                description: `${created.slice(0, 2).map((n) => n.title).join(" · ")}${created.length > 2 ? " and more" : ""}.${emailNote}`,
              },
        );
        if (channels.includes("browser")) {
          notify({
            title: "Browser notification delivered",
            description: `${created.length <= 3 ? created.length : 1} system ${created.length === 1 || created.length > 3 ? "pop-up" : "pop-ups"} shown on this device.`,
          });
        }
        if (mails.length) {
          notify({
            title: mails.length === 1 ? `Email sent to ${user.email}` : `${mails.length} emails sent to ${user.email}`,
            description: `${mails[0].subject}${mails.length > 1 ? " and more" : ""}. Simulated: open Email outbox to read ${mails.length === 1 ? "it" : "them"}.`,
          });
        }
      }
    },
    [settings.notifications, user.id, user.email, navigate, notify],
  );

  useEffect(() => {
    if (!ready || subsLoading || bankLoading) return;
    const due = dueReminders({ subscriptions, settings, connection, tracked, detectedTrials: trials }).filter(
      (c) => !delivered.current.has(c.key),
    );
    void deliver(due);
  }, [ready, subsLoading, bankLoading, subscriptions, settings, connection, tracked, trials, tick, deliver]);

  const requestBrowserPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const result = await window.Notification.requestPermission();
    setBrowserPermission(result);
    return result;
  }, []);

  const markRead = useCallback(
    async (ids: string[] | "all") => {
      await notificationService.markNotificationsRead(user.id, ids);
      setNotifications((current) => current.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, read: true } : n)));
    },
    [user.id],
  );

  const markEmailRead = useCallback(
    async (id: string) => {
      await notificationService.markEmailRead(user.id, id);
      setEmails((current) => current.map((e) => (e.id === id ? { ...e, read: true } : e)));
    },
    [user.id],
  );

  const sendTest = useCallback(async () => {
    await deliver([
      {
        key: `test:${Date.now()}`,
        event: "test",
        title: "Test reminder from Mohar",
        body: "This is how your reminders will look.",
        link: "/app/settings",
        email: {
          subject: "Test reminder from Mohar",
          heading: "Your reminders are working",
          paragraphs: [
            `Hi ${user.name.split(" ")[0]}, this is a test. Real reminders arrive before renewals, before free trials turn paid, when a price goes up, and when a stopped subscription is confirmed.`,
          ],
          cta: "Notification settings",
        },
      } as ReminderCandidate & { event: "test" },
    ]);
  }, [deliver, user.name]);

  const clearAll = useCallback(async () => {
    await notificationService.clear(user.id);
    delivered.current = new Set();
    setNotifications([]);
    setEmails([]);
    setTick((t) => t + 1);
  }, [user.id]);

  const value = useMemo(
    () => ({
      notifications,
      emails,
      unread: notifications.filter((n) => !n.read).length,
      unreadEmails: emails.filter((e) => !e.read).length,
      browserPermission,
      requestBrowserPermission,
      markRead,
      markEmailRead,
      sendTest,
      clearAll,
    }),
    [notifications, emails, browserPermission, requestBrowserPermission, markRead, markEmailRead, sendTest, clearAll],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationsProvider");
  return context;
}
