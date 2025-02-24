import { createTRPCRouter, protectedProcedure } from "../trpc";

export const permissionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.permission.findMany();
  }),
});
