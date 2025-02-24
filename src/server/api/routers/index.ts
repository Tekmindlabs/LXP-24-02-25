import { createTRPCRouter } from "../trpc";
import { campusRouter } from "./campus";
import { classRouter } from "./class";
import { classGroupRouter } from "./class-group";
import { subjectRouter } from "./subject";
import { permissionRouter } from "./permission";

export const appRouter = createTRPCRouter({
	campus: campusRouter,
	class: classRouter,
	classGroup: classGroupRouter,
	subject: subjectRouter,
  permission: permissionRouter,
});

export type AppRouter = typeof appRouter;
