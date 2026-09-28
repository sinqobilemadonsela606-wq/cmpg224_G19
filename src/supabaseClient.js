import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://puburneumanamxczkugg.supabase.co'
const supabaseAnonKey = 'sb_publishable_5AlplBuBfhD_Q5_UGwDbWw_RNmg5HQJ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)