import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        employeeNo: { label: 'Employee No', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null
        if (!credentials?.employeeNo) return null

        try {
          // Look up by Employee table
          const employee = await prisma.employee.findUnique({
            where: { employeeNumber: credentials.employeeNo as string },
            include: { user: { include: { role: true, organization: true } } }
          })

          if (!employee || !employee.passwordHash) return null

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            employee.passwordHash,
          )

          if (!passwordsMatch) return null

          const user = employee.user
          if (!user) return null

          return {
            id: user.id,
            email: user.email,
            name: `${employee.firstName} ${employee.lastName}`,
            image: user.image,
            roleId: employee.roleId,
            roleName: user.role?.name,
            organizationId: user.organizationId,
            branchId: employee.branchId,
            forcePasswordChange: !employee.passwordChanged,
            employeeCategoryId: employee.categoryId,
            employeeNumber: employee.employeeNumber,
          }
        } catch (error) {
          console.error('[Auth] Authorization error:', error)
          return null
        }
      },
    }),
  ],
})
