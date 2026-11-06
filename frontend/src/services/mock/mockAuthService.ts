import { DEMO_PASSWORD, DEMO_USERS } from "../../data/demoUsers";
import type { DemoUser } from "../../types";
import { delay, readJSON, removeKey, writeJSON } from "../storage";
import { ServiceError, type AuthService } from "../types";

// Prototype only: credentials are checked in the browser against fixed demo
// accounts. Real authentication must happen on the server.

const SESSION_KEY = "session";

interface StoredSession {
  userId: string;
}

export const mockAuthService: AuthService = {
  getSession() {
    const session = readJSON<StoredSession>(SESSION_KEY);
    return DEMO_USERS.find((user) => user.id === session?.userId) ?? null;
  },

  async signIn(email, password) {
    await delay(450);
    const user: DemoUser | undefined = DEMO_USERS.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!user) throw new ServiceError("There's no demo account with that email.");
    if (password !== DEMO_PASSWORD) throw new ServiceError("That password doesn't match. Demo accounts use mohar-demo.");
    writeJSON(SESSION_KEY, { userId: user.id } satisfies StoredSession);
    return user;
  },

  async signOut() {
    removeKey(SESSION_KEY);
  },
};
