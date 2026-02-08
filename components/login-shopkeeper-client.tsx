"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import { signIn } from "next-auth/react";

export default function LoginShopkeeperClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      role: "SHOPKEEPER",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (result?.error) {
      setError("Invalid shopkeeper credentials.");
    } else if (result?.url) {
      window.location.href = result.url;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 app-background">
      <Card className="w-full max-w-md shadow-xl">
        <Typography.Title level={3} className="!mb-2">
          Shopkeeper Sign In
        </Typography.Title>
        <Typography.Text className="text-[color:var(--color-muted)]">
          Manage products, quantities, and stock.
        </Typography.Text>
        <div className="mt-6">
          {error ? <Alert type="error" message={error} className="mb-4" /> : null}
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="shopkeeper@store.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password placeholder="Your password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign in
            </Button>
          </Form>
        </div>
        <div className="mt-6 text-sm text-[color:var(--color-muted)]">
          Need access? Contact your administrator.
        </div>
      </Card>
    </div>
  );
}
