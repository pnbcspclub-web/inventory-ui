"use client";

import { Card, Descriptions } from "antd";

type ShopSettingsClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
    shopName?: string | null;
    phone?: string | null;
    address?: string | null;
  };
};

export default function ShopSettingsClient({ user }: ShopSettingsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
          Settings
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Review your shop profile details. Contact your admin to update these
          fields.
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
    </div>
  );
}
