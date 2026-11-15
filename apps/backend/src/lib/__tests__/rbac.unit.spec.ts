import { areaForPath, canAccess, canModifyUser, roleOf, targetUserId } from "../rbac";

describe("roles", () => {
  it("the root owner is always owner, even if metadata says otherwise", () => {
    expect(roleOf({ email: "kkwesi956@gmail.com", metadata: { role: "support" } })).toBe("owner");
    expect(roleOf({ email: "KKwesi956@Gmail.com" })).toBe("owner");
  });

  it("the two named administrators are admins from their first sign-in", () => {
    expect(roleOf({ email: "mandyemefa@gmail.com" })).toBe("admin");
    expect(roleOf({ email: "nagbrand@gmail.com" })).toBe("admin");
  });

  it("an unknown account gets the least access and can never claim owner through metadata", () => {
    expect(roleOf({ email: "someone@example.com" })).toBe("support");
    expect(roleOf({ email: "someone@example.com", metadata: { role: "owner" } })).toBe("support");
    expect(roleOf({ email: "someone@example.com", metadata: { role: "inventory" } })).toBe("inventory");
  });
});

describe("what each role can reach", () => {
  it("admins and the owner reach everything, including staff and settings", () => {
    for (const role of ["owner", "admin"] as const) {
      expect(canAccess(role, "POST", "/admin/users/usr_1")).toBe(true);
      expect(canAccess(role, "POST", "/admin/store")).toBe(true);
      expect(canAccess(role, "GET", "/admin/orders")).toBe(true);
    }
  });

  it("inventory managers can work on stock only", () => {
    expect(canAccess("inventory", "POST", "/admin/inventory-items/iitem_1/location-levels")).toBe(true);
    expect(canAccess("inventory", "GET", "/admin/stock-locations")).toBe(true);
    expect(canAccess("inventory", "GET", "/admin/products")).toBe(true); // read-only, to see names and sizes
    expect(canAccess("inventory", "POST", "/admin/products/prod_1")).toBe(false);
    expect(canAccess("inventory", "GET", "/admin/orders")).toBe(false);
    expect(canAccess("inventory", "GET", "/admin/customers")).toBe(false);
    expect(canAccess("inventory", "GET", "/admin/users")).toBe(false);
    expect(canAccess("inventory", "POST", "/admin/store")).toBe(false);
  });

  it("managers cannot open settings or staff; support cannot change products", () => {
    expect(canAccess("manager", "POST", "/admin/products")).toBe(true);
    expect(canAccess("manager", "GET", "/admin/users")).toBe(false);
    expect(canAccess("manager", "POST", "/admin/regions")).toBe(false);
    expect(canAccess("support", "GET", "/admin/orders")).toBe(true);
    expect(canAccess("support", "POST", "/admin/products")).toBe(false);
  });

  it("everyone signed in can read their own profile", () => {
    expect(areaForPath("/admin/users/me")).toBe("any");
    expect(canAccess("inventory", "GET", "/admin/users/me")).toBe(true);
    expect(areaForPath("/admin/users/usr_9")).toBe("staff");
  });

  it("every staff member can READ the shared settings the admin screen needs, but only admins can change them", () => {
    for (const role of ["manager", "inventory", "support"] as const) {
      for (const path of ["/admin/stores", "/admin/layouts/sidebar/configuration", "/admin/regions?limit=1000", "/admin/sales-channels", "/admin/currencies"]) {
        expect(canAccess(role, "GET", path)).toBe(true);
        expect(canAccess(role, "POST", path)).toBe(false);
      }
      expect(canAccess(role, "GET", "/admin/api-keys")).toBe(false);
      expect(canAccess(role, "GET", "/admin/invites")).toBe(false);
    }
    expect(canAccess("admin", "POST", "/admin/stores/store_1")).toBe(true);
  });

  it("unknown admin paths are administrators only", () => {
    expect(canAccess("manager", "GET", "/admin/some-new-thing")).toBe(false);
    expect(canAccess("admin", "GET", "/admin/some-new-thing")).toBe(true);
  });
});

describe("protecting the root owner", () => {
  const root = { id: "usr_root", email: "kkwesi956@gmail.com" };
  const other = { id: "usr_2", email: "staff@example.com" };

  it("finds the user a path points at", () => {
    expect(targetUserId("/admin/users/usr_2")).toBe("usr_2");
    expect(targetUserId("/admin/users/me")).toBeUndefined();
    expect(targetUserId("/admin/orders")).toBeUndefined();
  });

  it("only the root owner can modify the root owner", () => {
    expect(canModifyUser({ id: "usr_root", role: "owner" }, root)).toBe(true);
    expect(canModifyUser({ id: "usr_a", role: "admin" }, root)).toBe(false);
    expect(canModifyUser({ id: "usr_m", role: "manager" }, root)).toBe(false);
  });

  it("administrators can modify or remove anyone else; managers cannot", () => {
    expect(canModifyUser({ id: "usr_a", role: "admin" }, other)).toBe(true);
    expect(canModifyUser({ id: "usr_root", role: "owner" }, other)).toBe(true);
    expect(canModifyUser({ id: "usr_m", role: "manager" }, other)).toBe(false);
  });
});
