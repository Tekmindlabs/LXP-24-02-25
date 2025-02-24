import { DefaultSession } from "next-auth"
import { DefaultRoles } from '@/utils/permissions';


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      roles: string[]
      permissions: string[]
    } & DefaultSession["user"]
  }
}
