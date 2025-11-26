import { createContext, useContext, useState, useEffect } from 'react'
import { authService, userService, companyService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  // Carrega dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      console.log('🔄 Carregando dados iniciais...')
      
      // Carrega usuário do localStorage
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        console.log('👤 Usuário restaurado:', user.name)
      }

      // Carrega usuários e empresas do Supabase
      const [usersData, companiesData] = await Promise.all([
        userService.getAll(),
        companyService.getAll()
      ])

      setUsers(usersData)
      setCompanies(companiesData)
      
      console.log('✅ Dados carregados:', {
        users: usersData.length,
        companies: companiesData.length
      })
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  const login = async (email, password) => {
    try {
      console.log('🔐 Fazendo login...')
      const user = await authService.login(email, password)
      
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      
      console.log('✅ Login bem-sucedido:', user.name)
      return user
    } catch (error) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  }

  const logout = () => {
    console.log('👋 Fazendo logout...')
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const register = async (userData) => {
    try {
      console.log('📝 Registrando novo usuário...')
      const newUser = await authService.register(userData)
      
      // Atualiza lista de usuários
      await refreshUsers()
      
      return newUser
    } catch (error) {
      console.error('❌ Erro ao registrar:', error)
      throw error
    }
  }

  // ============================================
  // GESTÃO DE USUÁRIOS
  // ============================================

  const refreshUsers = async () => {
    try {
      const usersData = await userService.getAll()
      setUsers(usersData)
    } catch (error) {
      console.error('❌ Erro ao atualizar usuários:', error)
    }
  }

  const addUser = async (userData) => {
    try {
      console.log('➕ Adicionando usuário...')
      const newUser = await userService.create(userData)
      
      // Atualiza lista
      await refreshUsers()
      
      return newUser
    } catch (error) {
      console.error('❌ Erro ao adicionar usuário:', error)
      throw error
    }
  }

  const updateUser = async (id, updates) => {
    try {
      console.log('📝 Atualizando usuário...')
      const updatedUser = await userService.update(id, updates)
      
      // Atualiza lista
      await refreshUsers()
      
      // Se for o usuário atual, atualiza também
      if (currentUser?.id === id) {
        const updated = { ...currentUser, ...updates }
        setCurrentUser(updated)
        localStorage.setItem('currentUser', JSON.stringify(updated))
      }
      
      return updatedUser
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      throw error
    }
  }

  const deleteUser = async (id) => {
    try {
      console.log('🗑️ Deletando usuário...')
      await userService.delete(id)
      
      // Atualiza lista
      await refreshUsers()
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error)
      throw error
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      console.log('🔄 Alternando status do usuário...')
      await userService.toggleStatus(id)
      
      // Atualiza lista
      await refreshUsers()
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }

  // ============================================
  // GESTÃO DE EMPRESAS
  // ============================================

  const refreshCompanies = async () => {
    try {
      const companiesData = await companyService.getAll()
      setCompanies(companiesData)
    } catch (error) {
      console.error('❌ Erro ao atualizar empresas:', error)
    }
  }

  const addCompany = async (companyData) => {
    try {
      console.log('➕ Adicionando empresa...')
      const newCompany = await companyService.create(companyData)
      
      // Atualiza lista
      await refreshCompanies()
      
      return newCompany
    } catch (error) {
      console.error('❌ Erro ao adicionar empresa:', error)
      throw error
    }
  }

  const updateCompany = async (id, updates) => {
    try {
      console.log('📝 Atualizando empresa...')
      const updatedCompany = await companyService.update(id, updates)
      
      // Atualiza lista
      await refreshCompanies()
      
      return updatedCompany
    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error)
      throw error
    }
  }

  const deleteCompany = async (id) => {
    try {
      console.log('🗑️ Deletando empresa...')
      await companyService.delete(id)
      
      // Atualiza listas
      await Promise.all([
        refreshCompanies(),
        refreshUsers() // Usuários da empresa também são deletados
      ])
    } catch (error) {
      console.error('❌ Erro ao deletar empresa:', error)
      throw error
    }
  }

  const toggleCompanyStatus = async (id) => {
    try {
      console.log('🔄 Alternando status da empresa...')
      await companyService.toggleStatus(id)
      
      // Atualiza lista
      await refreshCompanies()
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }

  // ============================================
  // VERIFICAÇÕES DE PERMISSÃO
  // ============================================

  const isAdmin = () => currentUser?.role === 'admin'
  const isOwner = () => currentUser?.role === 'owner'
  const canManageUsers = () => isAdmin() || isOwner()
  const canManageCompanies = () => isAdmin()

  const value = {
    currentUser,
    users,
    companies,
    loading,
    login,
    logout,
    register,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    addCompany,
    updateCompany,
    deleteCompany,
    toggleCompanyStatus,
    isAdmin,
    isOwner,
    canManageUsers,
    canManageCompanies,
    refreshUsers,
    refreshCompanies,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
