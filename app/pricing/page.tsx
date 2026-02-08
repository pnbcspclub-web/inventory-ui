import Link from "next/link";
import Image from "next/image";

const tiers = [
  {
    name: "Starter",
    price: "$129",
    cadence: "per location / month",
    description: "For single-store teams modernizing inventory accuracy.",
    highlights: [
      "Core inventory dashboard",
      "Low stock alerts",
      "Standard onboarding",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$289",
    cadence: "per location / month",
    description: "For multi-store operators scaling purchasing and reporting.",
    highlights: [
      "All Starter features",
      "Multi-location transfers",
      "Role-based approvals",
      "Sales and purchase orders",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual contract",
    description: "For complex supply chains and advanced governance.",
    highlights: [
      "All Growth features",
      "Advanced analytics",
      "Dedicated success team",
      "Custom integrations",
    ],
  },
];

export default function PricingPage() {
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
              Features
            </Link>
            <Link href="/demo-request" className="btn-primary">
              Request a demo
            </Link>
          </div>
        </header>

        <section className="mt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
            Plans that scale with your footprint.
          </h1>
          <p className="mt-4 text-lg text-[color:var(--color-muted)]">
            Transparent pricing with the essentials your inventory team needs.
          </p>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`hero-stat p-6 ${
                tier.featured ? "border-[color:var(--color-foreground)]" : ""
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
                {tier.name}
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold">{tier.price}</span>
                <span className="text-xs text-[color:var(--color-muted)]">
                  {tier.cadence}
                </span>
              </div>
              <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                {tier.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
                {tier.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--color-brand)]" />
                    {highlight}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/demo-request" className="btn-primary w-full inline-flex justify-center">
                  Talk to sales
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 hero-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Need a tailored plan?</h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                We can bundle onboarding, data migration, and support.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/how-it-works" className="btn-secondary">
                How it works
              </Link>
              <Link href="/demo-request" className="btn-primary">
                Start a request
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
