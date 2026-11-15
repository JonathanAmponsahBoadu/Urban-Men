# 04 Roles and access

| Role | Access |
|---|---|
| **owner** (root) | Everything. The account **kkwesi956@gmail.com**. Only this person can change the owner's email or credentials. Nobody else can edit, demote or remove it. |
| **admin** | Every area including settings and staff. Can add, change or remove any staff member **except the owner**. Named administrators: **mandyemefa@gmail.com** and **nagbrand@gmail.com**. |
| **manager** | Products, inventory, orders, style requests, inbox, reviews, customers, vouchers. No settings or staff. |
| **inventory** | Inventory (stock) only, plus read-only catalogue so names and sizes show. |
| **support** | Orders, style requests, inbox, reviews, customers. Cannot change products. |

Shoppers do not need an account. An account is optional and can use Google sign-in.

## How it is enforced

- Backend: [`src/lib/rbac.ts`](../apps/backend/src/lib/rbac.ts) (the rules), [`enforce-role.ts`](../apps/backend/src/lib/enforce-role.ts) (middleware on every `/admin/*` call),
  wired in [`src/api/middlewares.ts`](../apps/backend/src/api/middlewares.ts). Sixteen unit tests cover the role rules and the alert opt-in rules: `npm run test:unit`.
- Roles are stored in `user.metadata.role`. The owner's email is always **owner** (metadata cannot override it), the administrators' emails are **admin**
  from their first sign-in, and an unknown account gets **support**, the least access.
- Changes to `/admin/users/:id` are refused when the target is the owner unless the caller is the owner.
- The browser admin preview mirrors the same rules in [`apps/web/src/lib/permissions.ts`](../apps/web/src/lib/permissions.ts).

Medusa 2.20 also ships a beta RBAC module. We use this thin, tested layer because it states the owner rule explicitly; moving later is possible.

## Alerts are opt-in

Order, style-request, review and stock alerts reach a staff member only after they choose them in Medusa admin, **My notifications**:
email, phone notification, or both, per area. Every role can open that page; it shows only the areas the role covers
(an inventory manager sees stock only). Until someone chooses, they receive nothing. Phone notifications need the staff member's phone registered
(`POST /admin/push-tokens`; the staff sign-in in the app is still to be built).

## Setting up people

1. Owner: `npx medusa user -e kkwesi956@gmail.com -p <your-password>` (run it yourself).
2. Administrators: `npm run invite-admins` prints an invite link for each; they open it and choose their own password.
3. Other staff: an admin invites them from the Medusa admin, then sets the role with `POST /admin/staff/:id/role`.

Passwords are never stored in the code or committed. The preview admin's default password (`UrbanMen@2026`) is a stand-in:
set `NEXT_PUBLIC_ADMIN_PASSWORD` on Vercel, and note the preview admin disappears once the Medusa admin replaces it.
