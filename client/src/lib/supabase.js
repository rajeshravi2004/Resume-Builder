import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const loadCloudWorkspace = async userId => {
  if (!supabase || !userId) return null
  const { data, error } = await supabase.from('workspaces').select('data, updated_at').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export const saveCloudWorkspace = async (userId, workspace) => {
  if (!supabase || !userId) return
  const { error } = await supabase.from('workspaces').upsert({ user_id: userId, data: workspace, updated_at: new Date().toISOString() })
  if (error) throw error
}

export const getAdminStatus = async () => {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return Boolean(data)
}
