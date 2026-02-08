import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role)
          return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;
        if (user.role !== credentials.role) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;
        if (user.role === "SHOPKEEPER") {
          if (user.shopStatus === "SUSPENDED") return null;
          if (user.shopExpiry && user.shopExpiry < new Date()) return null;
        }
        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          role: user.role,
          userCode: user.userCode,
          address: user.address,
          phone: user.phone,
          shopName: user.shopName,
          shopStatus: user.shopStatus,
          shopExpiry: user.shopExpiry ? user.shopExpiry.toISOString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const nextRole = (user as { role?: Role }).role ?? Role.SHOPKEEPER;
        token.role = nextRole;
        token.uid = (user as { id?: string }).id;
        token.userCode = (user as { userCode?: string | null }).userCode ?? null;
        token.address = (user as { address?: string | null }).address ?? null;
        token.phone = (user as { phone?: string | null }).phone ?? null;
        token.shopName = (user as { shopName?: string | null }).shopName ?? null;
        token.shopStatus = (user as { shopStatus?: "ACTIVE" | "SUSPENDED" })
          .shopStatus;
        token.shopExpiry = (user as { shopExpiry?: string | null }).shopExpiry ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.uid) {
        return session;
      }

      const user = await prisma.user.findUnique({
        where: { id: token.uid as string },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          userCode: true,
          address: true,
          phone: true,
          shopName: true,
          shopStatus: true,
          shopExpiry: true,
        },
      });

      if (!user) {
        return session;
      }

      session.user.role = user.role;
      session.user.id = user.id;
      session.user.userCode = user.userCode ?? null;
      session.user.address = user.address ?? null;
      session.user.phone = user.phone ?? null;
      session.user.shopName = user.shopName ?? null;
      session.user.shopStatus = user.shopStatus ?? "ACTIVE";
      session.user.shopExpiry = user.shopExpiry ? user.shopExpiry.toISOString() : null;
      session.user.name = user.name ?? session.user.name ?? null;
      session.user.email = user.email ?? session.user.email ?? null;

      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
