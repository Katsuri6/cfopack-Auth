import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xgfhumfwinvsvqqhzhoa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZmh1bWZ3aW52c3ZxcWh6aG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDIwMzYsImV4cCI6MjA5NTQxODAzNn0.iPms8GJXP7SYA_jad6f3OEFgSdLQ73gELUSUeMucioY'

let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (client) return client
  client = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  })
  return client
}