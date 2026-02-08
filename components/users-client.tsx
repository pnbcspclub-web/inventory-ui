"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";

type User = {
  id: string;
  name?: string | null;
  email: string;
  role: "ADMIN" | "SHOPKEEPER";
  userCode?: string | null;
  shopName?: string | null;
  shopStatus?: "ACTIVE" | "SUSPENDED";
  shopExpiry?: string | null;
  address?: string | null;
  phone?: string | null;
  createdAt: string;
};

type UserFormValues = {
  shopName?: string;
  name?: string;
  email?: string;
  userCode?: string;
  shopStatus?: "ACTIVE" | "SUSPENDED";
  shopExpiry?: dayjs.Dayjs | null;
  address?: string;
  phone?: string;
  password?: string;
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<User | null>(null);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");
  const filter = searchParams.get("filter");
  const expiringDays = Number(searchParams.get("days")) || 2;

  const isExpiringWithin = (value: string | null | undefined, days: number) => {
    if (!value) return false;
    const expiry = dayjs(value);
    if (!expiry.isValid()) return false;
    const diffDays = expiry.diff(dayjs(), "day");
    return diffDays <= days;
  };

  const exportCsv = () => {
    if (!users.length) {
      message.warning("No users to export");
      return;
    }

    const headers = [
      "Shop",
      "Owner",
      "Email",
      "Code",
      "Status",
      "Expiry",
      "Address",
      "Phone",
      "Role",
      "Created",
    ];

    const toCsvValue = (value: unknown) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = users.map((user) => [
      user.shopName ?? "",
      user.name ?? "",
      user.email,
      user.userCode ?? "",
      user.shopStatus ?? "",
      user.shopExpiry ? new Date(user.shopExpiry).toLocaleDateString() : "",
      user.address ?? "",
      user.phone ?? "",
      user.role,
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `users-export-${stamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortByCreatedAt = useCallback(
    (items: User[]) =>
      [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    []
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users", { cache: "no-store" });
    if (res.ok) setUsers(sortByCreatedAt(await res.json()));
    setLoading(false);
  }, [sortByCreatedAt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = useCallback(
    (user?: User) => {
      setEditing(user ?? null);
      setOpen(true);
      if (user) {
        form.setFieldsValue({
          ...user,
          shopExpiry: user.shopExpiry ? dayjs(user.shopExpiry) : null,
        });
      } else {
        form.resetFields();
      }
    },
    [form]
  );

  useEffect(() => {
    if (mode === "create" && !open && !editing) {
      openModal();
      router.replace("/admin/users");
    }
  }, [editing, mode, open, openModal, router]);

  const onFinish = async (values: UserFormValues) => {
    const payload = {
      ...values,
      shopExpiry: values.shopExpiry ? values.shopExpiry.toISOString() : null,
    };
    const res = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved = (await res.json()) as User;
      message.success(`User ${editing ? "updated" : "created"}`);
      setOpen(false);
      setEditing(null);
      setUsers((prev) => {
        if (editing) {
          return sortByCreatedAt(
            prev.map((item) => (item.id === saved.id ? saved : item))
          );
        }
        return sortByCreatedAt([saved, ...prev]);
      });
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to save user");
    }
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("User deleted");
      if (editing?.id === id) {
        setOpen(false);
        setEditing(null);
      }
      setUsers((prev) => prev.filter((item) => item.id !== id));
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to delete user");
    }
  };

  const updateUser = async (id: string, payload: Partial<UserFormValues>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved = (await res.json()) as User;
      setUsers((prev) =>
        sortByCreatedAt(prev.map((item) => (item.id === saved.id ? saved : item)))
      );
      return saved;
    }
    const data = await res.json();
    throw new Error(data.error ?? "Unable to update user");
  };

  const toggleStatus = async (user: User) => {
    const nextStatus = user.shopStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await updateUser(user.id, { shopStatus: nextStatus });
      message.success(
        nextStatus === "SUSPENDED" ? "Shop suspended" : "Shop reactivated"
      );
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const sendReminder = (user: User) => {
    setReminderTarget(user);
    setReminderOpen(true);
  };

  const confirmReminder = () => {
    if (reminderTarget) {
      const messageText = `Your shop subscription for ${reminderTarget.shopName ?? "your shop"} is expiring soon. Please renew to avoid interruption.`;
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Subscription expiring",
          message: messageText,
          userId: reminderTarget.id,
          channel: "IN_APP",
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unable to send reminder");
          message.success(
            `Reminder sent for ${reminderTarget.shopName ?? reminderTarget.email}`
          );
        })
        .catch(() => {
          message.error("Unable to send reminder");
        });
    }
    setReminderOpen(false);
    setReminderTarget(null);
  };

  const setExpiringFilter = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", "expiring");
    params.set("days", String(days));
    router.replace(`/admin/users?${params.toString()}`);
  };

  const filteredUsers = useMemo(() => {
    if (filter === "expiring") {
      return users.filter((user) => isExpiringWithin(user.shopExpiry, expiringDays));
    }
    return users;
  }, [expiringDays, filter, users]);

  return (
    <Card
      title="User Management"
      extra={
        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchData} loading={loading}>
            Refresh
          </Button>
          <Button onClick={exportCsv}>Export CSV</Button>
          <Button type="primary" onClick={() => openModal()}>
            Add User
          </Button>
        </div>
      }
      className="shadow-sm border border-black/5"
    >
      {filter === "expiring" ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
              Expiring filter
            </div>
            <div className="text-sm text-[color:var(--color-muted)]">
              Showing shops expiring within {expiringDays} days.
            </div>
          </div>
          <Segmented
            value={expiringDays}
            options={[
              { label: "2 days", value: 2 },
              { label: "7 days", value: 7 },
              { label: "14 days", value: 14 },
              { label: "30 days", value: 30 },
            ]}
            onChange={(value) => setExpiringFilter(value as number)}
          />
        </div>
      ) : null}
      <Table
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        columns={[
          {
            title: "Shop",
            dataIndex: "shopName",
            render: (value, record) => (
              <span
                className={
                  isExpiringWithin(record.shopExpiry, 2)
                    ? "text-red-600 font-semibold"
                    : undefined
                }
              >
                {value ?? "--"}
              </span>
            ),
          },
          { title: "Owner", dataIndex: "name" },
          { title: "Code", dataIndex: "userCode" },
          { title: "Status", dataIndex: "shopStatus" },
          {
            title: "Expiry",
            dataIndex: "shopExpiry",
            render: (value) =>
              value ? (
                <span
                  className={
                    isExpiringWithin(value, 2)
                      ? "inline-flex items-center rounded-md border border-red-500 px-2 py-0.5 text-red-600 font-semibold"
                      : undefined
                  }
                >
                  {new Date(value).toLocaleDateString()}
                </span>
              ) : (
                "--"
              ),
          },
          {
            title: "Created",
            dataIndex: "createdAt",
            render: (value) => new Date(value).toLocaleDateString(),
          },
          {
            title: "Actions",
            render: (_, record) => (
              <div className="flex gap-2">
                <Button onClick={() => openModal(record)}>Edit</Button>
                <Button onClick={() => sendReminder(record)}>
                  Send reminder
                </Button>
                <Popconfirm
                  title={
                    record.shopStatus === "SUSPENDED"
                      ? "Reactivate shop?"
                      : "Suspend shop?"
                  }
                  onConfirm={() => toggleStatus(record)}
                >
                  <Button>
                    {record.shopStatus === "SUSPENDED" ? "Activate" : "Suspend"}
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Delete user?"
                  onConfirm={() => onDelete(record.id)}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />
      <Modal
        open={reminderOpen}
        onCancel={() => setReminderOpen(false)}
        onOk={confirmReminder}
        okText="Send reminder"
        title="Expiry reminder"
      >
        <p className="text-sm text-[color:var(--color-muted)]">
          This message will be sent to the shop owner.
        </p>
        <div className="mt-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm">
          <p className="font-semibold">
            Hi {reminderTarget?.name ?? "there"},
          </p>
          <p className="mt-2 text-[color:var(--color-muted)]">
            Your shop subscription for {reminderTarget?.shopName ?? "your shop"}{" "}
            is expiring soon. Please renew to avoid interruption.
          </p>
        </div>
      </Modal>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={editing ? "Edit User" : "Add User"}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Shop Name" name="shopName" rules={[{ required: true }]}>
            <Input placeholder="NORTH COMPUTERS" />
          </Form.Item>
          <Form.Item label="Owner Name" name="name">
            <Input placeholder="Owner name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="User Code" name="userCode">
            <Input placeholder="Ex: AG" maxLength={4} />
          </Form.Item>
          <Form.Item label="Shop Status" name="shopStatus" initialValue="ACTIVE">
            <Select
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Suspended", value: "SUSPENDED" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Expiry Date" name="shopExpiry">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input placeholder="WhatsApp contact number" />
          </Form.Item>
          {!editing ? (
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          ) : (
            <Form.Item label="New Password" name="password">
              <Input.Password placeholder="Leave blank to keep current" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
}
