import type { UserSettings } from "../../types";
import { readJSON, writeJSON } from "../storage";
import type { SettingsService } from "../types";

const keyFor = (userId: string) => `settings:${userId}`;

export const DEFAULT_REMINDER_DAYS = 7;

export const mockSettingsService: SettingsService = {
  async get(user) {
    return (
      readJSON<UserSettings>(keyFor(user.id)) ?? {
        displayCurrency: user.defaultCurrency,
        reminderDays: DEFAULT_REMINDER_DAYS,
      }
    );
  },

  async save(userId, settings) {
    writeJSON(keyFor(userId), settings);
    return settings;
  },
};
