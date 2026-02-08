"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Empty, Table, Tag } from "antd";

type NotificationRow = {
  id: string;
  title?: string | null;
  message: string;
  channel: string;
  createdAt: string;
  createdBy?: { name?: string | null; email?: string | null } | null;
};

export default function ShopkeeperNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  };

  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    const stopPolling = () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const startPolling = () => {
      stopPolling();
      void fetchNotifications();
      pollRef.current = window.setInterval(fetchNotifications, 30000);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const dataSource = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        sentAtLabel: new Date(item.createdAt).toLocaleString(),
        senderLabel: item.createdBy?.name ?? item.createdBy?.email ?? "Admin",
      })),
    [items]
  );

  return (
    <Card title="Notifications" className="shadow-sm border border-black/5">
      {items.length === 0 ? (
        <Empty description="No notifications yet" />
      ) : (
        <Table
          rowKey="id"
          dataSource={dataSource}
          loading={loading}
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: "Message",
              dataIndex: "message",
              render: (value, record) => (
                <div className="space-y-1">
                  {record.title ? (
                    <div className="font-semibold">{record.title}</div>
                  ) : null}
                  <div className="text-sm text-[color:var(--color-muted)]">
                    {value}
                  </div>
                </div>
              ),
            },
            { title: "From", dataIndex: "senderLabel" },
            {
              title: "Channel",
              dataIndex: "channel",
              render: (value) => <Tag>{value}</Tag>,
            },
            { title: "Sent at", dataIndex: "sentAtLabel" },
          ]}
        />
      )}
    </Card>
  );
}
