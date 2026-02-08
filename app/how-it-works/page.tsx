import Link from "next/link";
import Image from "next/image";

const steps = [
  {
    title: "Map your catalog",
    description:
      "Import SKUs, variants, and supplier data in minutes with guided templates.",
  },
  {
    title: "Connect your flows",
    description:
      "Link purchasing, sales, and transfers so stock levels update instantly.",
  },
  {
    title: "Set guardrails",
    description:
      "Define roles, approval chains, and alert thresholds for every location.",
  },
  {
    title: "Monitor the pulse",
    description:
      "Use the live dashboard to spot exceptions, expiring stock, and gaps.",
  },
  {
    title: "Act with confidence",
    description:
      "Trigger reorder workflows, transfers, and reporting from one workspace.",
  },
];

export default function HowItWorksPage() {
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
            <Link href="/features" className="btn-secondary">
              Explore features
            </Link>
            <Link href="/demo-request" className="btn-primary">
              Request a demo
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              How it works
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              From catalog to control in a single sprint.
            </h1>
            <p className="text-lg text-[color:var(--color-muted)]">
              The rollout blends onboarding support with automation so your team can
              focus on operational wins in the first week.
            </p>
          </div>
          <div className="hero-card p-6">
            <h2 className="text-lg font-semibold">Implementation cadence</h2>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--color-muted)]">
              <div className="hero-stat p-4">Day 1: Import master data and locations.</div>
              <div className="hero-stat p-4">Day 3: Configure roles, approvals, and alerts.</div>
              <div className="hero-stat p-4">Day 7: Go live with order flow and reporting.</div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step.title} className="hero-stat p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                {step.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12 hero-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Ready to plan your rollout?</h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                Share your footprint and we will design a tailored launch plan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/pricing" className="btn-secondary">
                Pricing
              </Link>
              <Link href="/demo-request" className="btn-primary">
                Schedule a session
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
