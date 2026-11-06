import { useCallback, useState } from "react";
import { readJSON, writeJSON } from "../services/storage";
import type { UpcomingRenewal } from "../types";

const keyFor = (userId: string) => `seen-reminders:${userId}`;
const reminderKey = (item: UpcomingRenewal) => `${item.subscription.id}:${item.nextDate}`;

export function useSeenReminders(userId: string) {
  const [seen, setSeen] = useState<string[]>(() => readJSON<string[]>(keyFor(userId)) ?? []);

  const isSeen = useCallback((item: UpcomingRenewal) => seen.includes(reminderKey(item)), [seen]);

  const markSeen = useCallback(
    (items: UpcomingRenewal[]) => {
      const next = [...new Set([...seen, ...items.map(reminderKey)])].slice(-200);
      setSeen(next);
      writeJSON(keyFor(userId), next);
    },
    [seen, userId],
  );

  return { isSeen, markSeen };
}
