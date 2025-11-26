import { useState } from 'react'
import { useRegisters } from '../context/RegistersContext'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Search, Edit, Trash2, Building, CheckCircle, XCircle, Wallet } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const BankAccounts = () => {
  const { 
    bankAccounts, 
    addBankAccount, 
    updateBankAccount, 
    deleteBankAccount, 
    toggleBankAccountStatus,
    getTotalBalance,
    loading 
  } = useRegisters()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    agency: '',
    account: '',
    type: 'checking',
    balance: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const accountData = {
      ...formData,
      balance: parseFloat(formData.balance),
    }

    if (editingAccount) {
      updateBankAccount(editingAccount.id, accountData)
    } else {
      addBankAccount(accountData)
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      bank: '',
      agency: '',
      account: '',
      type: 'checking',
      balance: '',
    })
    setEditingAccount(null)
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      bank: account.bank,
      agency: account.agency,
      account: account.account,
      type: account.type,
      balance: account.balance.toString(),
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteBankAccount(id)
    }
  }

  const filteredAccounts = bankAccounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account.includes(searchTerm)
  )

  const activeAccounts = bankAccounts.filter(acc => acc.active).length
  const totalBalance = getTotalBalance()

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas Bancárias</h1>
          <p className="text-gray-600 mt-1">Gerencie suas contas bancárias</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total de Contas</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {bankAccounts.length}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Contas Ativas</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {activeAccounts}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Saldo Total</div>
              <div className="text-2xl font-bold text-primary-600 mt-1">
                {formatCurrency(totalBalance)}
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Wallet className="w-6 h-6 text-primary-600" />
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
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccounts.length === 0 ? (
          <Card className="lg:col-span-2">
            <div className="text-center py-12">
              <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Cadastre suas contas bancárias para começar
              </p>
              <button
                onClick={() => {
                  resetForm()
                  setIsModalOpen(true)
                }}
                className="btn btn-primary"
              >
                Cadastrar Primeira Conta
              </button>
            </div>
          </Card>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.bank}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBankAccountStatus(account.id)}
                    className="flex items-center space-x-1"
                  >
                    {account.active ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </button>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Agência:</span>
                    <p className="font-medium text-gray-900">{account.agency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Conta:</span>
                    <p className="font-medium text-gray-900">{account.account}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <p className="font-medium text-gray-900">
                      {account.type === 'checking' ? 'Corrente' : 'Poupança'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cadastro:</span>
                    <p className="font-medium text-gray-900">{formatDate(account.createdAt)}</p>
                  </div>
                </div>

                {/* Balance */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Saldo Atual</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="flex-1 btn btn-secondary text-sm flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="flex-1 btn btn-danger text-sm flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Conta *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ex: Conta Corrente Principal"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agência *
              </label>
              <input
                type="text"
                required
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="input"
                placeholder="1234-5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta *
              </label>
              <input
                type="text"
                required
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                className="input"
                placeholder="12345-6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conta *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
            >
              <option value="checking">Conta Corrente</option>
              <option value="savings">Conta Poupança</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo Inicial *
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="input"
              placeholder="0,00"
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
              {editingAccount ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BankAccounts
