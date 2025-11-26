import { supabase } from '../lib/supabase'

// ============================================
// TRANSACTIONS (Transações)
// ============================================

export const transactionService = {
  // Buscar todas as transações da empresa
  async getAll(companyId) {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    // Filtra por company_id apenas se existir (produção)
    // Em desenvolvimento, carrega todas
    if (companyId && typeof companyId === 'string' && companyId.length > 10) {
      query = query.eq('company_id', companyId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Criar nova transação
  async create(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar transação
  async update(id, updates) {
    console.log('🔧 transactionService.update chamado:', { id, updates })
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro no Supabase:', error)
      throw error
    }
    
    console.log('✅ Supabase retornou:', data)
    return data
  },

  // Deletar transação
  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Buscar por período
  async getByPeriod(companyId, startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }
}

// ============================================
// BUDGETS (Orçamentos)
// ============================================

export const budgetService = {
  // Buscar todos os orçamentos
  async getAll(companyId) {
    let query = supabase
      .from('budgets')
      .select('*')
    
    // Filtra por company_id apenas se existir (produção)
    if (companyId && typeof companyId === 'string' && companyId.length > 10) {
      query = query.eq('company_id', companyId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Criar orçamento
  async create(budget) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([budget])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar orçamento
  async update(id, updates) {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deletar orçamento
  async delete(id) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Buscar status dos orçamentos (usando view)
  async getStatus(companyId) {
    const { data, error } = await supabase
      .from('budget_status')
      .select('*')
      .eq('company_id', companyId)

    if (error) throw error
    return data
  }
}

// ============================================
// BANK STATEMENTS (Extratos Bancários)
// ============================================

export const bankStatementService = {
  // Buscar todos os extratos
  async getAll(companyId) {
    let query = supabase
      .from('bank_statements')
      .select('*')
      .order('date', { ascending: false })
    
    // Filtra por company_id apenas se existir (produção)
    if (companyId && typeof companyId === 'string' && companyId.length > 10) {
      query = query.eq('company_id', companyId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Criar extrato (com verificação de duplicata)
  async create(statement) {
    // Verifica se já existe pelo hash_key
    if (statement.hash_key) {
      const { data: existing, error: checkError } = await supabase
        .from('bank_statements')
        .select('id')
        .eq('hash_key', statement.hash_key)
        .maybeSingle() // Usa maybeSingle() ao invés de single()
      
      if (existing) {
        console.log(`⚠️ Extrato duplicado ignorado: ${statement.description}`)
        return existing // Retorna o existente
      }
    }

    const { data, error } = await supabase
      .from('bank_statements')
      .insert([statement])
      .select()
      .single()

    if (error) {
      // Se erro de duplicata (unique constraint), ignora
      if (error.code === '23505') {
        console.log(`⚠️ Extrato duplicado (constraint): ${statement.description}`)
        return null
      }
      throw error
    }
    return data
  },

  // Criar múltiplos extratos (importação em lote) - com verificação de duplicatas
  async createBatch(statements) {
    const newStatements = []
    const duplicates = []

    // Verifica duplicatas antes de inserir
    for (const statement of statements) {
      if (statement.hash_key) {
        const { data: existing, error: checkError } = await supabase
          .from('bank_statements')
          .select('id')
          .eq('hash_key', statement.hash_key)
          .maybeSingle() // Usa maybeSingle() ao invés de single()
        
        if (existing) {
          duplicates.push(statement.description)
          continue
        }
      }
      newStatements.push(statement)
    }

    console.log(`📊 Importação: ${newStatements.length} novos, ${duplicates.length} duplicados`)
    
    if (newStatements.length === 0) {
      console.log('⚠️ Todos os extratos já existem no banco')
      return []
    }

    const { data, error } = await supabase
      .from('bank_statements')
      .insert(newStatements)
      .select()

    if (error) throw error
    return data
  },

  // Atualizar extrato
  async update(id, updates) {
    const { data, error } = await supabase
      .from('bank_statements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Conciliar extrato com transação
  async reconcile(statementId, transactionId) {
    const { data, error } = await supabase
      .from('bank_statements')
      .update({ 
        reconciled: true, 
        transaction_id: transactionId 
      })
      .eq('id', statementId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ============================================
// CATEGORIES (Categorias)
// ============================================

export const categoryService = {
  // Buscar todas as categorias
  async getAll(companyId) {
    let query = supabase
      .from('categories')
      .select('*')
    
    // Filtra por company_id apenas se existir (produção)
    if (companyId && typeof companyId === 'string' && companyId.length > 10) {
      query = query.eq('company_id', companyId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Criar categoria
  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar categoria
  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deletar categoria
  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// ============================================
// COMPANIES (Empresas)
// ============================================

export const companyService = {
  // Buscar todas as empresas
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  // Buscar empresa por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar empresa
  async create(company) {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar empresa
  async update(id, updates) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deletar empresa
  async delete(id) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// ============================================
// USERS (Usuários)
// ============================================

export const userService = {
  // Buscar todos os usuários
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*, companies(name)')
      .order('name')

    if (error) throw error
    return data
  },

  // Buscar usuários por empresa
  async getByCompany(companyId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('name')

    if (error) throw error
    return data
  },

  // Buscar usuário por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*, companies(name)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Criar usuário
  async create(user) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar usuário
  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Deletar usuário
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

// ============================================
// NFE INVOICES (Notas Fiscais)
// ============================================

export const nfeService = {
  // Buscar todas as NF-e
  async getAll(companyId) {
    const { data, error } = await supabase
      .from('nfe_invoices')
      .select('*')
      .eq('company_id', companyId)
      .order('issue_date', { ascending: false })

    if (error) throw error
    return data
  },

  // Buscar NF-e por chave de acesso
  async getByAccessKey(accessKey) {
    const { data, error } = await supabase
      .from('nfe_invoices')
      .select('*')
      .eq('access_key', accessKey)
      .single()

    if (error) throw error
    return data
  },

  // Criar NF-e
  async create(invoice) {
    const { data, error } = await supabase
      .from('nfe_invoices')
      .insert([invoice])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Atualizar NF-e
  async update(id, updates) {
    const { data, error } = await supabase
      .from('nfe_invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ============================================
// FINANCIAL SUMMARY (Resumo Financeiro)
// ============================================

export const financialService = {
  // Buscar resumo financeiro (usando view)
  async getSummary(companyId, startDate, endDate) {
    let query = supabase
      .from('financial_summary')
      .select('*')
      .eq('company_id', companyId)

    if (startDate) {
      query = query.gte('month', startDate)
    }
    if (endDate) {
      query = query.lte('month', endDate)
    }

    const { data, error } = await query.order('month', { ascending: false })

    if (error) throw error
    return data
  }
}
