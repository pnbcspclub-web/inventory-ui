"use client";

import { useDeferredValue, useEffect, useMemo, useState, type Key } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TableProps } from "antd";

type ProductStatus = "ACTIVE" | "INACTIVE" | "SOLD";

type Product = {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  quantity: number;
  status: ProductStatus;
  serialNumber: number;
  createdAt: string;
};

type EditableProduct = Product;

type ProductFormValues = {
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  status?: ProductStatus;
};

const STATUS_COLOR: Record<ProductStatus, string> = {
  ACTIVE: "green",
  INACTIVE: "gold",
  SOLD: "red",
};

export default function ProductsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [sellForm] = Form.useForm();
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [addOpen, setAddOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [selling, setSelling] = useState<EditableProduct | null>(null);
  const deferredSearch = useDeferredValue(search);
  const [tableFilters, setTableFilters] = useState<Record<string, Key[] | null>>(
    {}
  );
  const [tableSorter, setTableSorter] = useState<{
    field?: string;
    order?: "ascend" | "descend";
  }>({});
  const rupee = String.fromCharCode(0x20b9);

  const userCode =
    session?.user?.role === "SHOPKEEPER" ? session.user.userCode : null;
  const shopName = session?.user?.name ?? "Shopkeeper";
  const shopPhone = session?.user?.phone ?? "XXXXXXXXXX";
  const shopAddress = session?.user?.address ?? "Address not set";
  const isShopkeeper = session?.user?.role === "SHOPKEEPER";

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(
        [...data].sort((a, b) => a.serialNumber - b.serialNumber)
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const nextSerialNumber = useMemo(() => {
    const max = products.reduce(
      (current, product) => Math.max(current, product.serialNumber),
      0
    );
    return max + 1;
  }, [products]);

  const sortBySerial = (items: EditableProduct[]) =>
    [...items].sort((a, b) => a.serialNumber - b.serialNumber);

  const nextCode = useMemo(() => {
    if (!userCode) return "--";
    return `${userCode}${String(nextSerialNumber).padStart(2, "0")}`;
  }, [nextSerialNumber, userCode]);

  const onCreate = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      quantity: Number(values.quantity ?? 0),
      status: values.status,
    };
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = (await res.json()) as EditableProduct;
      message.success("Product created");
      form.resetFields();
      setAddOpen(false);
      setProducts((prev) => sortBySerial([...prev, created]));
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to create product");
    }
  };

  const openEdit = (record: EditableProduct) => {
    setEditing(record);
    editForm.setFieldsValue({
      name: record.name,
      description: record.description,
      price: record.price,
      quantity: record.quantity,
      status: record.status,
    });
  };

  const openSell = (record: EditableProduct) => {
    setSelling(record);
    setSellOpen(true);
    sellForm.setFieldsValue({ quantity: 1 });
  };

  const saveEdit = async () => {
    const values = (await editForm.validateFields()) as ProductFormValues;
    if (!editing) return;
    const res = await fetch(`/api/products/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        price: Number(values.price),
        quantity: Number(values.quantity),
        status: values.status,
      }),
    });
    if (res.ok) {
      const updated = (await res.json()) as EditableProduct;
      message.success("Product updated");
      setEditing(null);
      setProducts((prev) =>
        sortBySerial(prev.map((item) => (item.id === updated.id ? updated : item)))
      );
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to update product");
    }
  };

  const deleteRow = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Product deleted");
      if (editing?.id === id) {
        setEditing(null);
      }
      if (selling?.id === id) {
        setSellOpen(false);
        setSelling(null);
      }
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to delete product");
    }
  };

  const submitSell = async () => {
    const values = await sellForm.validateFields();
    if (!selling) return;
    const sellQty = Number(values.quantity ?? 0);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selling.id, quantity: sellQty }),
    });
    if (res.ok) {
      message.success("Sale recorded");
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id !== selling.id) return item;
          const nextQty = Math.max(0, item.quantity - sellQty);
          const nextStatus = nextQty === 0 ? "SOLD" : item.status;
          return { ...item, quantity: nextQty, status: nextStatus };
        })
      );
      setSellOpen(false);
      setSelling(null);
      sellForm.resetFields();
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to record sale");
    }
  };

  const filteredProducts = useMemo(() => {
    const term = deferredSearch.trim();
    if (!term) return products;

    const numeric = Number(term.replace(/,/g, ""));
    const isNumeric =
      !Number.isNaN(numeric) && /^[\d,]+(\.\d+)?$/.test(term);
    const upper = term.toUpperCase();
    const exactCode = products.find(
      (product) => product.sku.toUpperCase() === upper
    );

    if (exactCode) {
      if (exactCode.quantity > 0) {
        return [exactCode];
      }
      const targetPrice = Number(exactCode.price);
      if (Number.isFinite(targetPrice) && targetPrice > 0) {
        const min = targetPrice * 0.9;
        const max = targetPrice * 1.2;
        const alternatives = products.filter(
          (product) =>
            product.quantity > 0 &&
            Number(product.price) >= min &&
            Number(product.price) <= max
        );
        if (alternatives.length) {
          return [exactCode, ...alternatives];
        }
      }
      return [exactCode];
    }

    if (isNumeric) {
      const exactPriceAll = products.filter(
        (product) => Number(product.price) === numeric
      );
      const exactPriceInStock = exactPriceAll.filter(
        (product) => product.quantity > 0
      );
      if (exactPriceInStock.length) {
        return exactPriceInStock;
      }
      const min = numeric * 0.9;
      const max = numeric * 1.2;
      return products.filter(
        (product) =>
          product.quantity > 0 &&
          Number(product.price) >= min &&
          Number(product.price) <= max
      );
    }

    const lowerTerm = term.toLowerCase();
    const upperTerm = term.toUpperCase();
    return products.filter((product) => {
      const skuMatch = product.sku.toUpperCase().includes(upperTerm);
      const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
      return skuMatch || haystack.includes(lowerTerm);
    });
  }, [products, deferredSearch]);

  const handleTableChange: TableProps<EditableProduct>["onChange"] = (
    _pagination,
    filters,
    sorter
  ) => {
    setTableFilters(filters as Record<string, Key[] | null>);
    if (!Array.isArray(sorter)) {
      setTableSorter({
        field: (sorter.field as string | undefined) ?? undefined,
        order: sorter.order ?? undefined,
      });
    }
  };

  const clearTableSortFilter = () => {
    setTableFilters({});
    setTableSorter({});
  };

  const copyWhatsapp = async (product: Product) => {
    const messageText = `Product Code: ${product.sku}
Name: ${product.name}
Details: ${product.description ?? "-"}
Price: ${rupee}${Number(product.price).toLocaleString("en-IN")}
Stock: ${product.quantity > 0 ? "Available" : "Sold Out"}
Reply Yes To Buy
${shopName}
Contact: ${shopPhone}
${shopAddress}`;

    try {
      await navigator.clipboard.writeText(messageText);
      message.success("WhatsApp message copied");
    } catch {
      message.error("Unable to copy message");
    }
  };

  return (
    <div className="space-y-6">
      {!isShopkeeper ? (
        <Alert
          type="warning"
          message="Shopkeeper access only"
          description="Admins manage shopkeepers and app settings only."
        />
      ) : null}

      {!userCode ? (
        <Alert
          type="warning"
          message="User code required"
          description="Ask the admin to set your user code before adding products."
        />
      ) : null}

      <Card className="shadow-sm border border-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography.Title level={4} className="!mb-1">
              Products
            </Typography.Title>
            <Typography.Text className="text-[color:var(--color-muted)]">
              Add new products, track stock, and share details fast.
            </Typography.Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="primary"
              size="large"
              onClick={() => setAddOpen(true)}
              disabled={!userCode}
            >
              Add Product
            </Button>
          </div>
        </div>
        <div className="mt-5 max-w-xl">
          <Input.Search
            placeholder="Search by Product Code / Name / Price / Keyword"
            size="large"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
        </div>
      </Card>

      <Card
        title="Product List"
        className="shadow-sm border border-black/5"
        extra={
          <div className="flex gap-2">
            <Button onClick={clearTableSortFilter} disabled={loading}>
              Clear Sort & Filters
            </Button>
            <Button onClick={fetchData} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      >
        <Table
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          onChange={handleTableChange}
          columns={[
            {
              title: "Product Code",
              dataIndex: "sku",
              sorter: (a, b) => a.sku.localeCompare(b.sku),
              sortOrder:
                tableSorter.field === "sku" ? tableSorter.order : undefined,
            },
            {
              title: "Name",
              dataIndex: "name",
              sorter: (a, b) => a.name.localeCompare(b.name),
              sortOrder:
                tableSorter.field === "name" ? tableSorter.order : undefined,
            },
            {
              title: "Price",
              dataIndex: "price",
              render: (value) => `${rupee}${Number(value).toLocaleString("en-IN")}`,
              sorter: (a, b) => Number(a.price) - Number(b.price),
              sortOrder:
                tableSorter.field === "price" ? tableSorter.order : undefined,
            },
            {
              title: "Qty",
              dataIndex: "quantity",
              render: (value) => (
                <Tag color={value < 5 ? "volcano" : "blue"}>{value}</Tag>
              ),
              sorter: (a, b) => a.quantity - b.quantity,
              filters: [
                { text: "Low Stock (<5)", value: "LOW" },
                { text: "In Stock", value: "IN" },
                { text: "Out of Stock", value: "OUT" },
              ],
              filteredValue: tableFilters.quantity ?? null,
              onFilter: (value, record) => {
                if (value === "LOW") return record.quantity > 0 && record.quantity < 5;
                if (value === "OUT") return record.quantity === 0;
                if (value === "IN") return record.quantity > 0;
                return true;
              },
              sortOrder:
                tableSorter.field === "quantity"
                  ? tableSorter.order
                  : undefined,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (value: ProductStatus, record) => {
                const finalStatus = record.quantity === 0 ? "SOLD" : value;
                return (
                  <Tag color={STATUS_COLOR[finalStatus]}>{finalStatus}</Tag>
                );
              },
              filters: [
                { text: "Active", value: "ACTIVE" },
                { text: "Inactive", value: "INACTIVE" },
                { text: "Sold", value: "SOLD" },
              ],
              filteredValue: tableFilters.status ?? null,
              onFilter: (value, record) => {
                const finalStatus = record.quantity === 0 ? "SOLD" : record.status;
                return finalStatus === value;
              },
              sorter: (a, b) => {
                const aStatus = a.quantity === 0 ? "SOLD" : a.status;
                const bStatus = b.quantity === 0 ? "SOLD" : b.status;
                return aStatus.localeCompare(bStatus);
              },
              sortOrder:
                tableSorter.field === "status" ? tableSorter.order : undefined,
            },
            {
              title: "Action",
              render: (_, record) => (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => openEdit(record)}>Edit</Button>
                  <Button onClick={() => openSell(record)}>Sell</Button>
                  <Button onClick={() => copyWhatsapp(record)}>
                    WhatsApp Copy
                  </Button>
                  <Button danger onClick={() => deleteRow(record.id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={saveEdit}
        title="Edit Product"
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
          <Form.Item label="Price" name="price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Sold", value: "SOLD" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        title="Add Product"
      >
        <Form layout="vertical" form={form} onFinish={onCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item label="Product Code">
              <Input value={nextCode} readOnly />
            </Form.Item>
            <Form.Item label="Status" name="status" initialValue="ACTIVE">
              <Select
                options={[
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="DELL LAPTOP" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
          </Form.Item>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item label="Price" name="price" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="Quantity" name="quantity" initialValue={1}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={sellOpen}
        onCancel={() => setSellOpen(false)}
        onOk={submitSell}
        title="Create Sale"
      >
        <Form layout="vertical" form={sellForm}>
          <Form.Item label="Product">
            <Input value={selling?.name ?? ""} readOnly />
          </Form.Item>
          <Form.Item label="Available Quantity">
            <Input value={selling?.quantity ?? 0} readOnly />
          </Form.Item>
          <Form.Item
            label="Quantity Sold"
            name="quantity"
            rules={[
              { required: true, message: "Enter quantity" },
              {
                validator: (_, value) => {
                  if (!selling) return Promise.resolve();
                  if (value <= 0) return Promise.reject(new Error("Must be greater than 0"));
                  if (value > selling.quantity) {
                    return Promise.reject(
                      new Error("Cannot exceed available quantity")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
