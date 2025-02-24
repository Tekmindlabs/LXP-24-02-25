import { initTRPC, TRPCError, type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from "superjson";
import { ZodError } from "zod";
import { Permission, DefaultRoles } from "@/utils/permissions";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { academicCalendarRouter } from "./routers/academic-calendar";
import type { Session } from "next-auth";


export const isServer = () => typeof window === 'undefined';


// Extend Session type to include roles
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: string[];
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }

  interface User {
    id: string;
    roles: string[];
    permissions: string[];
  }
}

export type Context = {
  prisma: typeof prisma;
  session: Session | null;
};

type TRPCShape = {
  data: {
    zodError?: ZodError | null;
    code?: string;
    message?: string;
  };
};

type TRPCNext = {
  ctx: Context;
};

interface RolePermission {
  permission: {
    name: string;
  };
}

interface Role {
  name: string;
  permissions: RolePermission[];
}

interface UserRole {
  role: Role;
}

interface UserWithRoles {
  userRoles: UserRole[];
}


export const createTRPCContext = async (opts?: CreateNextContextOptions) => {
  const session = await getServerAuthSession();

  if (session?.user) {
    // Directly check for super-admin role from token
    const isSuperAdmin = session.user.roles?.includes(DefaultRoles.SUPER_ADMIN);
    
    if (isSuperAdmin) {
      // For super admin, set roles and permissions directly
      session.user.roles = [DefaultRoles.SUPER_ADMIN];
      const allPermissions = await prisma.permission.findMany();
      session.user.permissions = allPermissions.map(p => p.name);
    } else {
      // For other users, load from database
      const userWithRoles = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      session.user.roles = userWithRoles?.userRoles?.map(ur => ur.role.name) || [];
      session.user.permissions = userWithRoles?.userRoles.flatMap(
        userRole => userRole.role.permissions.map(rp => rp.permission.name)
      ) || [];
    }
  }

  return {
    prisma,
    session,
    userRoles: session?.user?.roles || [],
    userPermissions: session?.user?.permissions || []
  };
};





const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }: { shape: TRPCShape; error: { cause?: unknown; code?: string; message: string } }) {
    console.error('TRPC Error:', error);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        code: error.code,
        message: error.message,
      },
    };
  },
  });

  export const createTRPCRouter = t.router;
  export const publicProcedure = t.procedure;


const enforceUserIsAuthed = t.middleware(({ ctx, next }: { ctx: Context; next: (opts: { ctx: Context }) => Promise<any> }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      prisma: ctx.prisma,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});


export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserHasPermission = (requiredPermission: Permission) =>
  t.middleware(async ({ ctx, next }: { ctx: Context; next: (opts: { ctx: Context }) => Promise<any> }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    // Get user's roles with their permissions from database
    const userWithRoles = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Check if user has super-admin role
    const isSuperAdmin = userWithRoles?.userRoles.some(
      (userRole: UserRole) => userRole.role.name === DefaultRoles.SUPER_ADMIN
    );

    // Super admin has all permissions
    if (isSuperAdmin) {
      // Get all permissions from the database
      const allPermissions = await ctx.prisma.permission.findMany();
      return next({
        ctx: {
          ...ctx,
          session: {
            ...ctx.session,
            user: {
              ...ctx.session.user,
              roles: [DefaultRoles.SUPER_ADMIN],
                permissions: allPermissions.map((p: { name: string }) => p.name)
            }
          }
        }
      });
    }

    // For non-super-admin users, check specific permissions
    const userPermissions = userWithRoles?.userRoles.flatMap(
      (userRole: UserRole) => userRole.role.permissions.map((rp: RolePermission) => rp.permission.name)
    ) || [];

    console.log('Permission check:', {
      requiredPermission,
          userRoles: userWithRoles?.userRoles.map((ur: UserRole) => ur.role.name),
      isSuperAdmin,
      userPermissions,
      hasPermission: userPermissions.includes(requiredPermission)
    });

    if (!userPermissions.includes(requiredPermission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session,
          user: {
            ...ctx.session.user,
            permissions: userPermissions
          }
        }
      }
    });
  });

export const permissionProtectedProcedure = (permission: Permission) =>
  t.procedure.use(enforceUserHasPermission(permission));