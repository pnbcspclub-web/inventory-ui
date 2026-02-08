"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Form, Input, Switch, message } from "antd";

type Settings = {
  maintenanceMode: boolean;
};

export default function SettingsClient() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
      form.setFieldsValue(data);
    }
    setLoading(false);
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (values: Settings) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success("Settings updated");
      fetchSettings();
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to update settings");
    }
  };

  const changePassword = async (values: { password: string }) => {
    const res = await fetch("/api/admin/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success("Password updated");
      passwordForm.resetFields();
    } else {
      const data = await res.json();
      message.error(data.error ?? "Unable to update password");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Manage App">
        <Form layout="vertical" form={form} onFinish={saveSettings}>
          <Form.Item
            label="Maintenance Mode"
            name="maintenanceMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" disabled={!settings} loading={loading}>
            Save Settings
          </Button>
        </Form>
      </Card>

      <Card title="Set New Password">
        <Form layout="vertical" form={passwordForm} onFinish={changePassword}>
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Update Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}
