import { supabase } from '../lib/supabase'

// ============================================
// SERVIÇO DE CONTAS BANCÁRIAS
// ============================================

export const bankAccountService = {
  // Listar todas as contas
  async getAll(companyId) {
    try {
      let query = supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (companyId && typeof companyId === 'string' && companyId.length > 10) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) throw error
      console.log('🏦 Contas bancárias carregadas:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar contas:', error)
      throw error
    }
  },

  // Criar conta
  async create(accountData) {
    try {
      console.log('➕ Criando conta bancária:', accountData.name)

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{
          ...accountData,
          active: true
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Conta criada:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error)
      throw error
    }
  },

  // Atualizar conta
  async update(id, updates) {
    try {
      console.log('📝 Atualizando conta:', id)

      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Conta atualizada:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar conta:', error)
      throw error
    }
  },

  // Deletar conta
  async delete(id) {
    try {
      console.log('🗑️ Deletando conta:', id)

      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('✅ Conta deletada')
    } catch (error) {
      console.error('❌ Erro ao deletar conta:', error)
      throw error
    }
  },

  // Alternar status
  async toggleStatus(id) {
    try {
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('active')
        .eq('id', id)
        .single()

      return await this.update(id, { active: !account.active })
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇO DE CARTÕES DE CRÉDITO
// ============================================

export const creditCardService = {
  // Listar todos os cartões
  async getAll(companyId) {
    try {
      let query = supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (companyId && typeof companyId === 'string' && companyId.length > 10) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) throw error
      console.log('💳 Cartões carregados:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar cartões:', error)
      throw error
    }
  },

  // Criar cartão
  async create(cardData) {
    try {
      console.log('➕ Criando cartão:', cardData.name)

      // Mapear campos camelCase para snake_case
      const dbCard = {
        name: cardData.name,
        bank: cardData.bank,
        last_digits: cardData.lastDigits || cardData.last_digits,
        brand: cardData.brand,
        credit_limit: cardData.limit || cardData.credit_limit,
        used_limit: cardData.usedLimit || cardData.used_limit || 0,
        closing_day: cardData.closingDay || cardData.closing_day,
        due_day: cardData.dueDay || cardData.due_day,
        company_id: cardData.company_id,
        active: true
      }

      const { data, error } = await supabase
        .from('credit_cards')
        .insert([dbCard])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Cartão criado:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao criar cartão:', error)
      throw error
    }
  },

  // Atualizar cartão
  async update(id, updates) {
    try {
      console.log('📝 Atualizando cartão:', id)

      const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Cartão atualizado:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar cartão:', error)
      throw error
    }
  },

  // Deletar cartão
  async delete(id) {
    try {
      console.log('🗑️ Deletando cartão:', id)

      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('✅ Cartão deletado')
    } catch (error) {
      console.error('❌ Erro ao deletar cartão:', error)
      throw error
    }
  },

  // Alternar status
  async toggleStatus(id) {
    try {
      const { data: card } = await supabase
        .from('credit_cards')
        .select('active')
        .eq('id', id)
        .single()

      return await this.update(id, { active: !card.active })
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇO DE FORNECEDORES
// ============================================

export const supplierService = {
  // Listar todos os fornecedores
  async getAll(companyId) {
    try {
      let query = supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })

      if (companyId && typeof companyId === 'string' && companyId.length > 10) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query

      if (error) throw error
      console.log('📦 Fornecedores carregados:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar fornecedores:', error)
      throw error
    }
  },

  // Criar fornecedor
  async create(supplierData) {
    try {
      console.log('➕ Criando fornecedor:', supplierData.name)

      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          ...supplierData,
          active: true
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Fornecedor criado:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao criar fornecedor:', error)
      throw error
    }
  },

  // Atualizar fornecedor
  async update(id, updates) {
    try {
      console.log('📝 Atualizando fornecedor:', id)

      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Fornecedor atualizado:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar fornecedor:', error)
      throw error
    }
  },

  // Deletar fornecedor
  async delete(id) {
    try {
      console.log('🗑️ Deletando fornecedor:', id)

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('✅ Fornecedor deletado')
    } catch (error) {
      console.error('❌ Erro ao deletar fornecedor:', error)
      throw error
    }
  },

  // Alternar status
  async toggleStatus(id) {
    try {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('active')
        .eq('id', id)
        .single()

      return await this.update(id, { active: !supplier.active })
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }
}

export default {
  bankAccountService,
  creditCardService,
  supplierService
}
