import { buildSeedSubscriptions } from "../../data/seedSubscriptions";
import type { Subscription } from "../../types";
import { delay, readJSON, writeJSON } from "../storage";
import { ServiceError, type SubscriptionService } from "../types";

// Each demo user gets their own storage key, so edits never leak between accounts.
// This mirrors what the backend will do with a user_id foreign key, but filtering
// in the browser is not security: the server must enforce ownership.

const keyFor = (userId: string) => `subscriptions:${userId}`;

// Older saved data may predate the status and channel fields.
function normalize(sub: Subscription): Subscription {
  return { ...sub, status: sub.status ?? "active", channel: sub.channel ?? "card", source: sub.source ?? "manual" };
}

function load(userId: string): Subscription[] {
  const stored = readJSON<Subscription[]>(keyFor(userId));
  if (stored) return stored.map(normalize);
  const seeded = buildSeedSubscriptions(userId);
  writeJSON(keyFor(userId), seeded);
  return seeded;
}

function save(userId: string, items: Subscription[]) {
  writeJSON(keyFor(userId), items);
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sub_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const mockSubscriptionService: SubscriptionService = {
  async list(userId) {
    await delay(200);
    return load(userId).filter((sub) => sub.userId === userId);
  },

  async create(userId, input) {
    await delay();
    const created: Subscription = { ...input, id: newId(), userId, createdAt: new Date().toISOString() };
    save(userId, [...load(userId), created]);
    return created;
  },

  async update(userId, id, input) {
    await delay();
    const items = load(userId);
    const existing = items.find((sub) => sub.id === id && sub.userId === userId);
    if (!existing) throw new ServiceError("That subscription no longer exists.");
    const updated: Subscription = { ...existing, ...input, notes: input.notes };
    save(userId, items.map((sub) => (sub.id === id ? updated : sub)));
    return updated;
  },

  async remove(userId, id) {
    await delay();
    const items = load(userId);
    if (!items.some((sub) => sub.id === id && sub.userId === userId)) {
      throw new ServiceError("That subscription no longer exists.");
    }
    save(userId, items.filter((sub) => sub.id !== id));
  },

  async setStop(userId, id, stop) {
    await delay();
    const items = load(userId);
    const existing = items.find((sub) => sub.id === id && sub.userId === userId);
    if (!existing) throw new ServiceError("That subscription no longer exists.");
    const updated: Subscription = stop
      ? { ...existing, status: "stopped", stop }
      : { ...existing, status: "active", stop: undefined };
    save(userId, items.map((sub) => (sub.id === id ? updated : sub)));
    return updated;
  },

  async reset(userId) {
    await delay();
    const seeded = buildSeedSubscriptions(userId);
    save(userId, seeded);
    return seeded;
  },
};
