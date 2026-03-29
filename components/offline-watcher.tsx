"use client";

import { useEffect, useState } from "react";
import { notification } from "antd";
import { WifiOutlined } from "@ant-design/icons";

export default function OfflineWatcher() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      notification.success({
        message: "Back Online",
        description: "Your internet connection has been restored.",
        placement: "bottomRight",
        duration: 3,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      notification.error({
        message: "No Internet Connection",
        description: "Please check your network settings. Some features may not work correctly.",
        placement: "bottomRight",
        duration: 0, // Stay until manually closed or back online
        icon: <WifiOutlined style={{ color: "#ff4d4f" }} />,
        key: "offline-notification",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Close the error notification if we come back online
  useEffect(() => {
    if (!isOffline) {
      notification.destroy("offline-notification");
    }
  }, [isOffline]);

  return null;
}
