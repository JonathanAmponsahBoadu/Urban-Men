"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/stores";
import { btnPrimary, input, label } from "@/lib/ui";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (done) {
    return (
      <div className="rounded-sm border border-gold/40 bg-navy-soft p-8">
        <p className="font-display text-2xl">Thank you, we got your message.</p>
        <p className="mt-2 text-mist">We will reply as soon as we can, by phone or WhatsApp.</p>
        <button type="button" onClick={() => setDone(false)} className="mt-5 text-gold underline-offset-4 hover:underline">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = String(f.get("name") ?? "").trim();
        const contact = String(f.get("contact") ?? "").trim();
        const message = String(f.get("message") ?? "").trim();
        if (name.length < 2) return setError("Please enter your name.");
        if (contact.length < 5) return setError("Add a phone number or email so we can reply.");
        if (message.length < 10) return setError("Please write a little more (at least 10 characters).");
        if (!submitContactMessage({ name, contact, message })) return setError("Your browser could not save the message. Please try again.");
        setError("");
        setDone(true);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className={label}>Your name</label>
          <input id="ct-name" name="name" autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor="ct-contact" className={label}>Phone or email</label>
          <input id="ct-contact" name="contact" autoComplete="email" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="ct-msg" className={label}>Message</label>
        <textarea id="ct-msg" name="message" rows={5} className={input} />
      </div>
      {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
      <button type="submit" className={btnPrimary}>Send message</button>
    </form>
  );
}
