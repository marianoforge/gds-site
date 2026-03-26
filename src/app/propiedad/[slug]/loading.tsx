export default function LoadingPropertyDetailPage() {
  return (
    <main className="min-h-screen bg-secondary">
      <section className="container mx-auto px-4 py-28 lg:px-8">
        <div className="mb-8 h-24 animate-pulse rounded-2xl bg-card shadow-card" />
        <div className="h-[560px] animate-pulse rounded-2xl bg-card shadow-card" />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="h-[600px] animate-pulse rounded-2xl bg-card shadow-card lg:col-span-2" />
          <div className="h-[600px] animate-pulse rounded-2xl bg-card shadow-card" />
        </div>
      </section>
    </main>
  );
}
