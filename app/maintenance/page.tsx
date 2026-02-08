import { getAppSettings } from "@/lib/settings";

export default async function MaintenancePage() {
  const settings = await getAppSettings();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 app-background">
      <div className="max-w-lg rounded-3xl border border-black/5 bg-white/90 p-10 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Maintenance
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          {settings.appName} is getting updates.
        </h1>
        <p className="mt-3 text-[color:var(--color-muted)]">
          {settings.appDescription}
        </p>
        <p className="mt-6 text-sm text-[color:var(--color-muted)]">
          We are performing scheduled maintenance. Please check back soon.
        </p>
      </div>
    </div>
  );
}
