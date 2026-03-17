import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://backend:3000";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const res = await fetch(`${INTERNAL_API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return { id: String(data.user_id), email: String(credentials.email), apiToken: data.token };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.apiToken = (user as { apiToken: string }).apiToken;
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      (session as { apiToken?: string }).apiToken = token.apiToken as string;
      (session.user as { id?: string }).id = token.userId as string;
      return session;
    },
  },
});
