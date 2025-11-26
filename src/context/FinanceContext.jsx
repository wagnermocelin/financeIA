import { createContext, useContext, useState, useEffect } from 'react'
import { 
  transactionService, 
  budgetService, 
  bankStatementService, 
  categoryService 
} from '../services/supabaseService'
import { useAuth } from './AuthContext'

const FinanceContext = createContext()

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider')
  }
  return context
}

export const FinanceProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [bankStatements, setBankStatements] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carrega dados do Supabase quando usuário está logado
  useEffect(() => {
    if (currentUser) {
      console.log('👤 Usuário logado, carregando dados...', currentUser)
      loadAllData()
    } else {
      console.log('⚠️ Nenhum usuário logado')
      setLoading(false)
    }
  }, [currentUser])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const companyId = currentUser?.companyId
      console.log('🔄 Carregando dados... companyId:', companyId)

      // Carrega todos os dados em paralelo
      const [transactionsData, budgetsData, statementsData, categoriesData] = await Promise.all([
        transactionService.getAll(companyId),
        budgetService.getAll(companyId),
        bankStatementService.getAll(companyId),
        categoryService.getAll(companyId)
      ])

      console.log('📦 Dados recebidos do Supabase:', {
        transactions: transactionsData,
        budgets: budgetsData,
        statements: statementsData,
        categories: categoriesData
      })

      setTransactions(transactionsData || [])
      setBudgets(budgetsData || [])
      setBankStatements(statementsData || [])
      setCategories(categoriesData || [])

      console.log('✅ Dados carregados do Supabase:', {
        transactions: transactionsData?.length || 0,
        budgets: budgetsData?.length || 0,
        statements: statementsData?.length || 0,
        categories: categoriesData?.length || 0
      })
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  const addTransaction = async (transaction) => {
    try {
      const newTransaction = {
        ...transaction,
        // Temporário: não envia company_id e user_id em desenvolvimento
        // TODO: Migrar para Supabase Auth para ter UUIDs reais
        // company_id: currentUser.companyId,
        // user_id: currentUser.id,
        date: transaction.date || new Date().toISOString(),
        status: transaction.status || 'completed'
      }

      const created = await transactionService.create(newTransaction)
      setTransactions([created, ...transactions])
      return created
    } catch (err) {
      console.error('Erro ao adicionar transação:', err)
      throw err
    }
  }

  const updateTransaction = async (id, updates) => {
    try {
      console.log('🔄 FinanceContext.updateTransaction chamado:', { id, updates })
      console.log('📊 Transações antes:', transactions.length)
      
      const updated = await transactionService.update(id, updates)
      
      console.log('✅ Transação atualizada pelo serviço:', updated)
      
      setTransactions(prevTransactions => {
        const newTransactions = prevTransactions.map(t => 
          t.id === id ? updated : t
        )
        console.log('🔄 Estado atualizado. Transações depois:', newTransactions.length)
        return newTransactions
      })
      
      return updated
    } catch (err) {
      console.error('❌ Erro ao atualizar transação:', err)
      throw err
    }
  }

  const deleteTransaction = async (id) => {
    try {
      await transactionService.delete(id)
      setTransactions(transactions.filter(t => t.id !== id))
    } catch (err) {
      console.error('Erro ao deletar transação:', err)
      throw err
    }
  }

  // ============================================
  // BUDGETS
  // ============================================

  const addBudget = async (budget) => {
    try {
      const newBudget = {
        ...budget,
        // company_id: currentUser.companyId,  // Temporário: comentado
        limit_amount: budget.limit,
        alert_threshold: budget.alertThreshold || 80
      }

      const created = await budgetService.create(newBudget)
      setBudgets([...budgets, created])
      return created
    } catch (err) {
      console.error('Erro ao adicionar orçamento:', err)
      throw err
    }
  }

  const updateBudget = async (id, updates) => {
    try {
      const updated = await budgetService.update(id, updates)
      setBudgets(budgets.map(b => 
        b.id === id ? updated : b
      ))
      return updated
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err)
      throw err
    }
  }

  const deleteBudget = async (id) => {
    try {
      await budgetService.delete(id)
      setBudgets(budgets.filter(b => b.id !== id))
    } catch (err) {
      console.error('Erro ao deletar orçamento:', err)
      throw err
    }
  }

  // ============================================
  // BANK STATEMENTS
  // ============================================

  const addBankStatement = async (statement) => {
    try {
      const newStatement = {
        ...statement,
        // company_id: currentUser.companyId  // Temporário: comentado
      }

      const created = await bankStatementService.create(newStatement)
      setBankStatements([...bankStatements, created])
      return created
    } catch (err) {
      console.error('Erro ao adicionar extrato:', err)
      throw err
    }
  }

  const addBankStatementsBatch = async (statements) => {
    try {
      const statementsWithCompany = statements.map(s => ({
        ...s,
        // company_id: currentUser.companyId  // Temporário: comentado
      }))

      const created = await bankStatementService.createBatch(statementsWithCompany)
      setBankStatements([...created, ...bankStatements])
      return created
    } catch (err) {
      console.error('Erro ao importar extratos:', err)
      throw err
    }
  }

  const reconcileTransaction = async (transactionId, statementId) => {
    try {
      console.log('🔄 Iniciando conciliação...', { transactionId, statementId })
      
      // Atualiza transação
      const updatedTransaction = await updateTransaction(transactionId, { 
        reconciled: true, 
        statement_id: statementId 
      })
      console.log('✅ Transação atualizada:', updatedTransaction)

      // Atualiza extrato
      const updatedStatement = await bankStatementService.reconcile(statementId, transactionId)
      console.log('✅ Extrato atualizado:', updatedStatement)

      // Atualiza estado local dos extratos
      setBankStatements(bankStatements.map(s =>
        s.id === statementId ? { ...s, reconciled: true, transaction_id: transactionId } : s
      ))

      console.log('✅ Conciliação concluída com sucesso!')
      return true
    } catch (err) {
      console.error('❌ Erro ao conciliar:', err)
      alert(`Erro ao conciliar: ${err.message}`)
      throw err
    }
  }

  // ============================================
  // SUMMARY & CALCULATIONS
  // ============================================

  const getFinancialSummary = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const balance = income - expenses

    return { income, expenses, balance, transactions: monthTransactions }
  }

  const getBudgetStatus = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date)
          return t.category === budget.category &&
                 t.type === 'expense' &&
                 date.getMonth() === currentMonth &&
                 date.getFullYear() === currentYear
        })
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const limit = Number(budget.limit_amount || budget.limit)
      const percentage = (spent / limit) * 100

      return {
        ...budget,
        spent,
        remaining: limit - spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      }
    })
  }

  // ============================================
  // CATEGORIAS
  // ============================================

  const addCategory = async (category) => {
    try {
      console.log('➕ Criando categoria:', category)
      const newCategory = {
        ...category,
        // company_id: currentUser?.companyId, // Comentado temporariamente
      }

      const created = await categoryService.create(newCategory)
      setCategories([...categories, created])
      console.log('✅ Categoria criada:', created)
      return created
    } catch (err) {
      console.error('❌ Erro ao criar categoria:', err)
      throw err
    }
  }

  const updateCategory = async (id, updates) => {
    try {
      console.log('📝 Atualizando categoria:', id, updates)
      const updated = await categoryService.update(id, updates)
      setCategories(categories.map(c => c.id === id ? updated : c))
      console.log('✅ Categoria atualizada:', updated)
      return updated
    } catch (err) {
      console.error('❌ Erro ao atualizar categoria:', err)
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      console.log('🗑️ Deletando categoria:', id)
      await categoryService.delete(id)
      setCategories(categories.filter(c => c.id !== id))
      console.log('✅ Categoria deletada')
    } catch (err) {
      console.error('❌ Erro ao deletar categoria:', err)
      throw err
    }
  }

  // Função para recarregar dados
  const refreshData = async () => {
    await loadAllData()
  }

  const value = {
    transactions,
    budgets,
    bankStatements,
    categories,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addBankStatement,
    addBankStatementsBatch,
    addCategory,
    updateCategory,
    deleteCategory,
    reconcileTransaction,
    getFinancialSummary,
    getBudgetStatus,
    refreshData,
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}
