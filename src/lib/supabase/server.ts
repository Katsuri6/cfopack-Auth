import { createClient as create } from '@supabase/supabase-js'

const URL = 'https://ejeyfkaaignwpnmjkozf.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZXlma2Fhamdud3BubWprb3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MjE5MDksImV4cCI6MjA5NDk5NzkwOX0.B5M1T3qdZcvRuNID2baPH_1tCbtzKKt0blvyrVCaZnA'

export function createClient() {
  return create(URL, KEY)
}