import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import type { RolePermission, Role } from '@prisma/client';
import type { Context } from '../trpc';
import { roleFormSchema } from '@/components/dashboard/RoleForm';

type RecursiveRole = Role & {
  parent: RecursiveRole | null;
  permissions: RolePermission[];
};

export const roleRouter = createTRPCRouter({
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        permissionIds: z.array(z.string()).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      return ctx.prisma.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          permissions: data.permissionIds ? {
            deleteMany: {},
            create: data.permissionIds.map((permissionId: string) => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          } : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: id }) => {
      return ctx.prisma.role.delete({
        where: { id },
      });
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(roleFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.role.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.context === 'core' ? 'CORE' : 'CAMPUS',
          permissions: {
            create: input.permissions.map((permissionId: string) => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          },
        },
      });
    }),
  getInheritedPermissions: protectedProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ ctx, input }: { ctx: Context; input: { roleId: string } }) => {
      const { roleId } = input;
      
      const role = await ctx.prisma.role.findUnique({
        where: { id: roleId },
        include: {
          parent: {
            include: {
              permissions: true,
              parent: true,
            }
          },
          permissions: true,
        }
      });

      if (!role) return [];

      const parentPermissions = role.parent
        ? await resolveInheritedPermissions(role.parent as RecursiveRole, ctx)
        : [];

      return [...role.permissions, ...parentPermissions];
    }),

  assignRoleToCampuses: protectedProcedure
    .input(z.object({
      roleId: z.string(),
      campusIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const { roleId, campusIds } = input;
      
      return ctx.prisma.$transaction(
        campusIds.map(campusId => 
          ctx.prisma.rolePermission.create({
            data: {
              roleId,
              campusId,
              permissionId: 'default'
            }
          })
        )
      );
    }),
});

async function resolveInheritedPermissions(
  role: RecursiveRole,
  ctx: Context
): Promise<RolePermission[]> {
  if (!role) return [];

  let parentPermissions: RolePermission[] = [];
  if (role.parent) {
    parentPermissions = await resolveInheritedPermissions(role.parent as RecursiveRole, ctx);
  }

  return [...role.permissions, ...parentPermissions];
}
