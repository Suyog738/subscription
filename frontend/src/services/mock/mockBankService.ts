import { ACCOUNT, buildTransactions, INCOME, MERCHANTS, STARTING_BALANCE } from "../../data/bankSeeds";
import { PARTNER_BANKS } from "../../data/partnerBanks";
import type { BankConnection, Subscription, Transaction } from "../../types";
import { convert } from "../../utils/currency";
import { addMonthsClamped, parseISODate, toISODate } from "../../utils/date";
import { delay, readJSON, removeKey, writeJSON } from "../storage";
import { ServiceError, type BankService } from "../types";

const connectionKey = (userId: string) => `bank:connection:${userId}`;
const transactionsKey = (userId: string) => `bank:transactions:${userId}`;
const dismissedKey = (userId: string) => `bank:dismissed:${userId}`;

function maskFor(userId: string) {
  const digits = [...userId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return `•••• ${String(1000 + ((digits * 37) % 9000))}`;
}

function stoppedBefore(sub: Subscription | undefined, date: string) {
  return Boolean(sub && sub.status === "stopped" && sub.stop && date > sub.stop.stoppedAt);
}

// Posts what would have happened on the account up to `until`: subscription
// charges (stopped ones stay silent unless the provider ignores the cancellation),
// first charges after tracked free trials, and salary.
function simulateUntil(userId: string, until: string, subs: Subscription[], transactions: Transaction[]) {
  const added: Transaction[] = [];
  let counter = 0;
  const id = () => `${userId}_txn_ff_${until}_${++counter}`;
  const lastDate = (key: string, kind: Transaction["kind"]) =>
    transactions.filter((t) => t.merchantKey === key && t.kind === kind).reduce((max, t) => (t.date > max ? t.date : max), "");

  for (const seed of MERCHANTS[userId] ?? []) {
    const sub = subs.find((s) => s.merchantKey === seed.key);
    if (seed.amounts) {
      const last = lastDate(seed.key, "charge");
      if (!last) continue;
      const amount = seed.amounts[seed.amounts.length - 1];
      for (let k = 1; ; k += 1) {
        const date = toISODate(addMonthsClamped(parseISODate(last), k));
        if (date > until) break;
        if (stoppedBefore(sub, date) && !seed.keepsChargingAfterStop) continue;
        added.push({ id: id(), date, descriptor: seed.descriptor, merchant: seed.merchant, merchantKey: seed.key, amount, currency: seed.currency, channel: seed.channel, kind: "charge" });
      }
    } else if (sub && sub.renewalDate <= until) {
      // A free trial the user tracked: once it ends, the first paid charge arrives
      // unless they stopped it in time.
      const already = lastDate(seed.key, "charge");
      const step = sub.billingCycle === "monthly" ? 1 : 12;
      for (let k = 0; ; k += 1) {
        const date = toISODate(addMonthsClamped(parseISODate(sub.renewalDate), step * k));
        if (date > until) break;
        if (date <= already || stoppedBefore(sub, date)) continue;
        added.push({ id: id(), date, descriptor: seed.descriptor, merchant: seed.merchant, merchantKey: seed.key, amount: sub.price, currency: sub.currency, channel: seed.channel, kind: "charge" });
      }
    }
  }

  const income = INCOME[userId];
  const lastIncome = lastDate("income", "income");
  if (income && lastIncome) {
    for (let k = 1; ; k += 1) {
      const date = toISODate(addMonthsClamped(parseISODate(lastIncome), k));
      if (date > until) break;
      added.push({ id: id(), date, descriptor: income.merchant.toUpperCase(), merchant: income.merchant, merchantKey: "income", amount: income.amount, currency: ACCOUNT[userId]?.currency ?? "USD", channel: "bank-transfer", kind: "income" });
    }
  }
  return added;
}

export const mockBankService: BankService = {
  async listInstitutions() {
    return PARTNER_BANKS;
  },

  async getConnection(userId) {
    return readJSON<BankConnection>(connectionKey(userId));
  },

  async connect(user, bankId) {
    await delay(600);
    const bank = PARTNER_BANKS.find((b) => b.id === bankId);
    if (!bank) throw new ServiceError("Mohar can't connect to that bank yet.");
    const now = new Date().toISOString();
    const connection: BankConnection = {
      bankId: bank.id,
      bankName: bank.name,
      accountName: "Everyday account",
      accountMask: maskFor(user.id),
      balance: STARTING_BALANCE[user.id] ?? 1000,
      currency: ACCOUNT[user.id]?.currency ?? "USD",
      connectedAt: now,
      lastSyncedAt: now,
    };
    writeJSON(connectionKey(user.id), connection);
    writeJSON(transactionsKey(user.id), buildTransactions(user.id));
    return connection;
  },

  async disconnect(userId) {
    await delay(250);
    removeKey(connectionKey(userId));
    removeKey(transactionsKey(userId));
  },

  async sync(userId) {
    await delay(700);
    const connection = readJSON<BankConnection>(connectionKey(userId));
    if (!connection) throw new ServiceError("No bank is connected.");
    const updated = { ...connection, lastSyncedAt: new Date().toISOString() };
    writeJSON(connectionKey(userId), updated);
    return updated;
  },

  async listTransactions(userId) {
    return readJSON<Transaction[]>(transactionsKey(userId)) ?? [];
  },

  async listDismissed(userId) {
    return readJSON<string[]>(dismissedKey(userId)) ?? [];
  },

  async dismiss(userId, merchantKey) {
    const next = [...new Set([...(readJSON<string[]>(dismissedKey(userId)) ?? []), merchantKey])];
    writeJSON(dismissedKey(userId), next);
    return next;
  },

  async advanceTo(userId, until, subs) {
    const connection = readJSON<BankConnection>(connectionKey(userId));
    if (!connection) return [];
    const transactions = readJSON<Transaction[]>(transactionsKey(userId)) ?? [];
    const added = simulateUntil(userId, until, subs, transactions);
    if (added.length === 0) return [];
    const net = added.reduce((sum, t) => {
      const amount = convert(t.amount, t.currency, connection.currency);
      return t.kind === "income" ? sum + amount : sum - amount;
    }, 0);
    writeJSON(transactionsKey(userId), [...added, ...transactions].sort((a, b) => b.date.localeCompare(a.date)));
    writeJSON(connectionKey(userId), { ...connection, balance: Math.round((connection.balance + net) * 100) / 100 });
    return added;
  },
};
