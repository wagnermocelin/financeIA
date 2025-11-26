import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Credenciais do Supabase não configuradas!')
  console.error('Crie o arquivo .env com:')
  console.error('VITE_SUPABASE_URL=sua_url_aqui')
  console.error('VITE_SUPABASE_ANON_KEY=sua_chave_aqui')
}

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper para verificar conexão
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase conectado com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message)
    return false
  }
}

// Helper para obter empresa do usuário atual
export const getCurrentUserCompany = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('company_id, companies(*)')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data?.companies
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    return null
  }
}
