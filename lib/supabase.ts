import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mcszblorbvhgeitzgdep.supabase.co'
const supabaseKey = 'sb_publishable_Y-48kUQYSDVf9a57jguP1Q_0I3zyIs1'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'repfuel-auth',
  },
})