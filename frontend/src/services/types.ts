import type {
  AppNotification,
  BankConnection,
  BankInstitution,
  DemoUser,
  EmailMessage,
  StopRecord,
  Subscription,
  SubscriptionInput,
  Transaction,
  UserSettings,
} from "../types";

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
  setStop(userId: string, id: string, stop: StopRecord | null): Promise<Subscription>;
  reset(userId: string): Promise<Subscription[]>;
}

export interface SettingsService {
  get(user: DemoUser): Promise<UserSettings>;
  save(userId: string, settings: UserSettings): Promise<UserSettings>;
}

// Read-only bank access. In production this is an account-information provider
// (open banking, or the bank itself when Mohar runs inside its app). Mohar never moves money.
export interface BankService {
  listInstitutions(): Promise<BankInstitution[]>;
  getConnection(userId: string): Promise<BankConnection | null>;
  connect(user: DemoUser, bankId: string): Promise<BankConnection>;
  disconnect(userId: string): Promise<void>;
  sync(userId: string): Promise<BankConnection>;
  listTransactions(userId: string): Promise<Transaction[]>;
  listDismissed(userId: string): Promise<string[]>;
  dismiss(userId: string, merchantKey: string): Promise<string[]>;
  /** Brings the account up to `until` (the demo clock's today) and returns any new transactions. */
  advanceTo(userId: string, until: string, subscriptions: Subscription[]): Promise<Transaction[]>;
}

// Inbox and outbox. In production the backend creates these from a scheduler and
// sends email through a provider; the browser only reads them.
export interface NotificationService {
  listNotifications(userId: string): Promise<AppNotification[]>;
  listEmails(userId: string): Promise<EmailMessage[]>;
  deliveredKeys(userId: string): Promise<string[]>;
  record(userId: string, notifications: AppNotification[], emails: EmailMessage[]): Promise<void>;
  markNotificationsRead(userId: string, ids: string[] | "all"): Promise<void>;
  markEmailRead(userId: string, id: string): Promise<void>;
  clear(userId: string): Promise<void>;
}

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}
