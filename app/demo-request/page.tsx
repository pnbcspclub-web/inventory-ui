"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { message } from "antd";

const fields = [
  { label: "Full name", id: "fullName", type: "text", placeholder: "Jordan Lee" },
  { label: "Work email", id: "email", type: "email", placeholder: "jordan@company.com" },
  { label: "Company", id: "company", type: "text", placeholder: "Brightline Retail" },
  { label: "Locations", id: "locations", type: "number", placeholder: "4" },
];

export default function DemoRequestPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        message.success("Your request has been sent successfully!");
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Failed to send request.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      message.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
            {success ? (
              <div className="text-center py-10 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Request Received!</h2>
                <p className="text-[color:var(--color-muted)]">
                  Thank you for your interest. We'll be in touch within one business day.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="btn-secondary mt-4"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {fields.map((field) => (
                  <label key={field.id} className="block text-sm font-semibold">
                    {field.label}
                    <input
                      required={field.id === "fullName" || field.id === "email"}
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
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Submit request"}
                </button>
                <p className="text-xs text-[color:var(--color-muted)]">
                  We respond within one business day with next steps.
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
