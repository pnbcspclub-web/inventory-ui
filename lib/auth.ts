import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";

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
          mustChangePassword: user.mustChangePassword,
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
        token.mustChangePassword = (user as { mustChangePassword?: boolean })
          .mustChangePassword ?? false;
      }

      if (token.uid) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: {
            role: true,
            userCode: true,
            address: true,
            phone: true,
            shopName: true,
            shopStatus: true,
            shopExpiry: true,
            mustChangePassword: true,
          },
        });

        if (currentUser) {
          token.role = currentUser.role;
          token.userCode = currentUser.userCode;
          token.address = currentUser.address;
          token.phone = currentUser.phone;
          token.shopName = currentUser.shopName;
          token.shopStatus = currentUser.shopStatus;
          token.shopExpiry = currentUser.shopExpiry
            ? currentUser.shopExpiry.toISOString()
            : null;
          token.mustChangePassword = currentUser.mustChangePassword;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.role = token.role as Role;
        session.user.id = token.uid as string;
        session.user.userCode = token.userCode as string | null;
        session.user.address = token.address as string | null;
        session.user.phone = token.phone as string | null;
        session.user.shopName = token.shopName as string | null;
        session.user.shopStatus = token.shopStatus as "ACTIVE" | "SUSPENDED";
        session.user.shopExpiry = token.shopExpiry as string | null;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);
