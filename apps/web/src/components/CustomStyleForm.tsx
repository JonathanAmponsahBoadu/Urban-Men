"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { whatsappUrl } from "@/data/site";
import { colourOptions } from "@/lib/catalogue";
import { compressImage } from "@/lib/images";
import { submitStyleRequest } from "@/lib/stores";
import type { StyleRequest, User } from "@/lib/types";
import { btnGhost, btnOutline, btnPrimary, input, label } from "@/lib/ui";

const MAX_PHOTOS = 3;

function Form({ user }: { user: User }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [colour, setColour] = useState("");
  const [budget, setBudget] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [contact, setContact] = useState(user.phone ?? "");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<StyleRequest | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    try {
      const room = MAX_PHOTOS - images.length;
      const next = await Promise.all([...files].slice(0, room).map((f) => compressImage(f)));
      setImages((cur) => [...cur, ...next]);
      if (files.length > room) setError(`You can add up to ${MAX_PHOTOS} photos.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that photo.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) return setError("Please describe the style in a few words (at least 10 characters).");
    if (!contact.trim()) return setError("Add a phone number so we can reach you.");
    const { ok, request } = submitStyleRequest(user, {
      contact: contact.trim(),
      description: description.trim(),
      images,
      colour: colour || undefined,
      budget: budget.trim() || undefined,
      measurements: measurements.trim() || undefined,
    });
    if (!ok) return setError("Your browser could not save the photos. Try fewer or smaller photos.");
    setDone(request);
  };

  if (done) {
    const text = [
      `Hello Urban Men, I sent a style request (${done.id}).`,
      done.description,
      done.images.length ? `(I will attach ${done.images.length} reference photo${done.images.length > 1 ? "s" : ""} here.)` : "",
    ].filter(Boolean).join("\n");
    return (
      <div className="rounded-sm border border-gold/40 bg-navy-soft p-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Request received</p>
        <h2 className="mt-3 font-display text-3xl">Thank you, {user.name.split(" ")[0]}.</h2>
        <p className="mt-3 text-mist">
          Your reference is <span className="font-semibold text-ivory">{done.id}</span>. We will review it and reply with what is possible and a price. You will see our answer in your inbox.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl(text)} className={btnPrimary}>Also send on WhatsApp</a>
          <Link href="/account/requests" className={btnOutline}>View my requests</Link>
        </div>
        {done.images.length > 0 && <p className="mt-4 text-xs text-mist">WhatsApp links cannot attach photos automatically, so add your photos in the chat.</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="cs-desc" className={label}>Describe the style you want</label>
        <textarea
          id="cs-desc"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={input}
          maxLength={1500}
          placeholder="e.g. A cream long-sleeve shirt with a kente panel on the left chest, matching trousers, for a wedding in December."
        />
      </div>

      <div>
        <span className={label}>Reference photos (optional, up to {MAX_PHOTOS})</span>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={i} className="group relative h-28 w-24 overflow-hidden rounded-sm bg-navy-deep">
              <Image src={src} alt={`Reference photo ${i + 1}`} fill sizes="96px" className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => setImages((cur) => cur.filter((_, j) => j !== i))}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/90 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="flex h-28 w-24 flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-gold/50 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              <span className="text-2xl leading-none">+</span>
              {busy ? "Adding…" : "Add photo"}
            </button>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="sr-only" aria-label="Choose reference photos" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="cs-colour" className={label}>Main colour (optional)</label>
          <select id="cs-colour" value={colour} onChange={(e) => setColour(e.target.value)} className={input}>
            <option value="">No preference</option>
            {colourOptions.map((c) => <option key={c}>{c}</option>)}
            <option>Other (say in description)</option>
          </select>
        </div>
        <div>
          <label htmlFor="cs-budget" className={label}>Budget (optional)</label>
          <input id="cs-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={input} placeholder="e.g. GH₵ 700" />
        </div>
      </div>

      <div>
        <label htmlFor="cs-meas" className={label}>Size or measurements (optional)</label>
        <textarea id="cs-meas" rows={2} value={measurements} onChange={(e) => setMeasurements(e.target.value)} className={input} placeholder="Size L, or chest 110 cm, shoulder 48 cm, sleeve 64 cm…" />
        <p className="mt-2 text-xs text-mist">Not sure? See the <Link href="/size-guide" className="text-gold underline-offset-4 hover:underline">size guide</Link>.</p>
      </div>

      <div>
        <label htmlFor="cs-contact" className={label}>Phone number</label>
        <input id="cs-contact" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} className={input} placeholder="055 000 0000" />
      </div>

      {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btnPrimary} disabled={busy}>Send request</button>
        <button type="button" className={btnGhost} onClick={() => { setDescription(""); setImages([]); setError(""); }}>Clear</button>
      </div>
    </form>
  );
}

export function CustomStyleForm() {
  return <RequireAuth>{(user) => <Form user={user} />}</RequireAuth>;
}
