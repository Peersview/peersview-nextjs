import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas/auth.schema";
import { validateCredentials } from "@/services/auth.service";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "employer";
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "user" | "employer";
    firstName?: string;
    lastName?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const result = await validateCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (result.kind === "invalid") return null;
        if (result.kind === "unverified") {
          // Surface a recognizable message; NextAuth turns thrown errors
          // into a `CredentialsSignin` error code on the client. The
          // SignInForm uses a separate `checkEmailVerificationAction`
          // call to detect this case after a generic failure.
          return null;
        }

        const user = result.user;
        return {
          id: user._id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as {
        id?: string;
        role?: "user" | "employer";
        firstName?: string;
        lastName?: string;
      };
      if (t.id) {
        session.user.id = t.id;
        session.user.role = t.role ?? "user";
        session.user.firstName = t.firstName ?? "";
        session.user.lastName = t.lastName ?? "";
      }
      return session;
    },
  },
});
