import Link from "next/link";
import Image from "next/image";
import { CheckOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";

const tiers = [
  {
    name: "Startup Shop",
    price: "₹1,999",
    cadence: "/first year",
    renewal: "Renew at ₹3,999",
    description: "Perfect for new ventures and small retail stores.",
    highlights: [
      "Up to 500 Products",
      "Single User Access",
      "Basic Sales Reports",
      "Email Support",
      "Mobile App Access",
    ],
    featured: false,
  },
  {
    name: "Big Shop",
    price: "₹4,999",
    cadence: "/first year",
    renewal: "Renew at ₹6,999",
    description: "Designed for established businesses with high volume.",
    highlights: [
      "Unlimited Products",
      "Multi-user Support",
      "Advanced Analytics & AI",
      "Priority 24/7 Support",
      "Custom Branding",
      "API Access",
    ],
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen app-background pb-20">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-6 mb-16">
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

        <section className="mb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Simple Pricing
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">
            Plans that grow with you.
          </h1>
          <p className="mt-6 text-xl text-[color:var(--color-muted)] max-w-2xl mx-auto">
            Choose the perfect plan for your retail business. No hidden fees, just transparent pricing.
          </p>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-[40px] p-10 bg-white transition-all duration-300 ${
                tier.featured 
                  ? "border border-[#10b981] shadow-2xl shadow-[#10b981]/5" 
                  : "border border-gray-100 shadow-xl shadow-gray-200/40"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                  Recommended
                </div>
              )}
              
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 border ${
                tier.featured ? "bg-[#f0fdf4] border-[#dcfce7] text-[#10b981]" : "bg-gray-50 border-gray-100 text-gray-400"
              }`}>
                <LockOutlined className="text-lg" />
              </div>

              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {tier.name}
              </h3>
              
              <p className="mt-2 text-gray-500 text-[15px] font-medium leading-relaxed">
                {tier.description}
              </p>

              <div className="mt-8">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{tier.price}</span>
                  <span className="text-lg font-medium text-gray-400">{tier.cadence}</span>
                </div>
                <p className="mt-0.5 text-[#10b981] font-bold text-base">
                  {tier.renewal}
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {tier.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-gray-600 text-[15px] font-medium leading-normal">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                      <CheckOutlined className="text-[9px]" />
                    </div>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link 
                  href="/demo-request" 
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[17px] transition-all duration-200 ${
                    tier.featured 
                      ? "bg-[#10b981] hover:bg-[#0da975] text-white shadow-lg shadow-[#10b981]/20" 
                      : "bg-[#161b22] hover:bg-[#0d1117] text-white"
                  }`}
                >
                  Get Started
                  <ArrowRightOutlined className="text-sm" />
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-24 rounded-[40px] bg-gray-50 p-10 lg:p-16 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Need a custom enterprise solution?</h2>
              <p className="mt-4 text-lg text-gray-500 font-medium">
                We offer tailored plans for large-scale operations with complex multi-location requirements, dedicated support, and custom integrations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/how-it-works" className="btn-secondary px-8 py-4 text-lg">
                How it works
              </Link>
              <Link href="/demo-request" className="btn-primary px-8 py-4 text-lg">
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
