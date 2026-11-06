import type { Subscription } from "../../types";
import type { SubscriptionService } from "../types";
import { apiRequest } from "./apiClient";

// Matches the planned FastAPI routes. The server identifies the user from the
// session, so userId is only kept to share the interface with the mock service.

export const httpSubscriptionService: SubscriptionService = {
  list: () => apiRequest<Subscription[]>("/subscriptions"),
  create: (_userId, input) => apiRequest<Subscription>("/subscriptions", { method: "POST", body: JSON.stringify(input) }),
  update: (_userId, id, input) =>
    apiRequest<Subscription>(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (_userId, id) => apiRequest<void>(`/subscriptions/${id}`, { method: "DELETE" }),
  reset: () => apiRequest<Subscription[]>("/subscriptions"),
};
