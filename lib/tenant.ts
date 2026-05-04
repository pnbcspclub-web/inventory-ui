import type { Session } from "next-auth";

export function getTenantOwnerId(
  user: Pick<NonNullable<Session["user"]>, "id" | "ownerId">
) {
  return user.ownerId ?? user.id;
}
