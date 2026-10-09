import type { Metadata } from "next";
import { ForgotPassword } from "@/components/ForgotPassword";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPassword />;
}
