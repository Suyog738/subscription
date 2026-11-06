import type { DemoUser, UserSettings } from "../../types";
import { readJSON, writeJSON } from "../storage";
import type { SettingsService } from "../types";

const keyFor = (userId: string) => `settings:${userId}`;

export function defaultSettings(user: DemoUser): UserSettings {
  return {
    displayCurrency: user.defaultCurrency,
    reminderDays: 7,
    trialReminderDays: 7,
    yearlyReminderDays: 14,
    notifications: {
      browser: false,
      email: true,
      events: { renewals: true, trials: true, priceRises: true, balance: true, stopChecks: true },
    },
  };
}

export const mockSettingsService: SettingsService = {
  async get(user) {
    const defaults = defaultSettings(user);
    const stored = readJSON<Partial<UserSettings>>(keyFor(user.id)) ?? {};
    return {
      ...defaults,
      ...stored,
      notifications: {
        ...defaults.notifications,
        ...stored.notifications,
        events: { ...defaults.notifications.events, ...stored.notifications?.events },
      },
    };
  },

  async save(userId, settings) {
    writeJSON(keyFor(userId), settings);
    return settings;
  },
};
