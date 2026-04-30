import type { NextAuthConfig } from 'next-auth';

const secret = process.env.AUTH_SECRET ?? 'super-secret-leeds-connect-key-for-dev-only';

export const authConfig = {
  trustHost: true,
  secret,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = [
        '/',
        '/intranet',
        '/intranet/announcements', '/intranet/directory', '/intranet/knowledge', '/intranet/welfare',
        '/intranet/birthday-wall', '/intranet/celebrations', '/intranet/leadership',
        '/admin', '/settings', '/menu', '/force-change-password',
      ];
      const isOnDashboard = protectedPaths.some(
        (p) => nextUrl.pathname === p || (p !== '/' && nextUrl.pathname.startsWith(p))
      );

      if (isOnDashboard) {
        if (!isLoggedIn) return false; // Redirect unauthenticated away
        
        // Check for forced password change
        const isForced = !!(auth as any)?.user?.forcePasswordChange;
        
        if (isForced && nextUrl.pathname !== '/force-change-password' && !nextUrl.pathname.startsWith('/api')) {
          return Response.redirect(new URL('/force-change-password', nextUrl));
        }
        if (!isForced && nextUrl.pathname === '/force-change-password') {
          return Response.redirect(new URL('/intranet', nextUrl)); // Redirect away if not forced
        }
        
        return true;
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/intranet', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).organizationId = token.organizationId as string;
        (session.user as any).roleId = token.roleId as string;
        (session.user as any).roleName = token.roleName as string;
        (session.user as any).branchId = token.branchId as string;
        (session.user as any).forcePasswordChange = token.forcePasswordChange as boolean;
        (session.user as any).employeeCategory = token.employeeCategory as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.organizationId = (user as any).organizationId;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
        token.branchId = (user as any).branchId;
        token.forcePasswordChange = (user as any).forcePasswordChange;
        token.employeeCategory = (user as any).employeeCategory;
      }
      if (trigger === "update" && session?.forcePasswordChange !== undefined) {
        token.forcePasswordChange = session.forcePasswordChange;
      }
      return token;
    }
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
