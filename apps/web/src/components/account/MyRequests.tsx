"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RequestThread } from "@/components/RequestThread";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { customerReplyToRequest, requestsStore, useCurrentUser } from "@/lib/stores";
import { btnOutline, btnPrimary, card, input } from "@/lib/ui";

function FollowUp({ id }: { id: string }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        customerReplyToRequest(id, text);
        setText("");
      }}
      className="mt-4 flex flex-col gap-2 sm:flex-row"
    >
      <label htmlFor={`fu-${id}`} className="sr-only">Your reply</label>
      <input id={`fu-${id}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply or add more detail…" className={input} />
      <button type="submit" disabled={!text.trim()} className={`${btnOutline} shrink-0 py-2`}>Send</button>
    </form>
  );
}

export function MyRequests() {
  const user = useCurrentUser();
  const all = useStore(requestsStore);
  if (!user) return null;
  const mine = all.filter((r) => r.userId === user.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Style requests</h2>
        <Link href="/custom-style" className={btnPrimary}>New request</Link>
      </div>
      {mine.length === 0 ? (
        <p className="mt-6 text-mist">You have not requested a custom style yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {mine.map((r) => (
            <li key={r.id} className={`${card} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.id}</p>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">{r.status}</span>
              </div>
              <p className="text-sm text-mist">Sent {formatDate(r.createdAt)}</p>
              {r.images.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {r.images.map((src, i) => (
                    <li key={i} className="relative h-24 w-20 overflow-hidden rounded-sm bg-navy-deep">
                      <Image src={src} alt={`Reference photo ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
                    </li>
                  ))}
                </ul>
              )}
              <RequestThread request={r} viewer="customer" />
              {r.status !== "Declined" && <FollowUp id={r.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
