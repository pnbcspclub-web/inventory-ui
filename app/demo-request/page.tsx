import Link from "next/link";
import Image from "next/image";

const fields = [
  { label: "Full name", id: "fullName", type: "text", placeholder: "Jordan Lee" },
  { label: "Work email", id: "email", type: "email", placeholder: "jordan@company.com" },
  { label: "Company", id: "company", type: "text", placeholder: "Brightline Retail" },
  { label: "Locations", id: "locations", type: "number", placeholder: "4" },
];

export default function DemoRequestPage() {
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
            <Link href="/pricing" className="btn-secondary">
              Pricing
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              Demo request
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              See InventaGrow in action.
            </h1>
            <p className="text-lg text-[color:var(--color-muted)]">
              Share a few details and we will craft a walkthrough tailored to your
              locations, workflow, and goals.
            </p>
            <div className="hero-card p-6 text-sm text-[color:var(--color-muted)]">
              <p className="font-semibold text-[color:var(--color-foreground)]">
                What you will get
              </p>
              <ul className="mt-3 space-y-2">
                <li>Inventory setup guidance for your product catalog.</li>
                <li>Live walkthrough of purchase and sales workflows.</li>
                <li>Reporting and alert configuration with a specialist.</li>
              </ul>
            </div>
          </div>

          <div className="hero-card p-6">
            <form className="space-y-4">
              {fields.map((field) => (
                <label key={field.id} className="block text-sm font-semibold">
                  {field.label}
                  <input
                    className="mt-2 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--color-foreground)] shadow-sm focus:border-[color:var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
              <label className="block text-sm font-semibold" htmlFor="notes">
                Notes
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--color-foreground)] shadow-sm focus:border-[color:var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="Share your inventory goals or system requirements."
                />
              </label>
              <button type="submit" className="btn-primary w-full">
                Submit request
              </button>
              <p className="text-xs text-[color:var(--color-muted)]">
                We respond within one business day with next steps.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
