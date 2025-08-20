import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async register(email: string, username: string, password: string, name?: string) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        name,
      },
    });

    // For now, return a simple token structure
    // In a real implementation, this would generate a proper JWT
    const token = `token_${user.id}_${Date.now()}`;

    return { user, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // For now, return a simple token structure
    // In a real implementation, this would generate a proper JWT
    const token = `token_${user.id}_${Date.now()}`;

    return { user, token };
  }

  static async authenticate(token: string) {
    // For now, return null as token authentication is not implemented
    // This would need to be implemented with proper JWT or session token validation
    return null;
  }
}
