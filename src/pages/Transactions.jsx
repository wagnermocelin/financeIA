import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, Clock, Sparkles } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../utils/formatters'
import { categorizeBatch, getCategorizationStats } from '../services/aiCategorizationService'

const Transactions = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, loading } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isRecategorizing, setIsRecategorizing] = useState(false)
  
  // Estados para seleção múltipla
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('')

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Funções de seleção múltipla
  const toggleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id))
    }
  }

  const handleBulkCategorize = async () => {
    if (!bulkCategory) {
      alert('Selecione uma categoria!')
      return
    }

    console.log('🔄 Iniciando categorização em lote...')
    console.log('📊 IDs selecionados:', selectedTransactions)
    console.log('🏷️ Nova categoria:', bulkCategory)

    try {
      let updated = 0
      let errors = 0

      for (const transactionId of selectedTransactions) {
        try {
          console.log(`⏳ Atualizando transação ${transactionId}...`)
          const result = await updateTransaction(transactionId, { category: bulkCategory })
          console.log(`✅ Transação ${transactionId} atualizada:`, result)
          updated++
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${transactionId}:`, error)
          errors++
        }
      }
      
      console.log(`\n📊 Resultado: ${updated} atualizadas, ${errors} erros`)
      
      alert(`✅ ${updated} transações atualizadas com sucesso!${errors > 0 ? `\n❌ ${errors} erros` : ''}`)
      setSelectedTransactions([])
      setIsBulkModalOpen(false)
      setBulkCategory('')
    } catch (error) {
      console.error('❌ Erro ao categorizar em lote:', error)
      alert(`Erro ao categorizar: ${error.message}`)
    }
  }

  // Função para recategorizar com IA
  const handleAIRecategorization = async () => {
    if (!confirm(
      'Deseja recategorizar automaticamente as transações usando IA?\n\n' +
      'A IA irá analisar a descrição de cada transação e sugerir a categoria mais adequada.\n\n' +
      'Apenas transações com "Sem Categoria" ou baixa confiança serão atualizadas.'
    )) {
      return
    }

    setIsRecategorizing(true)
    console.log('🤖 Iniciando recategorização com IA...')

    try {
      // Filtra transações que precisam de recategorização
      const transactionsToAnalyze = transactions.filter(
        t => t.category === 'Sem Categoria' || !t.category
      )

      console.log(`📊 Analisando ${transactionsToAnalyze.length} transações...`)

      // Gera sugestões
      const suggestions = categorizeBatch(transactionsToAnalyze, categories)
      const stats = getCategorizationStats(suggestions)

      console.log('📈 Estatísticas:', stats)
      console.log('💡 Sugestões:', suggestions)
      
      // DEBUG: Mostrar algumas sugestões para análise
      console.log('🔍 Primeiras 5 sugestões:')
      suggestions.slice(0, 5).forEach(s => {
        console.log(`  - ${s.description}: ${s.suggestedCategory} (${s.confidence}% confiança, shouldUpdate: ${s.shouldUpdate})`)
      })

      // Aplica as sugestões com confiança >= 50% (ajustado de 70%)
      let updated = 0
      let errors = 0

      for (const suggestion of suggestions) {
        if (suggestion.shouldUpdate && suggestion.confidence >= 50) {
          try {
            await updateTransaction(suggestion.transactionId, {
              category: suggestion.suggestedCategory
            })
            console.log(`✅ Atualizada: ${suggestion.description} → ${suggestion.suggestedCategory} (${suggestion.confidence}%)`)
            updated++
          } catch (error) {
            console.error(`❌ Erro ao atualizar ${suggestion.description}:`, error)
            errors++
          }
        }
      }

      console.log(`\n${'='.repeat(50)}`)
      console.log(`✅ Recategorização concluída!`)
      console.log(`   📊 Analisadas: ${transactionsToAnalyze.length}`)
      console.log(`   ✅ Atualizadas: ${updated}`)
      console.log(`   ⚠️  Ignoradas: ${transactionsToAnalyze.length - updated}`)
      console.log(`   ❌ Erros: ${errors}`)
      console.log('='.repeat(50))

      alert(
        `Recategorização concluída!\n\n` +
        `✅ ${updated} transações atualizadas\n` +
        `⚠️ ${transactionsToAnalyze.length - updated} ignoradas (baixa confiança)\n` +
        `${errors > 0 ? `❌ ${errors} erros\n` : ''}`
      )
    } catch (error) {
      console.error('❌ Erro na recategorização:', error)
      alert(`Erro ao recategorizar: ${error.message}`)
    } finally {
      setIsRecategorizing(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      reconciled: false,
      status: 'pending'
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData)
    } else {
      addTransaction(transactionData)
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
    })
    setEditingTransaction(null)
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split('T')[0],
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id)
    }
  }

  // Filtros
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as transações financeiras</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAIRecategorization}
            disabled={isRecategorizing || loading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isRecategorizing ? 'Recategorizando...' : 'Recategorizar com IA'}</span>
          </button>
          <button
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTransactions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedTransactions.length} transação(ões) selecionada(s)
              </span>
              <button
                onClick={() => setSelectedTransactions([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Limpar seleção
              </button>
            </div>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Categorizar Selecionadas</span>
            </button>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Total de Receitas</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalIncome)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Total de Despesas</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(totalExpense)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Saldo</div>
          <div className={`text-2xl font-bold mt-1 ${
            totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totalIncome - totalExpense)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="all">Todas categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 w-12">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => toggleSelectTransaction(transaction.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.category}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`badge ${
                        transaction.type === 'income' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {transaction.reconciled ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">Conciliado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Pendente</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Ex: Venda de produtos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="">Selecione uma categoria</option>
              {categories
                .filter(cat => cat.type === formData.type)
                .map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTransaction ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Categorization Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false)
          setBulkCategory('')
        }}
        title="Categorizar em Lote"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Você está prestes a categorizar <strong>{selectedTransactions.length}</strong> transação(ões).
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova Categoria
            </label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="input"
              autoFocus
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsBulkModalOpen(false)
                setBulkCategory('')
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleBulkCategorize}
              className="btn btn-primary"
              disabled={!bulkCategory}
            >
              Aplicar Categoria
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Transactions
