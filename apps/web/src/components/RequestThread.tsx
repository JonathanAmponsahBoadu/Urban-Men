import { formatDate } from "@/lib/format";
import type { RequestMessage, StyleRequest } from "@/lib/types";

/** Older requests were saved without a thread: rebuild one from the description and the admin note. */
export function getThread(r: StyleRequest): RequestMessage[] {
  if (r.thread?.length) return r.thread;
  const base: RequestMessage[] = [{ from: "customer", text: r.description, at: r.createdAt }];
  if (r.adminNote) base.push({ from: "admin", text: r.adminNote, at: r.createdAt });
  return base;
}

/** Chat-style conversation between a customer and the shop. */
export function RequestThread({ request, viewer }: { request: StyleRequest; viewer: "customer" | "admin" }) {
  const thread = getThread(request);
  return (
    <ol className="mt-4 space-y-3" aria-label="Conversation">
      {thread.map((m, i) => {
        const mine = m.from === viewer;
        return (
          <li key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${mine ? "bg-gold/15 text-ivory" : "bg-white/8 text-ivory"}`}>
              <p className="mb-1 text-[0.7rem] uppercase tracking-[0.2em] text-mist">
                {m.from === "admin" ? "Urban Men" : request.userName} · {formatDate(m.at)}
              </p>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
