"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  message,
} from "antd";
type Order = {
  id: string;
  type: "PURCHASE" | "SALE";
  status: "DRAFT" | "COMPLETED" | "CANCELLED";
  partnerName?: string | null;
  total: number;
  createdAt: string;
};

type OrderFormValues = {
  type: Order["type"];
  status?: Order["status"];
  partnerName?: string;
  total?: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const rupee = String.fromCharCode(0x20b9);

  const sortByCreatedAt = (items: Order[]) =>
    [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) setOrders(sortByCreatedAt(await ordersRes.json()));
      setLoading(false);
    };
    fetchData();
  }, []);

  const onFinish = async (values: OrderFormValues) => {
    const payload = {
      type: values.type,
      status: values.status,
      partnerName: values.partnerName,
      total: Number(values.total ?? 0),
    };
    const res = await fetch(editing ? `/api/orders/${editing.id}` : "/api/orders", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved = (await res.json()) as Order;
      message.success(`Order ${editing ? "updated" : "created"}`);
      setOpen(false);
      setEditing(null);
      form.resetFields();
      setOrders((prev) => {
        if (editing) {
          return sortByCreatedAt(
            prev.map((item) => (item.id === saved.id ? saved : item))
          );
        }
        return sortByCreatedAt([saved, ...prev]);
      });
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to save order");
    }
  };

  const openModal = (order?: Order) => {
    setOpen(true);
    setEditing(order ?? null);
    if (order) {
      form.setFieldsValue({
        type: order.type,
        status: order.status,
        partnerName: order.partnerName,
        total: order.total,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "DRAFT" });
    }
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Order deleted");
      if (editing?.id === id) {
        setOpen(false);
        setEditing(null);
        form.resetFields();
      }
      setOrders((prev) => prev.filter((item) => item.id !== id));
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to delete order");
    }
  };

  return (
    <Card
      title="Orders"
      extra={
        <Button type="primary" onClick={() => openModal()}>
          New Order
        </Button>
      }
    >
      <Table
        dataSource={orders}
        rowKey="id"
        loading={loading}
        columns={[
          { title: "Type", dataIndex: "type" },
          {
            title: "Status",
            dataIndex: "status",
            render: (value) => (
              <Tag color={value === "COMPLETED" ? "green" : "gold"}>{value}</Tag>
            ),
          },
          { title: "Partner", dataIndex: "partnerName" },
          {
            title: "Total",
            dataIndex: "total",
            render: (value) => `${rupee}${Number(value).toFixed(2)}`,
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
                <Button danger onClick={() => onDelete(record.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={editing ? "Edit Order" : "Create Order"}
        width={720}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item label="Type" name="type" rules={[{ required: true }]}>
              <Select
                options={
                  isAdmin
                    ? [
                        { label: "Purchase", value: "PURCHASE" },
                        { label: "Sale", value: "SALE" },
                      ]
                    : [{ label: "Sale", value: "SALE" }]
                }
              />
            </Form.Item>
            <Form.Item label="Status" name="status" initialValue="DRAFT">
              <Select
                options={[
                  { label: "Draft", value: "DRAFT" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item label="Partner Name" name="partnerName">
            <Input placeholder="Supplier or customer name" />
          </Form.Item>
          <Form.Item
            label="Total Amount"
            name="total"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
