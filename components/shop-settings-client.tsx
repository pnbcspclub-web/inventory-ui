"use client";

import { Button, Card, Descriptions, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";

type ShopSettingsClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
    shopName?: string | null;
    phone?: string | null;
    address?: string | null;
    mustChangePassword?: boolean;
  };
};

export default function ShopSettingsClient({ user }: ShopSettingsClientProps) {
  const [passwordForm] = Form.useForm();
  const router = useRouter();
  const requiresPasswordChange = Boolean(user.mustChangePassword);

  const changePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const res = await fetch("/api/shopkeeper/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });

    if (res.ok) {
      message.success("Password updated");
      passwordForm.resetFields();
      if (requiresPasswordChange) {
        router.replace("/dashboard");
        router.refresh();
      }
      return;
    }

    const data = await res.json();
    message.error(data.error ?? "Unable to update password");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
          Settings
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          {requiresPasswordChange
            ? "You must set a new password before you can use the rest of the app."
            : "Review your shop profile details. Contact your admin to update these fields."}
        </p>
      </div>

      <Card className="border border-black/5 shadow-sm">
        <Descriptions
          column={1}
          size="middle"
          items={[
            { key: "shopName", label: "Shop Name", children: user.shopName ?? "--" },
            { key: "name", label: "Owner Name", children: user.name ?? "--" },
            { key: "email", label: "Email", children: user.email ?? "--" },
            { key: "phone", label: "Phone", children: user.phone ?? "--" },
            { key: "address", label: "Address", children: user.address ?? "--" },
          ]}
        />
      </Card>

      <Card
        title={requiresPasswordChange ? "Set Your New Password" : "Change Password"}
        className="border border-black/5 shadow-sm"
      >
        <Form layout="vertical" form={passwordForm} onFinish={changePassword}>
          {requiresPasswordChange ? null : (
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: "Enter your current password" }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>
          )}
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Enter a new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter new password" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {requiresPasswordChange ? "Save New Password" : "Update Password"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
