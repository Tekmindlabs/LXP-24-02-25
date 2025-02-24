import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';
import type { Context } from '../api/trpc';
import { CampusPermission } from '@/types/campus';
import { DefaultRoles } from '@/utils/permissions';

const t = initTRPC.context<Context>().create();
const middleware = t.middleware;

export const checkCampusPermission = (requiredPermission: CampusPermission, campusId?: string) => 
  middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ 
        code: 'UNAUTHORIZED',
        message: 'Not authenticated'
      });
    }

    // Add superadmin bypass
    if (ctx.session.user.roles.includes(DefaultRoles.SUPER_ADMIN)) {
      return next();
    }

    const hasPermission = await ctx.prisma.campusRole.findFirst({
      where: {
        userId: ctx.session.user.id,
        campusId: campusId,
        role: {
          permissions: {
            some: {
              permission: {
                name: requiredPermission
              }
            }
          }
        }
      }
    });

    if (!hasPermission) {
      throw new TRPCError({ 
        code: 'FORBIDDEN',
        message: 'Insufficient permissions for this operation'
      });
    }

    return next();
  });
