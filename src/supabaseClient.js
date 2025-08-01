// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing environment variable REACT_APP_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing environment variable REACT_APP_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
