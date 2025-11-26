import { supabase } from '../lib/supabase'

// ============================================
// SERVIÇO DE AUTENTICAÇÃO E USUÁRIOS
// ============================================

export const authService = {
  // Login
  async login(email, password) {
    try {
      console.log('🔐 Tentando login:', email)
      
      // Busca usuário por email
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('email', email)
        .eq('status', 'active')
        .single()

      if (error) throw new Error('Usuário não encontrado')
      if (!user) throw new Error('Email ou senha inválidos')

      // NOTA: Em produção, use hash bcrypt para validar senha
      // Por enquanto, comparação simples para desenvolvimento
      if (user.password_hash !== password) {
        throw new Error('Email ou senha inválidos')
      }

      // Verifica se empresa está ativa
      if (user.company && user.company.status !== 'active') {
        throw new Error('Empresa inativa')
      }

      console.log('✅ Login bem-sucedido:', user.name)
      return user
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  },

  // Registrar novo usuário
  async register(userData) {
    try {
      console.log('📝 Registrando usuário:', userData.email)

      // Verifica se email já existe
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle()

      if (existing) {
        throw new Error('Email já cadastrado')
      }

      // Mapear campos camelCase para snake_case
      const dbUser = {
        name: userData.name,
        email: userData.email,
        company_id: userData.companyId || userData.company_id,
        role: userData.role || 'user',
        status: 'active',
        password_hash: userData.password // Em produção, usar bcrypt
      }

      // Cria usuário
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([dbUser])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Usuário registrado:', newUser.name)
      return newUser
    } catch (error) {
      console.error('❌ Erro ao registrar:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇO DE USUÁRIOS (CRUD)
// ============================================

export const userService = {
  // Listar todos os usuários
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('📋 Usuários carregados:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      throw error
    }
  },

  // Buscar usuário por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error)
      throw error
    }
  },

  // Criar usuário
  async create(userData) {
    try {
      console.log('➕ Criando usuário:', userData.email)

      // Mapear campos camelCase para snake_case
      const dbUser = {
        name: userData.name,
        email: userData.email,
        company_id: userData.companyId || userData.company_id,
        role: userData.role || 'user',
        status: 'active',
        password_hash: userData.password || '123456' // Senha padrão
      }

      const { data, error } = await supabase
        .from('users')
        .insert([dbUser])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Usuário criado:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error)
      throw error
    }
  },

  // Atualizar usuário
  async update(id, updates) {
    try {
      console.log('📝 Atualizando usuário:', id)

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Usuário atualizado:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      throw error
    }
  },

  // Deletar usuário
  async delete(id) {
    try {
      console.log('🗑️ Deletando usuário:', id)

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('✅ Usuário deletado')
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error)
      throw error
    }
  },

  // Alternar status (ativo/inativo)
  async toggleStatus(id) {
    try {
      // Busca status atual
      const { data: user } = await supabase
        .from('users')
        .select('status')
        .eq('id', id)
        .single()

      const newStatus = user.status === 'active' ? 'inactive' : 'active'

      return await this.update(id, { status: newStatus })
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }
}

// ============================================
// SERVIÇO DE EMPRESAS (CRUD)
// ============================================

export const companyService = {
  // Listar todas as empresas
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('🏢 Empresas carregadas:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error)
      throw error
    }
  },

  // Buscar empresa por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar empresa:', error)
      throw error
    }
  },

  // Criar empresa
  async create(companyData) {
    try {
      console.log('➕ Criando empresa:', companyData.name)

      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          status: 'active'
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Empresa criada:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao criar empresa:', error)
      throw error
    }
  },

  // Atualizar empresa
  async update(id, updates) {
    try {
      console.log('📝 Atualizando empresa:', id)

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Empresa atualizada:', data.name)
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error)
      throw error
    }
  },

  // Deletar empresa
  async delete(id) {
    try {
      console.log('🗑️ Deletando empresa:', id)

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('✅ Empresa deletada')
    } catch (error) {
      console.error('❌ Erro ao deletar empresa:', error)
      throw error
    }
  },

  // Alternar status (ativo/inativo)
  async toggleStatus(id) {
    try {
      // Busca status atual
      const { data: company } = await supabase
        .from('companies')
        .select('status')
        .eq('id', id)
        .single()

      const newStatus = company.status === 'active' ? 'inactive' : 'active'

      return await this.update(id, { status: newStatus })
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }
}

export default {
  authService,
  userService,
  companyService
}
