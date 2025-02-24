import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";



declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: string[];
    permissions: string[];
  }

  interface JWT {
    id: string;
    roles: string[];
    permissions: string[];
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        // Get user's roles and permissions from database
        const userWithRoles = await prisma.user.findUnique({
          where: { id: user.id },
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

        const roles = userWithRoles?.userRoles.map(ur => ur.role.name) || [];
        const permissions = userWithRoles?.userRoles.flatMap(
          userRole => userRole.role.permissions.map(rp => rp.permission.name)
        ) || [];

        console.log('JWT callback:', { roles, permissions });

        token.id = user.id;
        token.roles = roles;
        token.permissions = permissions;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          roles: (token.roles as string[]) || [],
          permissions: (token.permissions as string[]) || [],
        };

        console.log('Session callback:', {
          roles: session.user.roles,
          permissions: session.user.permissions
        });
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // If the url is a relative url, append it to the base url
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If the url is already an absolute url, return it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
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
      
      if (!user || !user.password) {
        throw new Error("Invalid credentials");
      }
      
      const isValid = await bcrypt.compare(credentials.password, user.password);
      
      if (!isValid) {
        throw new Error("Invalid credentials");
      }
      
      // Extract roles and permissions
      const roles = user.userRoles.map(ur => ur.role.name);
      const permissions = user.userRoles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      );

      console.log('Auth - User roles and permissions:', { roles, permissions });
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions
      };
      },
    }),

  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export const getServerAuthSession = async () => {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};



