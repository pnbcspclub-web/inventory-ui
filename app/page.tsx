import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAppSettings } from "@/lib/settings";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  const settings = await getAppSettings();
  if (settings.maintenanceMode) {
    redirect("/maintenance");
  }
  const rupee = String.fromCharCode(0x20b9);

  return (
    <div className="min-h-screen app-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-6">
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
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[color:var(--color-muted)]">
          <Link href="/features" className="hover:text-[color:var(--color-foreground)]">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-[color:var(--color-foreground)]">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-[color:var(--color-foreground)]">
            Pricing
          </Link>
          <Link href="/demo-request" className="hover:text-[color:var(--color-foreground)]">
            Demo request
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-foreground)]">
              Cloud Inventory Suite
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Keep stock accurate, orders moving, and teams aligned.
            </h1>
            <p className="text-lg text-[color:var(--color-muted)]">
              A focused inventory workspace with role-based access, live stock
              movement, and smart reorder insights built for modern retail teams.
            </p>
            <ul className="grid gap-3 text-sm text-[color:var(--color-muted)]">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--color-brand)]" />
                Live stock pulse with low-quantity alerts.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--color-brand)]" />
                Sales and purchase orders in one flow.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--color-brand)]" />
                Secure access for admins and shopkeepers.
              </li>
            </ul>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login" className="btn-primary">
                Sign in
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                View demo
              </Link>
            </div>
          </div>
          <div className="hero-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
                  Operations snapshot
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Inventory pulse, live.
                </h2>
              </div>
              <div className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--color-foreground)]">
                Today
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="hero-stat p-4">
                <p className="text-sm text-[color:var(--color-muted)]">
                  Low stock alert
                </p>
                <p className="mt-2 text-2xl font-semibold">7 items</p>
                <p className="text-xs text-[color:var(--color-muted)]">
                  Reorder suggested within 48 hours
                </p>
              </div>
              <div className="hero-stat p-4">
                <p className="text-sm text-[color:var(--color-muted)]">
                  Sales today
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {rupee}4,320
                </p>
                <p className="text-xs text-[color:var(--color-muted)]">
                  +12% compared to yesterday
                </p>
              </div>
              <div className="hero-stat p-4">
                <p className="text-sm text-[color:var(--color-muted)]">
                  Purchase orders
                </p>
                <p className="mt-2 text-2xl font-semibold">3 pending</p>
                <p className="text-xs text-[color:var(--color-muted)]">
                  Awaiting supplier confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
