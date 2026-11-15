import { authenticate, defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { z } from "zod";
import { enforceRole } from "../lib/enforce-role";
import { ASSIGNABLE_ROLES } from "../lib/rbac";
import { STYLE_REQUEST_STATUSES } from "../modules/style-request/models/style-request";
import { REVIEW_STATUSES } from "../modules/review/models/review";

export const CreateStyleRequestBody = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(5).max(160),
  description: z.string().trim().min(10).max(4000),
  colour: z.string().trim().max(60).optional(),
  budget: z.string().trim().max(80).optional(),
  measurements: z.string().trim().max(500).optional(),
  /** URLs of photos already uploaded through the file module */
  images: z.array(z.string().url()).max(6).optional(),
});

export const MessageBody = z.object({ text: z.string().trim().min(1).max(4000) });

export const UpdateStyleRequestBody = z.object({
  status: z.enum(STYLE_REQUEST_STATUSES).optional(),
  quote_amount: z.number().nonnegative().nullable().optional(),
  admin_note: z.string().trim().max(4000).nullable().optional(),
});

export const CreateReviewBody = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(3).max(4000),
});

export const PushTokenBody = z.object({
  token: z.string().trim().regex(/^Expo(nent)?PushToken\[.+\]$/, "Not an Expo push token"),
  platform: z.enum(["android", "ios"]).default("android"),
});

export const NotificationPrefsBody = z.object({ order_email: z.boolean().optional(), news_email: z.boolean().optional() });

export const AlertPrefsBody = z.object({
  email: z.boolean(),
  push: z.boolean(),
  areas: z.array(z.string()).max(10),
});

export const AnnouncementBody = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(500),
  url: z.string().url().optional(),
});

export const SetRoleBody = z.object({ role: z.enum(ASSIGNABLE_ROLES) });

export const UpdateReviewBody = z.object({ status: z.enum(REVIEW_STATUSES) });

const customerAuth = authenticate("customer", ["session", "bearer"]);
const optionalCustomerAuth = authenticate("customer", ["session", "bearer"], { allowUnauthenticated: true });

// Staff sign-in is decided by Medusa; everything else under /admin is checked against the staff member's role.
const staffAuth = authenticate("user", ["session", "bearer"], { allowUnauthenticated: true });

export default defineMiddlewares({
  routes: [
    // roles and root-owner protection for the whole admin API (see src/lib/rbac.ts)
    { matcher: /^\/admin(\/.*)?$/, middlewares: [staffAuth, enforceRole] },
    { method: ["POST"], matcher: "/admin/staff/:id/role", middlewares: [validateAndTransformBody(SetRoleBody)] },
    // notifications: phones, preferences, announcements
    { method: ["POST", "DELETE"], matcher: "/store/push-tokens", middlewares: [optionalCustomerAuth, validateAndTransformBody(PushTokenBody)] },
    { method: ["POST"], matcher: "/admin/push-tokens", middlewares: [validateAndTransformBody(PushTokenBody)] },
    { matcher: "/store/customers/me/notification-preferences", middlewares: [customerAuth] },
    { method: ["POST"], matcher: "/store/customers/me/notification-preferences", middlewares: [validateAndTransformBody(NotificationPrefsBody)] },
    { method: ["POST"], matcher: "/admin/notification-preferences", middlewares: [validateAndTransformBody(AlertPrefsBody)] },
    { method: ["POST"], matcher: "/admin/announcements", middlewares: [validateAndTransformBody(AnnouncementBody)] },
    // style requests: anyone can send one (signed-in customers get it attached to their account)
    { method: ["POST"], matcher: "/store/style-requests", middlewares: [optionalCustomerAuth, validateAndTransformBody(CreateStyleRequestBody)] },
    { method: ["GET"], matcher: "/store/style-requests", middlewares: [customerAuth] },
    { method: ["POST"], matcher: "/store/style-requests/:id/messages", middlewares: [customerAuth, validateAndTransformBody(MessageBody)] },
    { method: ["POST"], matcher: "/admin/style-requests/:id", middlewares: [validateAndTransformBody(UpdateStyleRequestBody)] },
    { method: ["POST"], matcher: "/admin/style-requests/:id/messages", middlewares: [validateAndTransformBody(MessageBody)] },
    // reviews: reading is public, writing needs an account
    { method: ["POST"], matcher: "/store/products/:id/reviews", middlewares: [customerAuth, validateAndTransformBody(CreateReviewBody)] },
    { method: ["POST"], matcher: "/admin/reviews/:id", middlewares: [validateAndTransformBody(UpdateReviewBody)] },
  ],
});
