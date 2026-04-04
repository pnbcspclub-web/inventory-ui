import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | InventaGrow",
  description: "Terms & Conditions for using the InventaGrow service.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f3] px-6 py-16 text-[#17181f] lg:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)] sm:p-12">
        <div className="border-b border-black/10 pb-8">
          <Link href="/" className="text-sm font-semibold text-[#0a8f68] transition hover:text-[#07684c]">
            Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-[#667085]">
            User Agreement
          </p>
          <p className="mt-6 text-sm text-[#667085]">Last updated: April 01, 2026</p>
          <p className="mt-6 rounded-3xl border border-[#f59e0b]/20 bg-[#fff7e8] px-5 py-4 text-sm font-medium text-[#8a5a00]">
            IMPORTANT LEGAL AGREEMENT
          </p>
          <p className="mt-6 text-base leading-8 text-[#4b5563]">
            Welcome to InventaGrow (Rajasthan, India).
          </p>
          <p className="mt-4 text-base leading-8 text-[#4b5563]">
            By accessing or using this website and services, you confirm that you have read, understood,
            and legally agreed to these Terms &amp; Conditions.
          </p>
          <p className="mt-4 text-base leading-8 text-[#4b5563]">
            If you do not agree, you must not use this Service.
          </p>
        </div>

        <div className="mt-10 space-y-10 text-[#4b5563]">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">1. Nature of Service</h2>
            <p>InventaGrow provides an inventory management web application for shopkeepers and businesses to:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Manage products</li>
              <li>Track inventory</li>
              <li>Generate product codes</li>
              <li>Store business-related data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">2. Eligibility</h2>
            <p>By using this Service, you confirm that:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>You are at least 18 years old OR using under proper supervision</li>
              <li>You are legally capable of entering into an agreement</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">3. Account Registration</h2>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Users must provide accurate information</li>
              <li>You are responsible for maintaining account confidentiality</li>
              <li>You are responsible for all activity under your account</li>
              <li>Sharing login credentials is strictly prohibited</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">
              4. User Responsibility (VERY IMPORTANT)
            </h2>
            <p>By using this platform, you agree:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>All data entered by you is your responsibility</li>
              <li>You are responsible for product details, pricing, and records</li>
              <li>You are responsible for compliance with tax and business laws</li>
            </ul>
            <div className="rounded-3xl bg-[#f8fafc] px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#667085]">
                InventaGrow is NOT responsible for:
              </p>
              <ul className="mt-4 space-y-3 pl-6 list-disc">
                <li>Business losses</li>
                <li>Incorrect data entered by users</li>
                <li>Any disputes with customers or third parties</li>
                <li>Misuse of the platform</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">5. Payments &amp; Subscription</h2>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Access to the Service may be paid</li>
              <li>All fees must be paid in advance (unless stated otherwise)</li>
              <li>Fees are non-refundable, unless explicitly mentioned</li>
            </ul>
            <p>Failure to pay may result in: Suspension or termination of access</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">6. Acceptable Use Policy</h2>
            <p>You agree NOT to:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Use the platform for illegal purposes</li>
              <li>Enter false or misleading data</li>
              <li>Attempt hacking, reverse engineering, or unauthorized access</li>
              <li>Use the service to harm other users or systems</li>
            </ul>
            <p>Violation may result in permanent account termination.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">7. Data Ownership</h2>
            <ul className="space-y-3 pl-6 list-disc">
              <li>You own the data you upload</li>
              <li>You grant InventaGrow permission to process and store your data to provide services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">8. Service Availability</h2>
            <p>We aim to provide uninterrupted service, but we do NOT guarantee 100% uptime or error-free operation.</p>
            <p>The service may be temporarily unavailable due to maintenance or technical issues.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, InventaGrow shall NOT be liable for:</p>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of data, profit, or business</li>
              <li>Errors caused by user input</li>
            </ul>
            <p>Use of the service is at your own risk.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">
              10. Account Suspension &amp; Termination
            </h2>
            <p>We reserve the right to suspend or terminate accounts, remove data, and block access.</p>
            <p>Reasons include violation of terms, non-payment, and suspicious or illegal activity.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">11. Third-Party Services</h2>
            <p>The platform may use third-party tools/services.</p>
            <p>We are not responsible for their performance or their policies.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">12. Changes to Terms</h2>
            <p>We may update these Terms anytime. Continued use means acceptance of updated Terms.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">13. Governing Law</h2>
            <p>These Terms are governed by the laws of India (Rajasthan jurisdiction).</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">14. Dispute Resolution</h2>
            <p>Any disputes shall be subject to courts located in Rajasthan, India.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181f]">15. Contact Information</h2>
            <p>Email: help@inventagrow.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
