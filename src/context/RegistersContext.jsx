import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { bankAccountService, creditCardService, supplierService } from '../services/registersService'

const RegistersContext = createContext()

export const useRegisters = () => {
  const context = useContext(RegistersContext)
  if (!context) {
    throw new Error('useRegisters deve ser usado dentro de RegistersProvider')
  }
  return context
}

export const RegistersProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [bankAccounts, setBankAccounts] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  // Carrega dados iniciais
  useEffect(() => {
    if (currentUser) {
      loadAllData()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const loadAllData = async () => {
    try {
      console.log('🔄 Carregando cadastros...')
      setLoading(true)

      const companyId = currentUser?.company_id

      const [accountsData, cardsData, suppliersData] = await Promise.all([
        bankAccountService.getAll(companyId),
        creditCardService.getAll(companyId),
        supplierService.getAll(companyId)
      ])

      setBankAccounts(accountsData)
      setCreditCards(cardsData)
      setSuppliers(suppliersData)

      console.log('✅ Cadastros carregados:', {
        accounts: accountsData.length,
        cards: cardsData.length,
        suppliers: suppliersData.length
      })
    } catch (error) {
      console.error('❌ Erro ao carregar cadastros:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // CONTAS BANCÁRIAS
  // ============================================

  const refreshBankAccounts = async () => {
    try {
      const data = await bankAccountService.getAll(currentUser?.company_id)
      setBankAccounts(data)
    } catch (error) {
      console.error('❌ Erro ao atualizar contas:', error)
    }
  }

  const addBankAccount = async (accountData) => {
    try {
      console.log('➕ Adicionando conta bancária...')
      const newAccount = await bankAccountService.create({
        ...accountData,
        company_id: currentUser?.company_id
      })
      
      await refreshBankAccounts()
      return newAccount
    } catch (error) {
      console.error('❌ Erro ao adicionar conta:', error)
      throw error
    }
  }

  const updateBankAccount = async (id, updates) => {
    try {
      console.log('📝 Atualizando conta bancária...')
      const updated = await bankAccountService.update(id, updates)
      
      await refreshBankAccounts()
      return updated
    } catch (error) {
      console.error('❌ Erro ao atualizar conta:', error)
      throw error
    }
  }

  const deleteBankAccount = async (id) => {
    try {
      console.log('🗑️ Deletando conta bancária...')
      await bankAccountService.delete(id)
      
      await refreshBankAccounts()
    } catch (error) {
      console.error('❌ Erro ao deletar conta:', error)
      throw error
    }
  }

  const toggleBankAccountStatus = async (id) => {
    try {
      console.log('🔄 Alternando status da conta...')
      await bankAccountService.toggleStatus(id)
      
      await refreshBankAccounts()
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }

  // ============================================
  // CARTÕES DE CRÉDITO
  // ============================================

  const refreshCreditCards = async () => {
    try {
      const data = await creditCardService.getAll(currentUser?.company_id)
      setCreditCards(data)
    } catch (error) {
      console.error('❌ Erro ao atualizar cartões:', error)
    }
  }

  const addCreditCard = async (cardData) => {
    try {
      console.log('➕ Adicionando cartão...')
      const newCard = await creditCardService.create({
        ...cardData,
        company_id: currentUser?.company_id
      })
      
      await refreshCreditCards()
      return newCard
    } catch (error) {
      console.error('❌ Erro ao adicionar cartão:', error)
      throw error
    }
  }

  const updateCreditCard = async (id, updates) => {
    try {
      console.log('📝 Atualizando cartão...')
      const updated = await creditCardService.update(id, updates)
      
      await refreshCreditCards()
      return updated
    } catch (error) {
      console.error('❌ Erro ao atualizar cartão:', error)
      throw error
    }
  }

  const deleteCreditCard = async (id) => {
    try {
      console.log('🗑️ Deletando cartão...')
      await creditCardService.delete(id)
      
      await refreshCreditCards()
    } catch (error) {
      console.error('❌ Erro ao deletar cartão:', error)
      throw error
    }
  }

  const toggleCreditCardStatus = async (id) => {
    try {
      console.log('🔄 Alternando status do cartão...')
      await creditCardService.toggleStatus(id)
      
      await refreshCreditCards()
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }

  // ============================================
  // FORNECEDORES
  // ============================================

  const refreshSuppliers = async () => {
    try {
      const data = await supplierService.getAll(currentUser?.company_id)
      setSuppliers(data)
    } catch (error) {
      console.error('❌ Erro ao atualizar fornecedores:', error)
    }
  }

  const addSupplier = async (supplierData) => {
    try {
      console.log('➕ Adicionando fornecedor...')
      const newSupplier = await supplierService.create({
        ...supplierData,
        company_id: currentUser?.company_id
      })
      
      await refreshSuppliers()
      return newSupplier
    } catch (error) {
      console.error('❌ Erro ao adicionar fornecedor:', error)
      throw error
    }
  }

  const updateSupplier = async (id, updates) => {
    try {
      console.log('📝 Atualizando fornecedor...')
      const updated = await supplierService.update(id, updates)
      
      await refreshSuppliers()
      return updated
    } catch (error) {
      console.error('❌ Erro ao atualizar fornecedor:', error)
      throw error
    }
  }

  const deleteSupplier = async (id) => {
    try {
      console.log('🗑️ Deletando fornecedor...')
      await supplierService.delete(id)
      
      await refreshSuppliers()
    } catch (error) {
      console.error('❌ Erro ao deletar fornecedor:', error)
      throw error
    }
  }

  const toggleSupplierStatus = async (id) => {
    try {
      console.log('🔄 Alternando status do fornecedor...')
      await supplierService.toggleStatus(id)
      
      await refreshSuppliers()
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error)
      throw error
    }
  }

  // ============================================
  // ESTATÍSTICAS
  // ============================================

  const getTotalBalance = () => {
    return bankAccounts
      .filter(acc => acc.active)
      .reduce((sum, acc) => sum + Number(acc.balance || 0), 0)
  }

  const getTotalCreditLimit = () => {
    return creditCards
      .filter(card => card.active)
      .reduce((sum, card) => sum + Number(card.credit_limit || 0), 0)
  }

  const getAvailableCredit = () => {
    return creditCards
      .filter(card => card.active)
      .reduce((sum, card) => {
        const limit = Number(card.credit_limit || 0)
        const used = Number(card.used_limit || 0)
        return sum + (limit - used)
      }, 0)
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
    refreshBankAccounts,
    refreshCreditCards,
    refreshSuppliers,
  }

  return (
    <RegistersContext.Provider value={value}>
      {children}
    </RegistersContext.Provider>
  )
}
