"use client";

import { useState } from "react";

function Star({ fill }: { fill: number }) {
  // fill: 0..1
  return (
    <span className="relative inline-block h-[1em] w-[1em] text-white/20" aria-hidden>
      <svg viewBox="0 0 24 24" className="absolute inset-0 fill-current">
        <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z" />
      </svg>
      <span className="absolute inset-0 overflow-hidden text-gold" style={{ width: `${fill * 100}%` }}>
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] fill-current">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z" />
        </svg>
      </span>
    </span>
  );
}

export function Stars({ value, className = "text-base" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} fill={Math.max(0, Math.min(1, value - (i - 1)))} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1 text-3xl" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="cursor-pointer"
        >
          <Star fill={i <= shown ? 1 : 0} />
        </button>
      ))}
    </div>
  );
}
