import { useState, useRef } from 'react'
import { FileUp, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { parseCreditCardInvoice, validateInvoice, getImportSummary } from '../utils/creditCardInvoiceParser'
import { formatCurrency } from '../utils/formatters'

export default function InvoiceImportModal({ isOpen, onClose, onImport, creditCards }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)
  const [validation, setValidation] = useState(null)
  const [selectedCard, setSelectedCard] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar extensão
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Apenas arquivos PDF são aceitos!')
      return
    }

    setIsProcessing(true)

    try {
      // Processar PDF
      const invoice = await parseCreditCardInvoice(file)
      
      // Validar dados
      const validationResult = validateInvoice(invoice)
      
      setInvoiceData(invoice)
      setValidation(validationResult)
      
      console.log('📊 Resumo da importação:', getImportSummary(invoice, validationResult))
    } catch (error) {
      console.error('❌ Erro ao processar fatura:', error)
      alert(`Erro ao processar fatura:\n\n${error.message}`)
      setInvoiceData(null)
      setValidation(null)
    } finally {
      setIsProcessing(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImport = () => {
    if (!invoiceData || !selectedCard) {
      alert('Selecione um cartão de crédito!')
      return
    }

    if (!validation?.valid) {
      console.warn('⚠️ Erros de validação encontrados:', validation?.errors)
      const errorMsg = validation?.errors?.join('\n') || 'Erros desconhecidos'
      if (!confirm(`A fatura contém erros de validação:\n\n${errorMsg}\n\nDeseja importar mesmo assim?`)) {
        return
      }
    }

    // Chamar callback de importação
    onImport(invoiceData, selectedCard)
    handleClose()
  }

  const handleClose = () => {
    setInvoiceData(null)
    setValidation(null)
    setSelectedCard('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Importar Fatura de Cartão</h2>
            <p className="text-sm text-gray-600 mt-1">
              Faça upload do PDF da fatura para importar automaticamente
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Area */}
          {!invoiceData && (
            <div className="space-y-4">
              <div
                onClick={handleFileSelect}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader className="w-16 h-16 text-primary-600 animate-spin mb-4" />
                    <p className="text-lg font-medium text-gray-900">Processando PDF...</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Extraindo dados da fatura, aguarde...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileUp className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Clique para selecionar o PDF da fatura
                    </p>
                    <p className="text-sm text-gray-600">
                      Formatos aceitos: PDF • Tamanho máximo: 10MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas para melhor extração:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use o PDF original da fatura (não escaneado)</li>
                  <li>• Certifique-se que o PDF não está protegido</li>
                  <li>• Prefira faturas digitais enviadas por email</li>
                </ul>
              </div>
            </div>
          )}

          {/* Invoice Summary */}
          {invoiceData && validation && (
            <div className="space-y-6">
              {/* Validation Status */}
              <div className={`border rounded-lg p-4 ${
                validation.valid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  {validation.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      validation.valid ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      {validation.valid ? 'Fatura processada com sucesso!' : 'Atenção: Verifique os dados'}
                    </h3>
                    {validation.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                        {validation.errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Operadora</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{invoiceData.operator}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Vencimento</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {invoiceData.dueDate ? invoiceData.dueDate.toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-lg font-semibold text-red-600 mt-1">
                    {formatCurrency(invoiceData.totalAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Transações</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {invoiceData.transactions.length}
                  </p>
                </div>
              </div>

              {/* Card Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Cartão de Crédito *
                </label>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um cartão...</option>
                  {creditCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} - {card.bank} (••{card.lastDigits || card.last_digits})
                    </option>
                  ))}
                </select>
              </div>

              {/* Transactions List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Transações Encontradas ({invoiceData.transactions.length})
                </h3>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Data</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Descrição</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoiceData.transactions.map((transaction, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-red-600 font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setInvoiceData(null)
                    setValidation(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Selecionar Outro Arquivo
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedCard}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importar {invoiceData.transactions.length} Transações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
