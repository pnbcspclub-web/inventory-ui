"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import AntdRegistry from "@/components/antd-registry";
import OfflineWatcher from "@/components/offline-watcher";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AntdRegistry>
        <ThemeProvider>
          <OfflineWatcher />
          {children}
        </ThemeProvider>
      </AntdRegistry>
    </SessionProvider>
  );
}
