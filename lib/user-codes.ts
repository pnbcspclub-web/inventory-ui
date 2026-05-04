import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const userCodeInclude = {
  codeAssignments: {
    orderBy: [{ assignedAt: "asc" as const }],
    select: {
      assignedAt: true,
      code: {
        select: {
          id: true,
          value: true,
        },
      },
    },
  },
  primaryCode: {
    select: {
      id: true,
      value: true,
    },
  },
} satisfies Prisma.UserInclude;

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

async function assertUserWithinOwner(
  tx: Prisma.TransactionClient,
  ownerId: string,
  userId: string
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, ownerId: true },
  });

  if (!user) {
    throw new Error("UserNotFound");
  }

  const effectiveOwnerId = user.ownerId ?? user.id;
  if (effectiveOwnerId !== ownerId) {
    throw new Error("CrossTenantAssignment");
  }

  return user;
}

export async function assignCodeToUser(input: {
  ownerId: string;
  userId: string;
  code: string;
  assignedById?: string | null;
  setPrimary?: boolean;
}) {
  const normalizedValue = normalizeCode(input.code);
  if (!normalizedValue) {
    throw new Error("InvalidCode");
  }

  return prisma.$transaction(async (tx) => {
    await assertUserWithinOwner(tx, input.ownerId, input.userId);

    const code = await tx.code.upsert({
      where: {
        ownerId_normalizedValue: {
          ownerId: input.ownerId,
          normalizedValue,
        },
      },
      update: { value: normalizedValue },
      create: {
        ownerId: input.ownerId,
        value: normalizedValue,
        normalizedValue,
      },
    });

    await tx.userCode.upsert({
      where: {
        ownerId_userId_codeId: {
          ownerId: input.ownerId,
          userId: input.userId,
          codeId: code.id,
        },
      },
      update: {
        assignedById: input.assignedById ?? undefined,
      },
      create: {
        ownerId: input.ownerId,
        userId: input.userId,
        codeId: code.id,
        assignedById: input.assignedById ?? null,
      },
    });

    if (input.setPrimary) {
      await tx.user.update({
        where: { id: input.userId },
        data: { primaryCodeId: code.id },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: input.userId },
      include: userCodeInclude,
    });
  });
}

export async function removeCodeFromUser(input: {
  ownerId: string;
  userId: string;
  code: string;
}) {
  const normalizedValue = normalizeCode(input.code);
  if (!normalizedValue) {
    throw new Error("InvalidCode");
  }

  return prisma.$transaction(async (tx) => {
    await assertUserWithinOwner(tx, input.ownerId, input.userId);

    const code = await tx.code.findUnique({
      where: {
        ownerId_normalizedValue: {
          ownerId: input.ownerId,
          normalizedValue,
        },
      },
      select: { id: true },
    });

    if (!code) {
      throw new Error("CodeNotFound");
    }

    const deleted = await tx.userCode.deleteMany({
      where: {
        ownerId: input.ownerId,
        userId: input.userId,
        codeId: code.id,
      },
    });

    if (deleted.count === 0) {
      throw new Error("AssignmentNotFound");
    }

    const user = await tx.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: {
        primaryCodeId: true,
        codeAssignments: {
          where: { ownerId: input.ownerId },
          orderBy: [{ assignedAt: "asc" }],
          select: { codeId: true },
        },
      },
    });

    if (user.primaryCodeId === code.id) {
      await tx.user.update({
        where: { id: input.userId },
        data: {
          primaryCodeId: user.codeAssignments[0]?.codeId ?? null,
        },
      });
    }

    const remainingAssignments = await tx.userCode.count({
      where: {
        ownerId: input.ownerId,
        codeId: code.id,
      },
    });

    if (remainingAssignments === 0) {
      await tx.code.delete({
        where: { id: code.id },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: input.userId },
      include: userCodeInclude,
    });
  });
}

export async function getUserCodes(input: { ownerId: string; userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: userCodeInclude,
  });

  if (!user) {
    throw new Error("UserNotFound");
  }

  const effectiveOwnerId = user.ownerId ?? user.id;
  if (effectiveOwnerId !== input.ownerId) {
    throw new Error("CrossTenantRead");
  }

  return {
    primaryCode: user.primaryCode?.value ?? null,
    codes: user.codeAssignments.map((assignment) => ({
      id: assignment.code.id,
      value: assignment.code.value,
      assignedAt: assignment.assignedAt,
      isPrimary: assignment.code.id === user.primaryCode?.id,
    })),
  };
}

export async function getUsersByCode(input: { ownerId: string; code: string }) {
  const normalizedValue = normalizeCode(input.code);
  if (!normalizedValue) {
    throw new Error("InvalidCode");
  }

  const code = await prisma.code.findUnique({
    where: {
      ownerId_normalizedValue: {
        ownerId: input.ownerId,
        normalizedValue,
      },
    },
    select: {
      id: true,
      value: true,
      users: {
        where: { ownerId: input.ownerId },
        orderBy: [{ assignedAt: "asc" }],
        select: {
          assignedAt: true,
          user: {
            select: {
              id: true,
              ownerId: true,
              name: true,
              email: true,
              shopName: true,
              primaryCodeId: true,
            },
          },
        },
      },
    },
  });

  if (!code) {
    return [];
  }

  return code.users
    .filter((assignment) => (assignment.user.ownerId ?? assignment.user.id) === input.ownerId)
    .map((assignment) => ({
      id: assignment.user.id,
      name: assignment.user.name,
      email: assignment.user.email,
      shopName: assignment.user.shopName,
      assignedAt: assignment.assignedAt,
      isPrimary: assignment.user.primaryCodeId === code.id,
      code: code.value,
    }));
}

export function serializeUserWithCodes(
  user: Prisma.UserGetPayload<{ include: typeof userCodeInclude }>
) {
  return {
    id: user.id,
    ownerId: user.ownerId,
    name: user.name,
    email: user.email,
    role: user.role,
    userCode: user.primaryCode?.value ?? null,
    userCodes: user.codeAssignments.map((assignment) => ({
      id: assignment.code.id,
      value: assignment.code.value,
      assignedAt: assignment.assignedAt,
      isPrimary: assignment.code.id === user.primaryCode?.id,
    })),
    shopName: user.shopName,
    shopStatus: user.shopStatus,
    shopExpiry: user.shopExpiry,
    address: user.address,
    phone: user.phone,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
  };
}
