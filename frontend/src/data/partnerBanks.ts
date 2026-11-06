import type { BankInstitution } from "../types";

// Banks Mohar can connect to through PSD2 open banking (account information access).
// Names are shown for the prototype's demonstration only: no partnership or
// affiliation is implied, no logos are used, and every connection is simulated.
// In production this list comes from the open-banking provider via GET /bank/institutions.
export const PARTNER_BANKS: BankInstitution[] = [
  { id: "nordea", name: "Nordea", country: "Finland · Sweden · Denmark · Norway", kind: "Bank", tone: 4 },
  { id: "op", name: "OP Financial Group", country: "Finland", kind: "Cooperative bank", tone: 3 },
  { id: "s-pankki", name: "S-Pankki", country: "Finland", kind: "Bank", tone: 1 },
  { id: "danske", name: "Danske Bank", country: "Denmark · Finland · Sweden · Norway", kind: "Bank", tone: 4 },
  { id: "handelsbanken", name: "Handelsbanken", country: "Sweden", kind: "Bank", tone: 2 },
  { id: "seb", name: "SEB", country: "Sweden", kind: "Bank", tone: 1 },
  { id: "swedbank", name: "Swedbank", country: "Sweden · Baltics", kind: "Savings bank", tone: 3 },
  { id: "dnb", name: "DNB", country: "Norway", kind: "Bank", tone: 1 },
  { id: "aktia", name: "Aktia", country: "Finland", kind: "Bank", tone: 5 },
  { id: "alandsbanken", name: "Ålandsbanken", country: "Finland", kind: "Bank", tone: 2 },
  { id: "revolut", name: "Revolut", country: "Europe", kind: "Digital bank", tone: 5 },
  { id: "n26", name: "N26", country: "Europe", kind: "Digital bank", tone: 2 },
  { id: "ing", name: "ING", country: "Netherlands · Europe", kind: "Bank", tone: 3 },
];
