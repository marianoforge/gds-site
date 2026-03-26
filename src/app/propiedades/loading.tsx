export default function LoadingPropertiesPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <main className="container mx-auto px-4 pb-20 pt-28 lg:px-8">
        <div className="mb-10 h-28 animate-pulse rounded-2xl bg-card shadow-card" />
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="h-10 w-72 animate-pulse rounded bg-card" />
          <div className="h-5 w-28 animate-pulse rounded bg-card" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-96 animate-pulse rounded-2xl bg-card shadow-card" />
          ))}
        </div>
      </main>
    </div>
  );
}
