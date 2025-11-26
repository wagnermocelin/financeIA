import { supabase, checkConnection } from '../lib/supabase'

// Teste de conexão com Supabase
export const testSupabaseConnection = async () => {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // 1. Verificar configuração
    console.log('📋 Verificando configuração...')
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.error('❌ Credenciais não configuradas!')
      return false
    }
    
    console.log('✅ URL configurada:', url)
    console.log('✅ Anon key configurada:', key.substring(0, 20) + '...')
    
    // 2. Testar conexão
    console.log('\n🔌 Testando conexão...')
    const isConnected = await checkConnection()
    
    if (!isConnected) {
      console.error('❌ Falha na conexão com Supabase')
      return false
    }
    
    // 3. Listar tabelas
    console.log('\n📊 Verificando tabelas...')
    const tables = ['companies', 'users', 'categories', 'transactions', 'budgets', 'bank_statements', 'nfe_invoices']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.error(`❌ Tabela ${table}: ${error.message}`)
        } else {
          console.log(`✅ Tabela ${table}: OK`)
        }
      } catch (err) {
        console.error(`❌ Erro ao verificar tabela ${table}:`, err.message)
      }
    }
    
    // 4. Verificar dados iniciais
    console.log('\n📦 Verificando dados iniciais...')
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError.message)
    } else {
      console.log(`✅ Empresas encontradas: ${companies?.length || 0}`)
      if (companies && companies.length > 0) {
        console.log('   Empresas:', companies.map(c => c.name).join(', '))
      }
    }
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
    
    if (categoriesError) {
      console.error('❌ Erro ao buscar categorias:', categoriesError.message)
    } else {
      console.log(`✅ Categorias encontradas: ${categories?.length || 0}`)
      if (categories && categories.length > 0) {
        console.log('   Categorias:', categories.map(c => c.name).join(', '))
      }
    }
    
    console.log('\n✅ Teste de conexão concluído com sucesso!')
    return true
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    return false
  }
}

// Executar teste automaticamente em desenvolvimento
if (import.meta.env.DEV) {
  testSupabaseConnection()
}
