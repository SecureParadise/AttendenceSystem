// app/api/auth/[...nextauth]/route.ts

import CredentialsProvider from "next-auth/providers/credentials";

import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

// small helper type: we know our credentials
type Credentials = {
  email: string;
  password: string;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(dbConnect as any),
  session: {
    strategy: "jwt", // no sessions table, lighter
  },
  pages: {
    signIn: "/login", // use your custom login page
  },
  
  providers: [
    CredentialsProvider({
      name: "Campus Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // 1) Basic check
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        // 2) Find user by email
        const user = await dbConnect.user.findUnique({
          where: { email },
        });

        // If no user, return null => next-auth will treat as invalid login
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // 3) Check password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // 4) Check email verified
        if (!user.isEmailVerified) {
          // Throw special message so UI can redirect to verify page
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // 5) Check active flag
        if (!user.isActive) {
          throw new Error("Your account is deactivated. Contact admin.");
        }

        // 6) Return safe user object (no passwordHash)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
        };
      },
    }),
  ],
  callbacks: {
    // Add custom fields to JWT
    async jwt({ token, user }) {
      // user is only available on first login
      if (user) {
        token.role = (user as any).role;
        token.isProfileComplete = (user as any).isProfileComplete;
      }
      return token;
    },
    // Make them available in session
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.isProfileComplete = token.isProfileComplete as
          | boolean
          | undefined;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
