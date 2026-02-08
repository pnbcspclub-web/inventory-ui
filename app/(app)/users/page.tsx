import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin/users");
  }
  redirect("/dashboard");
}
