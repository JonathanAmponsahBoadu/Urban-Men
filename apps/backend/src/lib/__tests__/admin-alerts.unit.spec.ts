import { allowedAreas, normalizePrefs, readPrefs, recipientsFor } from "../admin-alerts";

const owner = { id: "u_owner", email: "kkwesi956@gmail.com" };
const admin = { id: "u_admin", email: "mandyemefa@gmail.com" };
const stockman = { id: "u_stock", email: "stock@example.com", metadata: { role: "inventory" } };
const support = { id: "u_support", email: "help@example.com", metadata: { role: "support" } };

const opted = (user: { id: string; email?: string; metadata?: Record<string, unknown> }, alerts: Record<string, unknown>) => ({
  ...user,
  metadata: { ...(user.metadata ?? {}), alerts },
});

describe("admin alerts: opt-in only", () => {
  it("sends nothing to staff who never made a choice", () => {
    expect(recipientsFor([owner, admin, stockman], "orders")).toEqual({ emails: [], pushUserIds: [] });
    expect(readPrefs(admin)).toBeUndefined();
  });

  it("honours the channels each person chose", () => {
    const users = [
      opted(owner, { email: true, push: false, areas: ["orders"] }),
      opted(admin, { email: false, push: true, areas: ["orders"] }),
      opted({ id: "u_x", email: "x@example.com", metadata: { role: "manager" } }, { email: true, push: true, areas: ["orders"] }),
    ];
    expect(recipientsFor(users, "orders")).toEqual({ emails: ["kkwesi956@gmail.com", "x@example.com"], pushUserIds: ["u_admin", "u_x"] });
  });

  it("only sends the areas a person ticked", () => {
    const users = [opted(admin, { email: true, push: true, areas: ["reviews"] })];
    expect(recipientsFor(users, "orders")).toEqual({ emails: [], pushUserIds: [] });
    expect(recipientsFor(users, "reviews").emails).toEqual(["mandyemefa@gmail.com"]);
  });

  it("keeps an inventory manager to stock alerts, even if they tick more", () => {
    expect(allowedAreas(stockman)).toEqual(["inventory"]);
    const prefs = normalizePrefs(stockman, { email: true, push: false, areas: ["orders", "inventory", "bogus"] });
    expect(prefs.areas).toEqual(["inventory"]);
    // and a role change after opting in cuts the alerts off
    const stale = opted(support, { email: true, push: false, areas: ["inventory", "orders"] });
    expect(recipientsFor([stale], "inventory")).toEqual({ emails: [], pushUserIds: [] });
    expect(recipientsFor([stale], "orders").emails).toEqual(["help@example.com"]);
  });

  it("treats only literal true as consent and records when it was given", () => {
    const now = new Date("2026-10-13T10:00:00Z");
    const prefs = normalizePrefs(owner, { email: "yes", push: 1, areas: ["orders"] }, now);
    expect(prefs).toEqual({ email: false, push: false, areas: ["orders"], consented_at: now.toISOString() });
  });
});
