import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getRepository } from "@/lib/repositories";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Employee ID",
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
      },
      async authorize(credentials) {
        const employeeId = credentials?.employeeId as string | undefined;
        if (!employeeId) return null;

        const repository = getRepository();
        const [admins, evaluators] = await Promise.all([
          repository.getUsers(),
          repository.getEvaluators(),
        ]);
        const user = [...admins, ...evaluators].find(
          (u) =>
            u.employeeId.toLowerCase() === employeeId.toLowerCase() &&
            u.status !== "Inactive",
        );
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.employeeId = (user as { employeeId?: string }).employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role as string,
          employeeId: token.employeeId as string,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Bound session replay and avoid keeping privileged sessions alive forever.
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
});
