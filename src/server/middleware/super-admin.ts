// In /src/server/middleware/super-admin.ts
import { TRPCError } from "@trpc/server";
import { middleware } from "../api/trpc";
import { DefaultRoles } from "@/utils/permissions";

export const verifySuperAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const isSuperAdmin = ctx.session.user.roles?.includes(DefaultRoles.SUPER_ADMIN);
  
  if (!isSuperAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Super admin access required'
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user
    }
  });
});