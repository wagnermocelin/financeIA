import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Download, Info } from 'lucide-react'
import { parseBankStatement, csvTemplate, importInstructions } from '../utils/bankStatementParser'
import { formatCurrency, formatDate } from '../utils/formatters'

const BankStatementImport = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const processFile = async () => {
    if (!file) return

    setProcessing(true)
    setError(null)

    try {
      const result = await parseBankStatement.processFile(file)
      
      if (result.success) {
        setResult(result)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar arquivo')
    } finally {
      setProcessing(false)
    }
  }

  const handleImport = () => {
    if (result && result.statements.length > 0) {
      onImport(result.statements)
      onClose()
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-extrato.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Instructions Toggle */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span className="font-medium">Como importar extratos bancários?</span>
        </div>
        <span className="text-sm">{showInstructions ? '▼' : '▶'}</span>
      </button>

      {/* Instructions */}
      {showInstructions && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{importInstructions.csv.title}</span>
            </h4>
            <p className="text-sm text-gray-600 mb-2">{importInstructions.csv.description}</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              {importInstructions.csv.required.map((req, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-primary-600">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Baixar template CSV de exemplo</span>
            </button>
          </div>

          <div className="border-t border-gray-300 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{importInstructions.ofx.title}</span>
            </h4>
            <p className="text-sm text-gray-600 mb-2">{importInstructions.ofx.description}</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              {importInstructions.ofx.required.map((req, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-primary-600">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          accept=".csv,.ofx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!file ? (
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              Clique para selecionar ou arraste o arquivo
            </p>
            <p className="text-sm text-gray-500">
              Formatos aceitos: CSV, OFX
            </p>
          </label>
        ) : (
          <div className="space-y-4">
            <FileText className="w-12 h-12 mx-auto text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remover arquivo
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Erro ao processar arquivo</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Processing Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">
                Arquivo processado com sucesso!
              </p>
              <p className="text-sm text-green-700 mt-1">
                {result.count} transações encontradas no formato {result.format}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 bg-white rounded-lg border border-green-200 overflow-hidden">
            <div className="px-4 py-2 bg-green-100 border-b border-green-200">
              <p className="text-sm font-medium text-green-900">
                Prévia das transações (primeiras 5)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Data</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Descrição</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {result.statements.slice(0, 5).map((stmt, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-600">
                        {formatDate(stmt.date)}
                      </td>
                      <td className="py-2 px-3 text-gray-900">
                        {stmt.description}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`badge ${
                          stmt.type === 'credit' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {stmt.type === 'credit' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${
                        stmt.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(stmt.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.count > 5 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-600">
                  + {result.count - 5} transações adicionais
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        
        {!result ? (
          <button
            onClick={processFile}
            disabled={!file || processing}
            className="btn btn-primary"
          >
            {processing ? 'Processando...' : 'Processar Arquivo'}
          </button>
        ) : (
          <button
            onClick={handleImport}
            className="btn btn-success flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Importar {result.count} Transações</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default BankStatementImport
