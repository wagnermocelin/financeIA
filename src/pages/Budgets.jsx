import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const Budgets = () => {
  const { budgets, categories, addBudget, updateBudget, deleteBudget, getBudgetStatus, loading } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    alertThreshold: '80',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const budgetData = {
      ...formData,
      limit: parseFloat(formData.limit),
      alertThreshold: parseInt(formData.alertThreshold),
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData)
    } else {
      addBudget(budgetData)
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      alertThreshold: '80',
    })
    setEditingBudget(null)
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold.toString(),
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(id)
    }
  }

  const budgetStatus = getBudgetStatus()
  const expenseCategories = categories.filter(c => c.type === 'expense')

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600 mt-1">Controle e monitore seus limites de gastos</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Total Orçado</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {formatCurrency(budgetStatus.reduce((sum, b) => sum + b.limit, 0))}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Total Gasto</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(budgetStatus.reduce((sum, b) => sum + b.spent, 0))}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Disponível</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(budgetStatus.reduce((sum, b) => sum + b.remaining, 0))}
          </div>
        </Card>
      </div>

      {/* Budget Cards */}
      {budgetStatus.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum orçamento configurado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie orçamentos para controlar seus gastos por categoria
            </p>
            <button
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
              className="btn btn-primary"
            >
              Criar Primeiro Orçamento
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgetStatus.map((budget) => (
            <Card key={budget.id}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {budget.category}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Período: {budget.period === 'monthly' ? 'Mensal' : 'Anual'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                    </span>
                    <span className={`text-sm font-medium ${
                      budget.status === 'exceeded' ? 'text-red-600' :
                      budget.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        budget.status === 'exceeded' ? 'bg-red-600' :
                        budget.status === 'warning' ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  budget.status === 'exceeded' ? 'bg-red-50' :
                  budget.status === 'warning' ? 'bg-yellow-50' :
                  'bg-green-50'
                }`}>
                  {budget.status === 'exceeded' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-900">
                          Orçamento excedido
                        </div>
                        <div className="text-xs text-red-700">
                          Você gastou {formatCurrency(Math.abs(budget.remaining))} a mais
                        </div>
                      </div>
                    </>
                  ) : budget.status === 'warning' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-yellow-900">
                          Atenção ao limite
                        </div>
                        <div className="text-xs text-yellow-700">
                          Restam {formatCurrency(budget.remaining)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-900">
                          Dentro do orçamento
                        </div>
                        <div className="text-xs text-green-700">
                          Restam {formatCurrency(budget.remaining)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Alert Threshold */}
                <div className="text-xs text-gray-500">
                  Alerta configurado em {budget.alertThreshold}% do limite
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              disabled={!!editingBudget}
            >
              <option value="">Selecione uma categoria</option>
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {editingBudget && (
              <p className="text-xs text-gray-500 mt-1">
                A categoria não pode ser alterada após criação
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite de Gastos
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="input"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="input"
            >
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alerta em (%)
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={formData.alertThreshold}
              onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Você será alertado quando atingir esta porcentagem do limite
            </p>
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
              {editingBudget ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Budgets
