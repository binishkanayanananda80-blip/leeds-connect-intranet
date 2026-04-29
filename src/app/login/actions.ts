'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendSms } from '@/lib/sms'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      employeeNo: formData.get('employeeNo'),
      password: formData.get('password'),
      redirectTo: '/intranet',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. Please check your Employee ID and password.'
        default:
          return 'Something went wrong. Please try again.'
      }
    }
    throw error
  }
}

export async function requestPasswordReset(employeeNo: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeNumber: employeeNo },
      include: { user: true }
    })

    if (!employee) {
      return { error: 'Employee not found.' }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes validity

    // Clear existing tokens
    await prisma.passwordResetToken.deleteMany({
      where: { employeeNumber: employeeNo }
    })

    await prisma.passwordResetToken.create({
      data: {
        employeeNumber: employeeNo,
        otp,
        expiresAt
      }
    })

    // ── FIND ADMINS TO NOTIFY ──
    const admins = await prisma.user.findMany({
      where: {
        role: {
          systemRole: {
            in: ['SUPER_ADMIN', 'MODULE_ADMIN', 'MODERATOR']
          }
        },
        isActive: true
      }
    })

    // ── CREATE NOTIFICATIONS FOR ADMINS ──
    const employeeName = `${employee.firstName} ${employee.lastName}`
    await Promise.all(admins.map(admin => 
      prisma.notification.create({
        data: {
          userId: admin.id,
          message: `🔐 Password Reset: OTP for ${employeeName} (${employeeNo}) is ${otp}. Valid for 5 mins.`,
          link: '/admin/employee'
        }
      })
    ))

    /* ── SMS INTEGRATION (DISABLED PER USER REQUEST) ──
    const mobileNumber = employee.mobileNumber
    if (mobileNumber) {
      const message = `Your Leeds Connect verification code is: ${otp}. Valid for 5 minutes.`
      await sendSms(mobileNumber, message)
    }
    */
    
    return { 
      success: true, 
      message: `A reset request has been sent. Please contact your Supervisor, Moderator, or System Administrator to receive your 6-digit verification code.`
    } 
  } catch (err) {
    console.error(err)
    return { error: 'Failed to request reset. Please try again or contact IT.' }
  }
}

export async function verifyOtp(employeeNo: string, otp: string) {
  try {
    const token = await prisma.passwordResetToken.findFirst({
      where: { 
        employeeNumber: employeeNo,
        otp,
        expiresAt: { gt: new Date() }
      }
    })

    if (!token) {
      return { error: 'Invalid or expired OTP.' }
    }

    return { success: true }
  } catch (err) {
    return { error: 'Verification failed.' }
  }
}

export async function resetPassword(employeeNo: string, otp: string, newPassword: string) {
  try {
    // Re-verify token
    const token = await prisma.passwordResetToken.findFirst({
      where: { 
        employeeNumber: employeeNo,
        otp,
        expiresAt: { gt: new Date() }
      }
    })

    if (!token) {
      return { error: 'Verification expired. Please restart.' }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction([
      prisma.employee.update({
        where: { employeeNumber: employeeNo },
        data: { 
          passwordHash,
          passwordChanged: true
        }
      }),
      prisma.passwordResetToken.delete({
        where: { id: token.id }
      })
    ])

    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Failed to reset password.' }
  }
}
