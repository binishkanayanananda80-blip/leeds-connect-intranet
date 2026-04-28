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
      where: { employeeNumber: employeeNo }
    })

    if (!employee) {
      return { error: 'Employee not found.' }
    }

    const mobileNumber = employee.mobileNumber
    if (!mobileNumber) {
      return { error: 'No mobile number associated with this account. Please contact HR.' }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

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

    // ── SMS INTEGRATION ──
    const message = `Your Leeds Connect verification code is: ${otp}. Valid for 15 minutes.`
    const smsResult = await sendSms(mobileNumber, message)
    
    if (!smsResult.success && !smsResult.simulated) {
      // If a real gateway fails, we let the user know
      return { error: 'Failed to send SMS. Please try again later.' }
    }
    
    // We return success without the OTP to keep it secure
    return { 
      success: true, 
      message: `A verification code has been sent to your registered mobile: ${mobileNumber.slice(0, 3)}****${mobileNumber.slice(-2)}`
    } 
  } catch (err) {
    console.error(err)
    return { error: 'Failed to request reset.' }
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
