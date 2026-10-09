import type { Metadata } from "next";
import { CustomStyleForm } from "@/components/CustomStyleForm";

export const metadata: Metadata = {
  title: "Request a custom style",
  description: "Describe the shirt you want, or share a photo, and Urban Men will tell you what is possible and the price.",
};

const steps = [
  { n: "01", title: "Tell us", text: "Describe the style, or add photos of looks you love." },
  { n: "02", title: "We review", text: "We check fabric, print and fit, then reply with what is possible and a price." },
  { n: "03", title: "We make it", text: "Once you agree, we make it and arrange delivery." },
];

export default function CustomStylePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Made for you</p>
      <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
        Request a <em className="text-gold">custom style.</em>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-mist">
        Cannot find the shirt you imagined? Type what you want, add a picture if you have one, and we will get back to you.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <CustomStyleForm />
        <aside>
          <h2 className="font-display text-2xl">How it works</h2>
          <ol className="mt-6 space-y-6">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-display text-2xl text-gold">{s.n}</span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-mist">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}
