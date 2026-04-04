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

  return (
    <div className="min-h-screen bg-white text-[#17181f]">
      <header className="border-b border-black/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3 text-[15px] font-semibold text-[#1f2027]">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#191a20]">
              <Image
                src="/logo.jpeg"
                alt="InventaGrow logo"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.02em]">InventaGrow</span>
          </Link>

          <div className="flex items-center gap-6 sm:gap-10">
            <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#666c7a] md:flex">
              <Link href="/features" className="transition hover:text-[#17181f]">
                Features
              </Link>
              <Link href="/pricing" className="transition hover:text-[#17181f]">
                Pricing
              </Link>
            </nav>
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-[#191a20] px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl justify-center px-6 pb-20 pt-20 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="w-full">
          <section className="flex max-w-4xl flex-col items-center px-4 text-center mx-auto">
            <div className="inline-flex items-center rounded-full bg-[#e8fbf1] px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#0a8f68]">
              The Science Of Selling
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-none tracking-[-0.05em] text-[#17181f] sm:text-6xl md:text-7xl">
              The Art of{" "}
              <span className="font-bold italic text-[#06a66e]">Growth</span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-9 text-[#667085] sm:text-2xl sm:leading-11">
              Transform your business with intelligent inventory management,
              real-time analytics, and seamless sales tracking. Built for the next
              generation of retail.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-3xl bg-[#191a20] px-8 text-lg font-semibold text-white transition hover:bg-black"
              >
                Start Free Trial
                <span aria-hidden="true" className="text-xl leading-none">
                  &rarr;
                </span>
              </Link>
              <Link
                href="/demo-request"
                className="inline-flex min-h-14 items-center justify-center rounded-3xl border border-black/10 bg-white px-8 text-lg font-medium text-[#353845] transition hover:border-black/20 hover:bg-[#fafafa]"
              >
                View Demo
              </Link>
            </div>
          </section>

          <section className="mx-auto mt-28 max-w-7xl">
            <div className="px-4 text-center">
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#17181f] sm:text-5xl">
                Everything you need to scale
              </h2>
              <p className="mt-5 text-lg text-[#667085] sm:text-2xl">
                Powerful tools designed to simplify your operations.
              </p>
            </div>

            <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_8px_24px_rgba(17,24,39,0.06)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#191a20] text-white">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">
                    Real-time Sync
                  </h3>
                </div>
                <p className="mt-6 max-w-sm text-lg leading-9 text-[#667085]">
                  Your inventory updates instantly across all devices and sales channels.
                </p>
              </article>

              <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_8px_24px_rgba(17,24,39,0.06)]">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#191a20] text-white">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19h16" />
                      <path d="M6 16V9" />
                      <path d="M12 16V5" />
                      <path d="M18 16v-3" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">
                    Advanced Analytics
                  </h3>
                </div>
                <p className="mt-6 max-w-sm text-lg leading-9 text-[#667085]">
                  Deep insights into your sales patterns and customer behavior.
                </p>
              </article>

              <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_8px_24px_rgba(17,24,39,0.06)] md:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#191a20] text-white">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4Z" />
                      <path d="m9.5 12 1.5 1.5 3.5-3.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">
                    Enterprise Security
                  </h3>
                </div>
                <p className="mt-6 max-w-sm text-lg leading-9 text-[#667085]">
                  Bank-grade encryption to keep your business data safe and private.
                </p>
              </article>
            </div>
          </section>

          <section className="mx-auto mt-32 max-w-5xl">
            <div className="px-4 text-center">
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#17181f] sm:text-5xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-sm text-[#667085] sm:text-base">
                Choose the plan that fits your business stage. No hidden fees, just growth.
              </p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              <article className="rounded-[1.7rem] border border-black/10 bg-white p-8 shadow-[0_10px_28px_rgba(17,24,39,0.06)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-[#f7f7f9] text-[#7b8090]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M12 14v2" />
                  </svg>
                </div>

                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">
                  Startup Shop
                </h3>
                <p className="mt-2 text-sm text-[#7b8090]">
                  Perfect for new ventures and small retail stores.
                </p>

                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.04em] text-[#17181f]">
                    ₹1,999
                  </span>
                  <span className="mb-1 text-sm text-[#7b8090]">/first year</span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#06a66e]">Renew at ₹3,999</p>

                <ul className="mt-8 space-y-4 text-sm text-[#596172]">
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Up to 500 Products
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Single User Access
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Basic Sales Reports
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Email Support
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Mobile App Access
                  </li>
                </ul>

                <Link
                  href="/pricing"
                  className="mt-10 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#191a20] px-6 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Get Started
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </article>

              <article className="relative rounded-[1.7rem] border border-[#10b981]/30 bg-white p-8 text-[#17181f] shadow-[0_16px_36px_rgba(16,185,129,0.12)]">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10b981] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  Recommended
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#10b981]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M12 14v2" />
                  </svg>
                </div>

                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">
                  Big Shop
                </h3>
                <p className="mt-2 text-sm text-[#667085]">
                  Designed for established businesses with high volume.
                </p>

                <div className="mt-8 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.04em] text-[#17181f]">
                    ₹4,999
                  </span>
                  <span className="mb-1 text-sm text-[#667085]">/first year</span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#10b981]">Renew at ₹6,999</p>

                <ul className="mt-8 space-y-4 text-sm text-[#596172]">
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Unlimited Products
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Multi-user Support
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Advanced Analytics &amp; AI
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Priority 24/7 Support
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    Custom Branding
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#10b981] text-[#10b981]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    API Access
                  </li>
                </ul>

                <Link
                  href="/pricing"
                  className="mt-10 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#10b981] px-6 text-sm font-semibold text-white transition hover:bg-[#0da56f]"
                >
                  Get Started
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </article>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 text-xs text-[#7b8090] sm:flex-row lg:px-10">
          <div className="flex items-center gap-2 font-semibold text-[#17181f]">
            <span className="text-sm">↗</span>
            <span>InventaGrow</span>
          </div>
          <p>© 2026 InventaGrow. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-[#17181f]">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-[#17181f]">
              Terms
            </Link>
            <Link href="/demo-request" className="transition hover:text-[#17181f]">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
