import { useState, useRef } from 'react'
import { useRegisters } from '../context/RegistersContext'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Search, Edit, Trash2, Package, CheckCircle, XCircle, Phone, Mail, Upload, Download } from 'lucide-react'
import { formatDate } from '../utils/formatters'
import { importSuppliersFromExcel, validateSupplier, generateSupplierTemplate, getImportStats } from '../utils/excelImporter'

const Suppliers = () => {
  const { 
    suppliers, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier, 
    toggleSupplierStatus,
    loading 
  } = useRegisters()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    category: '',
    paymentTerms: '',
  })

  const categories = [
    'Materiais',
    'Tecnologia',
    'Serviços',
    'Alimentação',
    'Transporte',
    'Limpeza',
    'Manutenção',
    'Outros'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData)
    } else {
      addSupplier(formData)
    }

    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      category: '',
      paymentTerms: '',
    })
    setEditingSupplier(null)
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      cnpj: supplier.cnpj,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      category: supplier.category,
      paymentTerms: supplier.paymentTerms,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      deleteSupplier(id)
    }
  }

  // ============================================
  // IMPORTAÇÃO DE EXCEL
  // ============================================

  const handleDownloadTemplate = () => {
    console.log('📥 Gerando template de fornecedores...')
    generateSupplierTemplate()
    alert('Template baixado com sucesso!\n\nPreencha a planilha e importe novamente.')
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valida extensão
    const validExtensions = ['.xlsx', '.xls']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Arquivo inválido!\n\nApenas arquivos Excel (.xlsx, .xls) são aceitos.')
      return
    }

    setIsImporting(true)
    console.log('📂 Iniciando importação de fornecedores...')
    console.log('📄 Arquivo:', file.name)

    try {
      // Importa do Excel
      const importedSuppliers = await importSuppliersFromExcel(file)
      console.log(`📊 Fornecedores importados: ${importedSuppliers.length}`)

      // Valida cada fornecedor
      const validationResults = importedSuppliers.map(supplier => 
        validateSupplier(supplier)
      )

      // Estatísticas
      const stats = getImportStats(importedSuppliers, validationResults)
      console.log('📈 Estatísticas:', stats)

      // Confirma importação
      const confirmMessage = 
        `Importação de Fornecedores\n\n` +
        `📊 Total: ${stats.total}\n` +
        `✅ Válidos: ${stats.valid}\n` +
        `❌ Inválidos: ${stats.invalid}\n\n` +
        `Deseja importar os ${stats.valid} fornecedores válidos?`

      if (!confirm(confirmMessage)) {
        console.log('⚠️ Importação cancelada pelo usuário')
        setIsImporting(false)
        return
      }

      // Importa apenas os válidos
      let imported = 0
      let errors = 0

      for (let i = 0; i < importedSuppliers.length; i++) {
        const supplier = importedSuppliers[i]
        const validation = validationResults[i]

        if (validation.valid) {
          try {
            await addSupplier(supplier)
            console.log(`✅ Importado: ${supplier.name}`)
            imported++
          } catch (error) {
            console.error(`❌ Erro ao importar ${supplier.name}:`, error)
            errors++
          }
        } else {
          console.warn(`⚠️ Ignorado (inválido): ${supplier.name}`, validation.errors)
        }
      }

      console.log(`\n${'='.repeat(50)}`)
      console.log(`✅ Importação concluída!`)
      console.log(`   ✅ Importados: ${imported}`)
      console.log(`   ❌ Erros: ${errors}`)
      console.log(`   ⚠️  Ignorados: ${stats.invalid}`)
      console.log('='.repeat(50))

      alert(
        `Importação concluída!\n\n` +
        `✅ ${imported} fornecedores importados\n` +
        `${errors > 0 ? `❌ ${errors} erros\n` : ''}` +
        `${stats.invalid > 0 ? `⚠️ ${stats.invalid} ignorados (inválidos)` : ''}`
      )

    } catch (error) {
      console.error('❌ Erro na importação:', error)
      alert(`Erro ao importar fornecedores:\n\n${error.message}`)
    } finally {
      setIsImporting(false)
      // Limpa o input para permitir reimportar o mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const filteredSuppliers = suppliers.filter(sup => {
    const matchesSearch = sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sup.cnpj.includes(searchTerm) ||
                         sup.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || sup.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const activeSuppliers = suppliers.filter(sup => sup.active).length

  // Agrupa fornecedores por categoria
  const suppliersByCategory = {}
  suppliers.forEach(sup => {
    suppliersByCategory[sup.category] = (suppliersByCategory[sup.category] || 0) + 1
  })

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600 mt-1">Gerencie seus fornecedores</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Baixar Template</span>
          </button>
          <button
            onClick={handleFileSelect}
            disabled={isImporting || loading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>{isImporting ? 'Importando...' : 'Importar Excel'}</span>
          </button>
          <button
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Fornecedor</span>
          </button>
        </div>
      </div>

      {/* Input oculto para upload de arquivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Total de Fornecedores</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Fornecedores Ativos</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{activeSuppliers}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Categorias</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {Object.keys(suppliersByCategory).length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Maior Categoria</div>
          <div className="text-sm font-bold text-purple-600 mt-1">
            {Object.entries(suppliersByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
          </div>
          <div className="text-xs text-gray-500">
            {Object.entries(suppliersByCategory).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} fornecedores
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fornecedor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">CNPJ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contato</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prazo Pgto</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum fornecedor encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Cadastre seus fornecedores para começar
                    </p>
                    <button
                      onClick={() => {
                        resetForm()
                        setIsModalOpen(true)
                      }}
                      className="btn btn-primary"
                    >
                      Cadastrar Primeiro Fornecedor
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-xs text-gray-500">{supplier.city}/{supplier.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.cnpj}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{supplier.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{supplier.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">{supplier.category}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.paymentTerms}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleSupplierStatus(supplier.id)}
                        className="inline-flex items-center space-x-1"
                      >
                        {supplier.active ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-600">Inativo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
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
        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Fornecedor *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ex: Fornecedor ABC Ltda"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="input"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="">Selecione</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="contato@fornecedor.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
                placeholder="São Paulo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                required
                maxLength="2"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                className="input"
                placeholder="SP"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prazo de Pagamento *
            </label>
            <input
              type="text"
              required
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="input"
              placeholder="Ex: 30 dias, À vista, 15/30 dias"
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
              {editingSupplier ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Suppliers
