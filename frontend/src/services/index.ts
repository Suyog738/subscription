import { config } from "./config";
import { httpSubscriptionService } from "./http/httpSubscriptionService";
import { mockAuthService } from "./mock/mockAuthService";
import { mockBankService } from "./mock/mockBankService";
import { mockNotificationService } from "./mock/mockNotificationService";
import { mockSettingsService } from "./mock/mockSettingsService";
import { mockSubscriptionService } from "./mock/mockSubscriptionService";
import type { AuthService, BankService, NotificationService, SettingsService, SubscriptionService } from "./types";

export const authService: AuthService = mockAuthService;
export const settingsService: SettingsService = mockSettingsService;
export const bankService: BankService = mockBankService;
export const notificationService: NotificationService = mockNotificationService;
export const subscriptionService: SubscriptionService = config.useMockApi
  ? mockSubscriptionService
  : httpSubscriptionService;

export { ServiceError } from "./types";
