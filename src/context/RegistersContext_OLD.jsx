import { createContext, useContext, useState, useEffect } from 'react'

const RegistersContext = createContext()

export const useRegisters = () => {
  const context = useContext(RegistersContext)
  if (!context) {
    throw new Error('useRegisters deve ser usado dentro de RegistersProvider')
  }
  return context
}

// Dados mock de contas bancárias
const mockBankAccounts = [
  {
    id: '1',
    name: 'Conta Corrente Principal',
    bank: 'Banco do Brasil',
    agency: '1234-5',
    account: '12345-6',
    type: 'checking',
    balance: 50000,
    active: true,
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Conta Poupança',
    bank: 'Caixa Econômica',
    agency: '5678-9',
    account: '98765-4',
    type: 'savings',
    balance: 25000,
    active: true,
    createdAt: new Date('2024-02-20').toISOString(),
  },
]

// Dados mock de cartões de crédito
const mockCreditCards = [
  {
    id: '1',
    name: 'Cartão Empresarial',
    bank: 'Banco do Brasil',
    lastDigits: '1234',
    brand: 'Visa',
    limit: 50000,
    usedLimit: 15000,
    closingDay: 10,
    dueDay: 20,
    active: true,
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '2',
    name: 'Cartão Corporativo',
    bank: 'Itaú',
    lastDigits: '5678',
    brand: 'Mastercard',
    limit: 30000,
    usedLimit: 8500,
    closingDay: 15,
    dueDay: 25,
    active: true,
    createdAt: new Date('2024-03-05').toISOString(),
  },
]

// Dados mock de fornecedores
const mockSuppliers = [
  {
    id: '1',
    name: 'Fornecedor ABC Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@fornecedorabc.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Indústrias, 100',
    city: 'São Paulo',
    state: 'SP',
    category: 'Materiais',
    paymentTerms: '30 dias',
    active: true,
    createdAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '2',
    name: 'Tech Solutions Fornecimentos',
    cnpj: '98.765.432/0001-10',
    email: 'vendas@techsolutions.com',
    phone: '(21) 91234-5678',
    address: 'Av. Tecnologia, 500',
    city: 'Rio de Janeiro',
    state: 'RJ',
    category: 'Tecnologia',
    paymentTerms: '45 dias',
    active: true,
    createdAt: new Date('2024-02-10').toISOString(),
  },
]

export const RegistersProvider = ({ children }) => {
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts)
  const [creditCards, setCreditCards] = useState(mockCreditCards)
  const [suppliers, setSuppliers] = useState(mockSuppliers)
  const [loading, setLoading] = useState(false)

  // Gestão de Contas Bancárias
  const addBankAccount = (accountData) => {
    const newAccount = {
      ...accountData,
      id: Date.now().toString(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    setBankAccounts([...bankAccounts, newAccount])
    return newAccount
  }

  const updateBankAccount = (id, updates) => {
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ))
  }

  const deleteBankAccount = (id) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== id))
  }

  const toggleBankAccountStatus = (id) => {
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id ? { ...acc, active: !acc.active } : acc
    ))
  }

  // Gestão de Cartões de Crédito
  const addCreditCard = (cardData) => {
    const newCard = {
      ...cardData,
      id: Date.now().toString(),
      usedLimit: 0,
      active: true,
      createdAt: new Date().toISOString(),
    }
    setCreditCards([...creditCards, newCard])
    return newCard
  }

  const updateCreditCard = (id, updates) => {
    setCreditCards(creditCards.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }

  const deleteCreditCard = (id) => {
    setCreditCards(creditCards.filter(card => card.id !== id))
  }

  const toggleCreditCardStatus = (id) => {
    setCreditCards(creditCards.map(card => 
      card.id === id ? { ...card, active: !card.active } : card
    ))
  }

  // Gestão de Fornecedores
  const addSupplier = (supplierData) => {
    const newSupplier = {
      ...supplierData,
      id: Date.now().toString(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    setSuppliers([...suppliers, newSupplier])
    return newSupplier
  }

  const updateSupplier = (id, updates) => {
    setSuppliers(suppliers.map(sup => 
      sup.id === id ? { ...sup, ...updates } : sup
    ))
  }

  const deleteSupplier = (id) => {
    setSuppliers(suppliers.filter(sup => sup.id !== id))
  }

  const toggleSupplierStatus = (id) => {
    setSuppliers(suppliers.map(sup => 
      sup.id === id ? { ...sup, active: !sup.active } : sup
    ))
  }

  // Estatísticas
  const getTotalBalance = () => {
    return bankAccounts
      .filter(acc => acc.active)
      .reduce((sum, acc) => sum + acc.balance, 0)
  }

  const getTotalCreditLimit = () => {
    return creditCards
      .filter(card => card.active)
      .reduce((sum, card) => sum + card.limit, 0)
  }

  const getAvailableCredit = () => {
    return creditCards
      .filter(card => card.active)
      .reduce((sum, card) => sum + (card.limit - card.usedLimit), 0)
  }

  const value = {
    bankAccounts,
    creditCards,
    suppliers,
    loading,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    toggleBankAccountStatus,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    toggleCreditCardStatus,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
    getTotalBalance,
    getTotalCreditLimit,
    getAvailableCredit,
  }

  return (
    <RegistersContext.Provider value={value}>
      {children}
    </RegistersContext.Provider>
  )
}
