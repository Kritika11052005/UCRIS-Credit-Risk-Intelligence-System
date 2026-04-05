import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAuthPage = nextUrl.pathname.startsWith("/auth");

      if (isDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  providers: [], // Providers attached in auth.ts (Node environment)
} satisfies NextAuthConfig;
