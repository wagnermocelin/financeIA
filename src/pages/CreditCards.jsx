import { useState } from 'react'
import { useRegisters } from '../context/RegistersContext'
import { useFinance } from '../context/FinanceContext'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import InvoiceImportModal from '../components/InvoiceImportModal'
import { Plus, Search, Edit, Trash2, CreditCard as CreditCardIcon, CheckCircle, XCircle, TrendingUp, FileUp } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const CreditCards = () => {
  const { 
    creditCards, 
    addCreditCard, 
    updateCreditCard, 
    deleteCreditCard, 
    toggleCreditCardStatus,
    getTotalCreditLimit,
    getAvailableCredit,
    loading 
  } = useRegisters()
  
  const { addTransaction } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    lastDigits: '',
    brand: 'Visa',
    limit: '',
    closingDay: '',
    dueDay: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const cardData = {
      ...formData,
      limit: parseFloat(formData.limit),
      closingDay: parseInt(formData.closingDay),
      dueDay: parseInt(formData.dueDay),
    }

    if (editingCard) {
      updateCreditCard(editingCard.id, cardData)
    } else {
      addCreditCard(cardData)
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      bank: '',
      lastDigits: '',
      brand: 'Visa',
      limit: '',
      closingDay: '',
      dueDay: '',
    })
    setEditingCard(null)
  }

  const handleEdit = (card) => {
    setEditingCard(card)
    setFormData({
      name: card.name,
      bank: card.bank,
      lastDigits: card.lastDigits,
      brand: card.brand,
      limit: card.limit.toString(),
      closingDay: card.closingDay.toString(),
      dueDay: card.dueDay.toString(),
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão?')) {
      deleteCreditCard(id)
    }
  }

  const handleImportInvoice = async (invoiceData, cardId) => {
    try {
      console.log('📥 Importando fatura...', {
        card: cardId,
        transactions: invoiceData.transactions.length
      })

      let imported = 0
      let errors = 0

      for (const transaction of invoiceData.transactions) {
        try {
          await addTransaction({
            ...transaction,
            category: 'Cartão de Crédito',
            reconciled: true,
            status: 'completed',
            notes: `Importado da fatura ${invoiceData.fileName}`
          })
          imported++
        } catch (error) {
          console.error('❌ Erro ao importar transação:', error)
          errors++
        }
      }

      console.log(`✅ Importação concluída: ${imported} transações importadas, ${errors} erros`)
      
      alert(
        `Fatura importada com sucesso!\n\n` +
        `✅ ${imported} transações importadas\n` +
        `${errors > 0 ? `❌ ${errors} erros` : ''}`
      )
    } catch (error) {
      console.error('❌ Erro na importação:', error)
      alert(`Erro ao importar fatura:\n\n${error.message}`)
    }
  }

  const filteredCards = creditCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.lastDigits.includes(searchTerm)
  )

  const activeCards = creditCards.filter(card => card.active).length
  const totalLimit = getTotalCreditLimit()
  const availableCredit = getAvailableCredit()

  const getBrandColor = (brand) => {
    const colors = {
      'Visa': 'from-blue-500 to-blue-700',
      'Mastercard': 'from-red-500 to-orange-600',
      'Elo': 'from-yellow-500 to-yellow-700',
      'American Express': 'from-green-500 to-green-700',
    }
    return colors[brand] || 'from-gray-500 to-gray-700'
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-gray-600 mt-1">Gerencie seus cartões de crédito</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FileUp className="w-5 h-5" />
            <span>Importar Fatura</span>
          </button>
          <button
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Cartão</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total de Cartões</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {creditCards.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {activeCards} ativos
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCardIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Limite Total</div>
              <div className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(totalLimit)}
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Crédito Disponível</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(availableCredit)}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cartões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCards.length === 0 ? (
          <Card className="lg:col-span-2">
            <div className="text-center py-12">
              <CreditCardIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cartão encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Cadastre seus cartões de crédito para começar
              </p>
              <button
                onClick={() => {
                  resetForm()
                  setIsModalOpen(true)
                }}
                className="btn btn-primary"
              >
                Cadastrar Primeiro Cartão
              </button>
            </div>
          </Card>
        ) : (
          filteredCards.map((card) => {
            const usagePercentage = (card.usedLimit / card.limit) * 100
            const available = card.limit - card.usedLimit

            return (
              <Card key={card.id}>
                <div className="space-y-4">
                  {/* Card Visual */}
                  <div className={`relative bg-gradient-to-br ${getBrandColor(card.brand)} rounded-xl p-6 text-white`}>
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="text-sm opacity-80">{card.bank}</p>
                        <h3 className="text-lg font-semibold mt-1">{card.name}</h3>
                      </div>
                      <button
                        onClick={() => toggleCreditCardStatus(card.id)}
                        className="p-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        {card.active ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs opacity-70">Número do Cartão</p>
                        <p className="text-lg font-mono tracking-wider">
                          •••• •••• •••• {card.lastDigits}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs opacity-70">Fechamento</p>
                          <p className="font-medium">Dia {card.closingDay}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Vencimento</p>
                          <p className="font-medium">Dia {card.dueDay}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-70">Bandeira</p>
                          <p className="font-medium">{card.brand}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Limit Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Limite Utilizado</span>
                      <span className="text-sm font-medium text-gray-900">
                        {usagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercentage >= 80 ? 'bg-red-600' :
                          usagePercentage >= 60 ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-600">
                        Usado: {formatCurrency(card.usedLimit)}
                      </span>
                      <span className="text-gray-600">
                        Disponível: {formatCurrency(available)}
                      </span>
                    </div>
                  </div>

                  {/* Limit Info */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Limite Total</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatCurrency(card.limit)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="flex-1 btn btn-secondary text-sm flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="flex-1 btn btn-danger text-sm flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Invoice Import Modal */}
      <InvoiceImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportInvoice}
        creditCards={creditCards}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingCard ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cartão *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ex: Cartão Empresarial"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco *
              </label>
              <input
                type="text"
                required
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="input"
                placeholder="Ex: Banco do Brasil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bandeira *
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
                <option value="American Express">American Express</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Últimos 4 Dígitos *
            </label>
            <input
              type="text"
              required
              maxLength="4"
              value={formData.lastDigits}
              onChange={(e) => setFormData({ ...formData, lastDigits: e.target.value.replace(/\D/g, '') })}
              className="input"
              placeholder="1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite do Cartão *
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="input"
              placeholder="0,00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia de Fechamento *
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.closingDay}
                onChange={(e) => setFormData({ ...formData, closingDay: e.target.value })}
                className="input"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia de Vencimento *
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                className="input"
                placeholder="20"
              />
            </div>
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
              {editingCard ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CreditCards
