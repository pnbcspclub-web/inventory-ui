import Link from "next/link";
import Image from "next/image";

const featureBlocks = [
  {
    title: "Live stock intelligence",
    description:
      "Track on-hand, committed, and incoming units with threshold alerts that keep shelves ready.",
  },
  {
    title: "Unified order flow",
    description:
      "Manage purchase and sales orders in one workspace with approvals and supplier status views.",
  },
  {
    title: "Team-level permissions",
    description:
      "Grant access by role, store, and responsibility so every update is accountable.",
  },
  {
    title: "Smart reorder planning",
    description:
      "Forecast lead times and demand trends with reorder suggestions built into the timeline.",
  },
  {
    title: "Multi-location views",
    description:
      "Compare store inventory and transfers in a single, sortable dashboard.",
  },
  {
    title: "Audit-ready history",
    description:
      "Capture every adjustment with notes, user history, and exportable logs.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen app-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]"
          >
            <span className="h-8 w-8 overflow-hidden rounded-lg border border-black/10 bg-white/90">
              <Image
                src="/logo.jpeg"
                alt="InventaGrow logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </span>
            InventaGrow
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/pricing" className="btn-secondary">
              View pricing
            </Link>
            <Link href="/demo-request" className="btn-primary">
              Request a demo
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              Features
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Every inventory moment, mapped with clarity.
            </h1>
            <p className="text-lg text-[color:var(--color-muted)]">
              InventaGrow keeps operations tight with curated workflows, reporting,
              and automation across every team and location.
            </p>
          </div>
          <div className="hero-card p-6">
            <p className="text-sm font-semibold text-[color:var(--color-muted)]">
              Platform highlights
            </p>
            <div className="mt-4 space-y-4 text-sm text-[color:var(--color-muted)]">
              <div className="hero-stat p-4">
                Real-time stock visibility across stores and warehouses.
              </div>
              <div className="hero-stat p-4">
                Automated alerts for low stock, expiring batches, and slow movers.
              </div>
              <div className="hero-stat p-4">
                On-demand insights for buyers, managers, and finance teams.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureBlocks.map((feature) => (
            <div key={feature.title} className="hero-stat p-5">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12 hero-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">See the full feature matrix.</h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                Get a guided tour tailored to your inventory complexity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/how-it-works" className="btn-secondary">
                How it works
              </Link>
              <Link href="/demo-request" className="btn-primary">
                Book a walkthrough
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
