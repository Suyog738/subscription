import { config } from "./config";
import { httpSubscriptionService } from "./http/httpSubscriptionService";
import { mockAuthService } from "./mock/mockAuthService";
import { mockSettingsService } from "./mock/mockSettingsService";
import { mockSubscriptionService } from "./mock/mockSubscriptionService";
import type { AuthService, SettingsService, SubscriptionService } from "./types";

export const authService: AuthService = mockAuthService;
export const settingsService: SettingsService = mockSettingsService;
export const subscriptionService: SubscriptionService = config.useMockApi
  ? mockSubscriptionService
  : httpSubscriptionService;

export { ServiceError } from "./types";
