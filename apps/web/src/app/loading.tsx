export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-5 h-12 w-2/3 max-w-xl animate-pulse rounded bg-white/10" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="aspect-4/5 animate-pulse rounded-sm bg-white/10" />
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
