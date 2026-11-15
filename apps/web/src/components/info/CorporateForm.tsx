"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/stores";
import { btnPrimary, input, label } from "@/lib/ui";

/** Enquiry form for staff-uniform / bulk orders. Saved as an admin inbox message until the backend exists. */
export function CorporateForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (done) {
    return (
      <div className="rounded-sm border border-gold/40 bg-navy-soft p-8">
        <p className="font-display text-2xl">Thank you, we got your enquiry.</p>
        <p className="mt-2 text-mist">We will contact you to talk about designs, sizes, timing and a quote.</p>
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
        const get = (k: string) => String(f.get(k) ?? "").trim();
        const company = get("company");
        const name = get("name");
        const contact = get("contact");
        const qty = get("qty");
        if (company.length < 2) return setError("Please enter your company or organisation.");
        if (name.length < 2) return setError("Please enter your name.");
        if (contact.length < 5) return setError("Add a phone number or email so we can reach you.");
        if (!qty) return setError("Roughly how many pieces do you need?");
        const message = [
          "CORPORATE ORDER ENQUIRY",
          `Company: ${company}`,
          `Pieces needed: ${qty}`,
          get("when") ? `Needed by: ${get("when")}` : "",
          get("details") ? `Details: ${get("details")}` : "",
        ].filter(Boolean).join("\n");
        if (!submitContactMessage({ name: `${name} (${company})`, contact, message })) return setError("Your browser could not save the enquiry. Please try again.");
        setError("");
        setDone(true);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="co-company" className={label}>Company or organisation</label>
          <input id="co-company" name="company" autoComplete="organization" className={input} />
        </div>
        <div>
          <label htmlFor="co-name" className={label}>Your name</label>
          <input id="co-name" name="name" autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor="co-contact" className={label}>Phone or email</label>
          <input id="co-contact" name="contact" autoComplete="email" className={input} />
        </div>
        <div>
          <label htmlFor="co-qty" className={label}>Roughly how many pieces?</label>
          <input id="co-qty" name="qty" inputMode="numeric" placeholder="e.g. 25" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="co-when" className={label}>Needed by (optional)</label>
        <input id="co-when" name="when" placeholder="e.g. end of March" className={input} />
      </div>
      <div>
        <label htmlFor="co-details" className={label}>Anything else (optional)</label>
        <textarea id="co-details" name="details" rows={4} placeholder="Designs you like, colours, logos or embroidery, sizes if you know them" className={input} />
      </div>
      {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
      <button type="submit" className={btnPrimary}>Send enquiry</button>
    </form>
  );
}
