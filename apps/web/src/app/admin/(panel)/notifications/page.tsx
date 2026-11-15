import type { Metadata } from "next";
import { NotificationsAdmin } from "@/components/admin/NotificationsAdmin";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return <NotificationsAdmin />;
}
