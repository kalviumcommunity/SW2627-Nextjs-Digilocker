import Google from "next-auth/providers/google";
import { findOrCreateGoogleUser, normalizeEmail } from "./lib/auth.js";

/**
 * Auth.js (NextAuth v5) Configuration
 * Defines Google OAuth provider, JWT session strategy, and authentication callbacks.
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "local-development-auth-secret",
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = normalizeEmail(user?.email || profile?.email);
        if (!email) {
          return false;
        }

        // Map and persist OAuth identity to the application user store
        findOrCreateGoogleUser({
          id: user?.id || profile?.sub,
          email,
          name: user?.name || profile?.name,
          image: user?.image || profile?.picture,
        });
      }
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.userId = user.id || profile?.sub || token.sub;
        token.email = user.email || profile?.email || token.email;
        token.name = user.name || profile?.name || token.name;
      }
      // Never store raw OAuth tokens, access tokens, refresh tokens, or provider secrets in JWT
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.userId || token.sub;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      // Minimal safe session payload: id, name, email
      return session;
    },
  },
};
