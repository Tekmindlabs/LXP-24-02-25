import { academicCalendarRouter } from "./routers/academic-calendar";
import { createTRPCRouter } from "./trpc";
import { activityRouter } from "./routers/activity";
import { curriculumRouter } from "./routers/curriculum";
import { classRouter } from "./routers/class";
import { classGroupRouter } from "./routers/class-group";
import { subjectRouter } from "./routers/subject";
import { campusRouter } from "./routers/campus";
import { programRouter } from "./routers/program";
import { calendarRouter } from "./routers/calendar";
import { studentRouter } from "./routers/student";
import { teacherRouter } from "./routers/teacher";
import { workspaceRouter } from "./routers/workspace";
import { campusRolePermissionRouter } from "./routers/campus-role-permission";
import { roleRouter } from "./routers/role";
import { coordinatorRouter } from "./routers/coordinator";

export const appRouter = createTRPCRouter({
  academicCalendar: academicCalendarRouter,
  campusRolePermission: campusRolePermissionRouter,
  role: roleRouter,
  activity: activityRouter,
  curriculum: curriculumRouter,
  class: classRouter,
  classGroup: classGroupRouter,
  subject: subjectRouter,
  campus: campusRouter,
  program: programRouter,
  calendar: calendarRouter,
  student: studentRouter,
  teacher: teacherRouter,
  workspace: workspaceRouter,
  coordinator: coordinatorRouter,
});

export type AppRouter = typeof appRouter;
