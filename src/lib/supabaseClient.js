import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://invodjsmbhipvxpgfjdw.supabase.co'
const supabaseKey = 'sb_publishable_Q74ppPFasi_4O2loNpMmBw_arknpDcx'

export const supabase = createClient(supabaseUrl, supabaseKey)
