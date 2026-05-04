"use client";

import { useEffect } from "react";
import { notification } from "antd";
import { LockOutlined } from "@ant-design/icons";

export default function MustChangePasswordWatcher({
  mustChangePassword,
}: {
  mustChangePassword: boolean;
}) {
  useEffect(() => {
    if (mustChangePassword) {
      notification.warning({
        key: "must-change-password",
        message: "Password Change Required",
        description: "For security reasons, you must change your password before you can access the full features of the application.",
        icon: <LockOutlined style={{ color: "#faad14" }} />,
        duration: 0,
        placement: "topRight",
      });
    } else {
      notification.destroy("must-change-password");
    }

    return () => {
      notification.destroy("must-change-password");
    };
  }, [mustChangePassword]);

  return null;
}
