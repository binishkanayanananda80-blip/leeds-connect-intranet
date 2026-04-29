import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fzwtkpncwpssieqbjija.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Storage uploads will fail in production.')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey || '')
