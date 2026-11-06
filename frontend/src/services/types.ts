import type { DemoUser, Subscription, SubscriptionInput, UserSettings } from "../types";

// Contracts the UI depends on. The mock implementations satisfy them today;
// FastAPI-backed implementations can replace them without touching components.

export interface AuthService {
  getSession(): DemoUser | null;
  signIn(email: string, password: string): Promise<DemoUser>;
  signOut(): Promise<void>;
}

export interface SubscriptionService {
  list(userId: string): Promise<Subscription[]>;
  create(userId: string, input: SubscriptionInput): Promise<Subscription>;
  update(userId: string, id: string, input: SubscriptionInput): Promise<Subscription>;
  remove(userId: string, id: string): Promise<void>;
  reset(userId: string): Promise<Subscription[]>;
}

export interface SettingsService {
  get(user: DemoUser): Promise<UserSettings>;
  save(userId: string, settings: UserSettings): Promise<UserSettings>;
}

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}
