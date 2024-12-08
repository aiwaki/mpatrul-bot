import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    `https://${process.env.SUPABASE_URL}.supabase.co`,
    process.env.SUPABASE_KEY as string
)