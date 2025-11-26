import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

// Dados mock de usuários
const mockUsers = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@financeia.com',
    password: 'admin123',
    role: 'admin',
    companyId: null,
    active: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@empresa1.com',
    password: '123456',
    role: 'owner',
    companyId: '1',
    active: true,
    createdAt: new Date('2024-02-15').toISOString(),
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@empresa1.com',
    password: '123456',
    role: 'user',
    companyId: '1',
    active: true,
    createdAt: new Date('2024-03-10').toISOString(),
  },
]

// Dados mock de empresas
const mockCompanies = [
  {
    id: '1',
    name: 'Empresa Demo LTDA',
    cnpj: '12.345.678/0001-90',
    email: 'contato@empresa1.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    plan: 'premium',
    active: true,
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: '2',
    name: 'Tech Solutions SA',
    cnpj: '98.765.432/0001-10',
    email: 'contato@techsolutions.com',
    phone: '(21) 91234-5678',
    address: 'Av. Paulista, 1000',
    city: 'Rio de Janeiro',
    state: 'RJ',
    plan: 'basic',
    active: true,
    createdAt: new Date('2024-03-15').toISOString(),
  },
]

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(mockUsers)
  const [companies, setCompanies] = useState(mockCompanies)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento do usuário do localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simula autenticação
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Email ou senha inválidos')
    }

    if (!user.active) {
      throw new Error('Usuário inativo')
    }

    // Se for usuário de empresa, verifica se a empresa está ativa
    if (user.companyId) {
      const company = companies.find(c => c.id === user.companyId)
      if (!company || !company.active) {
        throw new Error('Empresa inativa')
      }
    }

    const userWithCompany = {
      ...user,
      company: user.companyId ? companies.find(c => c.id === user.companyId) : null
    }

    setCurrentUser(userWithCompany)
    localStorage.setItem('currentUser', JSON.stringify(userWithCompany))
    
    return userWithCompany
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const register = async (userData) => {
    // Verifica se email já existe
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email já cadastrado')
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      active: true,
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, newUser])
    return newUser
  }

  // Gestão de Usuários
  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    return newUser
  }

  const updateUser = (id, updates) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u))
  }

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id))
  }

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, active: !u.active } : u
    ))
  }

  // Gestão de Empresas
  const addCompany = (companyData) => {
    const newCompany = {
      ...companyData,
      id: Date.now().toString(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    setCompanies([...companies, newCompany])
    return newCompany
  }

  const updateCompany = (id, updates) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCompany = (id) => {
    // Remove empresa e seus usuários
    setCompanies(companies.filter(c => c.id !== id))
    setUsers(users.filter(u => u.companyId !== id))
  }

  const toggleCompanyStatus = (id) => {
    setCompanies(companies.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ))
  }

  // Verificações de permissão
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
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
