import type { AuditAction } from "@prisma/client";

interface CreateAuditLogOptions {
  tenantId: string;
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  oldData?: any;
  newData?: any;
  metadata?: any;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(options: CreateAuditLogOptions) {
  const {
    tenantId,
    userId,
    action,
    entity,
    entityId,
    oldData,
    newData,
    metadata,
  } = options;

  try {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Get audit logs for a tenant
 */
export async function getAuditLogs(
  tenantId: string,
  options?: {
    entity?: string;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    limit?: number;
    offset?: number;
  },
) {
  const where: any = { tenantId };

  if (options?.entity) where.entity = options.entity;
  if (options?.entityId) where.entityId = options.entityId;
  if (options?.userId) where.userId = options.userId;
  if (options?.action) where.action = options.action;

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 100,
    skip: options?.offset || 0,
  });

  const total = await prisma.auditLog.count({ where });

  return {
    logs,
    total,
  };
}
