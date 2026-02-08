"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  message,
} from "antd";

type NotificationRow = {
  id: string;
  title?: string | null;
  message: string;
  channel: string;
  userId?: string | null;
  createdAt: string;
  createdBy?: { id: string; name?: string | null; email?: string | null } | null;
  user?: { id: string; name?: string | null; shopName?: string | null; email?: string | null } | null;
};

type UserOption = { label: string; value: string };

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [form] = Form.useForm();

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        id: string;
        shopName?: string | null;
        name?: string | null;
        email?: string | null;
      }[];
      setUsers(
        data.map((item) => ({
          value: item.id,
          label: `${item.shopName ?? "Shop"} - ${item.name ?? item.email ?? "Owner"}`,
        }))
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (composeOpen && users.length === 0) {
      fetchUsers();
    }
  }, [composeOpen, users.length]);

  const dataSource = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        target: item.user ? item.user.shopName ?? item.user.email ?? "Shop" : "All users",
        sentAtLabel: new Date(item.createdAt).toLocaleString(),
      })),
    [items]
  );

  const onCompose = async (values: { title?: string; message: string; userId?: string; target: "ALL" | "USER" }) => {
    const payload = {
      title: values.title?.trim() || null,
      message: values.message.trim(),
      userId: values.target === "ALL" ? null : values.userId,
      channel: "IN_APP",
    };
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      message.error("Unable to send notification");
      return;
    }
    message.success("Notification sent");
    setComposeOpen(false);
    form.resetFields();
    fetchNotifications();
  };

  const onDelete = async (id: string) => {
    const res = await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      message.error("Unable to delete notification");
      return;
    }
    message.success("Notification removed");
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Card
      title="Notifications"
      extra={
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => fetchNotifications()}>Refresh</Button>
          <Button type="primary" onClick={() => setComposeOpen(true)}>
            Send notification
          </Button>
        </div>
      }
      className="shadow-sm border border-black/5"
    >
      {items.length === 0 ? (
        <Empty description="No notifications sent yet" />
      ) : (
        <Table
          rowKey="id"
          dataSource={dataSource}
          loading={loading}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Target", dataIndex: "target" },
            { title: "Title", dataIndex: "title" },
            { title: "Message", dataIndex: "message" },
            { title: "Sent at", dataIndex: "sentAtLabel" },
            {
              title: "Actions",
              render: (_, record) => (
                <Popconfirm
                  title="Remove notification?"
                  onConfirm={() => onDelete(record.id)}
                >
                  <Button danger size="small">
                    Remove
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={composeOpen}
        onCancel={() => setComposeOpen(false)}
        onOk={() => form.submit()}
        title="Send notification"
        okText="Send"
      >
        <Form layout="vertical" form={form} onFinish={onCompose} initialValues={{ target: "ALL" }}>
          <Form.Item name="target" label="Target" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "All users", value: "ALL" },
                { label: "Single user", value: "USER" },
              ]}
            />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) =>
              getFieldValue("target") === "USER" ? (
                <Form.Item name="userId" label="User" rules={[{ required: true }]}>
                  <Select showSearch options={users} optionFilterProp="label" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="title" label="Title">
            <Input placeholder="Optional title" />
          </Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Write the notification message" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
