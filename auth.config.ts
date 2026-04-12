import type { NextAuthConfig } from "next-auth"

// Edge-safe config: no Prisma, no bcrypt.
// Used by proxy.ts (Edge runtime) and spread into auth.ts (Node.js runtime).
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
}
