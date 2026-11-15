import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BellAlert } from "@medusajs/icons";
import { Button, Container, Heading, Switch, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type Area = "orders" | "requests" | "reviews" | "inventory";
type Response = {
  email: string;
  preferences: { email: boolean; push: boolean; areas: Area[]; consented_at?: string } | null;
  available_areas: Area[];
  phones: number;
};

const LABELS: Record<Area, { title: string; hint: string }> = {
  orders: { title: "New orders and pre-orders", hint: "Every time a customer orders pieces." },
  requests: { title: "Custom style requests", hint: "When someone asks for a custom design." },
  reviews: { title: "Reviews to approve", hint: "New reviews waiting for your approval." },
  inventory: { title: "Low stock", hint: "A morning list of sizes that are low or sold out." },
};

const call = async (method: "GET" | "POST", body?: unknown): Promise<Response> => {
  const res = await fetch("/admin/notification-preferences", {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message ?? "Something went wrong");
  return res.json();
};

const MyNotificationsPage = () => {
  const [data, setData] = useState<Response>();
  const [email, setEmail] = useState(false);
  const [push, setPush] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [saving, setSaving] = useState(false);

  const load = (d: Response) => {
    setData(d);
    setEmail(d.preferences?.email ?? false);
    setPush(d.preferences?.push ?? false);
    setAreas(d.preferences?.areas ?? []);
  };
  useEffect(() => {
    call("GET").then(load).catch((e) => toast.error(e.message));
  }, []);

  const toggleArea = (a: Area) => setAreas((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  const save = async () => {
    setSaving(true);
    try {
      load(await call("POST", { email, push, areas }));
      toast.success("Your notification choices are saved.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <Container className="p-6"><Text>Loading…</Text></Container>;

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div>
        <Heading>My notifications</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          You decide how the shop tells you about things. Nothing is sent to you until you switch it on here, and you can change this any time.
        </Text>
      </div>

      <div className="flex flex-col gap-y-3">
        <Heading level="h2">How should we reach you?</Heading>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Text weight="plus">Email</Text>
            <Text size="small" className="text-ui-fg-subtle">Sent to {data.email}.</Text>
          </div>
          <Switch checked={email} onCheckedChange={setEmail} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Text weight="plus">Phone notification</Text>
            <Text size="small" className="text-ui-fg-subtle">
              {data.phones > 0 ? `${data.phones} phone${data.phones === 1 ? "" : "s"} registered.` : "No phone registered yet. Sign in on the Urban Men app and allow notifications to add yours."}
            </Text>
          </div>
          <Switch checked={push} onCheckedChange={setPush} />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <Heading level="h2">What do you want to hear about?</Heading>
        {data.available_areas.map((a) => (
          <div key={a} className="flex items-center justify-between gap-4">
            <div>
              <Text weight="plus">{LABELS[a].title}</Text>
              <Text size="small" className="text-ui-fg-subtle">{LABELS[a].hint}</Text>
            </div>
            <Switch checked={areas.includes(a)} onCheckedChange={() => toggleArea(a)} />
          </div>
        ))}
      </div>

      {(email || push) && areas.length === 0 && (
        <Text size="small" className="text-ui-fg-error">Pick at least one thing to hear about, or switch both channels off.</Text>
      )}
      {!data.preferences && <Text size="small" className="text-ui-fg-subtle">You have not made a choice yet, so you are not receiving any alerts.</Text>}

      <div>
        <Button onClick={save} isLoading={saving}>Save my choices</Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({ label: "My notifications", icon: BellAlert });
export default MyNotificationsPage;
