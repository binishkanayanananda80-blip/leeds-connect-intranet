import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import path from 'path'

const globalForPrisma = global as unknown as { prisma_v_leeds_v7_final: PrismaClient }

/**
 * Prisma 7 Initialization Strategy for Leeds ERP
 * Dynamically switches between SQLite (local) and PostgreSQL (Supabase) based on DATABASE_URL.
 */
function createPrismaClient() {
  try {
    const rawUrl = process.env.DATABASE_URL ?? 'file:./prisma/leeds_v2.db'
    
    if (rawUrl.startsWith('postgresql') || rawUrl.startsWith('postgres')) {
      console.log(`[ERP Governance] Initializing Leeds Client (v7 — Supabase PG)`)
      const pool = new Pool({ connectionString: rawUrl })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter })
    }

    // Default to SQLite
    const rawPath = rawUrl.replace('file:', '')
    const dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath)
    
    console.log(`[ERP Governance] Initializing Leeds Client (v7 — SQLite) — DB: ${path.basename(dbPath)}`)
    
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
    const client = new PrismaClient({ adapter })
    
    return client
  } catch (error) {
    console.error('[ERP Database] Critical: Native adapter initialization failed.', error)
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma_v_leeds_v7_final || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v_leeds_v7_final = prisma
