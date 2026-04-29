'use client'

import { signOut } from 'next-auth/react'
import { ReactNode } from 'react'

interface LogoutButtonProps {
  children: ReactNode
  className?: string
}

export function LogoutButton({ children, className }: LogoutButtonProps) {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={className}
    >
      {children}
    </button>
  )
}
