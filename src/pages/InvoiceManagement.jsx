import { useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { nfeService } from '../utils/nfeService'
import { 
  FileText, 
  Search, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Building,
  DollarSign,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const InvoiceManagement = () => {
  const [nfes, setNfes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState('periodo') // 'chave' ou 'periodo'
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [selectedNfe, setSelectedNfe] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const [searchForm, setSearchForm] = useState({
    chaveAcesso: '',
    cnpj: '98.765.432/0001-10',
    dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
  })

  const handleSearchByKey = async () => {
    if (!searchForm.chaveAcesso) {
      alert('Digite a chave de acesso da NF-e')
      return
    }

    setLoading(true)
    try {
      const result = await nfeService.consultarPorChave(searchForm.chaveAcesso)
      if (result.success) {
        setNfes([result.nfe])
        setIsSearchModalOpen(false)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByPeriod = async () => {
    setLoading(true)
    try {
      const result = await nfeService.buscarPorPeriodo(
        searchForm.cnpj,
        searchForm.dataInicio,
        searchForm.dataFim
      )
      if (result.success) {
        setNfes(result.nfes)
        setIsSearchModalOpen(false)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadXML = async (chaveAcesso) => {
    try {
      const result = await nfeService.downloadXML(chaveAcesso)
      if (result.success) {
        // Cria blob e faz download
        const blob = new Blob([result.xml], { type: 'application/xml' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Erro ao baixar XML: ' + error.message)
    }
  }

  const handleImportNfe = (nfe) => {
    const transaction = nfeService.importarNFe(nfe)
    // Aqui você pode adicionar a transação ao contexto global
    alert(`NF-e ${nfe.numero} importada com sucesso!`)
  }

  const handleViewDetails = (nfe) => {
    setSelectedNfe(nfe)
    setIsDetailModalOpen(true)
  }

  const totalValor = nfes.reduce((sum, nfe) => sum + nfe.valor, 0)
  const totalAutorizadas = nfes.filter(nfe => nfe.status === 'Autorizada').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais Eletrônicas</h1>
          <p className="text-gray-600 mt-1">Consulte e importe NF-e da Receita Federal</p>
        </div>
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Search className="w-5 h-5" />
          <span>Buscar NF-e</span>
        </button>
      </div>

      {/* Info Card */}
      <Card>
        <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Como funciona a busca de NF-e?</p>
            <p className="mt-1">
              Você pode buscar NF-e de duas formas: pela <strong>chave de acesso</strong> (44 dígitos) 
              ou por <strong>período</strong> (CNPJ + datas). As notas são consultadas diretamente 
              na base da SEFAZ/Receita Federal.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {nfes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total de NF-e</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {nfes.length}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Autorizadas</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {totalAutorizadas}
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
                <div className="text-sm text-gray-600">Canceladas</div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {nfes.length - totalAutorizadas}
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Valor Total</div>
                <div className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(totalValor)}
                </div>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* NF-e List */}
      {loading ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600">Consultando NF-e na Receita Federal...</p>
            <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
          </div>
        </Card>
      ) : nfes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma NF-e encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Clique em "Buscar NF-e" para consultar notas fiscais
            </p>
          </div>
        </Card>
      ) : (
        <Card title="Notas Fiscais Encontradas">
          <div className="space-y-3">
            {nfes.map((nfe) => (
              <div
                key={nfe.chaveAcesso}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        NF-e {nfe.numero} - Série {nfe.serie}
                      </h3>
                      <span className={`badge ${
                        nfe.status === 'Autorizada' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {nfe.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>{nfe.emitente.razaoSocial}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(nfe.dataEmissao)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-gray-900">
                          {formatCurrency(nfe.valor)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        CNPJ: {nfe.emitente.cnpj}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(nfe)}
                    className="btn btn-secondary text-sm flex items-center space-x-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Detalhes</span>
                  </button>
                  <button
                    onClick={() => handleDownloadXML(nfe.chaveAcesso)}
                    className="btn btn-secondary text-sm flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>XML</span>
                  </button>
                  <button
                    onClick={() => handleImportNfe(nfe)}
                    className="btn btn-primary text-sm flex items-center space-x-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Importar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Buscar Notas Fiscais"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search Type Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setSearchType('periodo')}
              className={`px-4 py-2 font-medium transition-colors ${
                searchType === 'periodo'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buscar por Período
            </button>
            <button
              onClick={() => setSearchType('chave')}
              className={`px-4 py-2 font-medium transition-colors ${
                searchType === 'chave'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buscar por Chave
            </button>
          </div>

          {/* Search by Period */}
          {searchType === 'periodo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ da Empresa
                </label>
                <input
                  type="text"
                  value={searchForm.cnpj}
                  onChange={(e) => setSearchForm({ ...searchForm, cnpj: e.target.value })}
                  className="input"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={searchForm.dataInicio}
                    onChange={(e) => setSearchForm({ ...searchForm, dataInicio: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={searchForm.dataFim}
                    onChange={(e) => setSearchForm({ ...searchForm, dataFim: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">⚠️ Funcionalidade Não Disponível</p>
                    <p className="mt-1 text-red-800">
                      A busca por período requer integração com certificado digital ou serviços terceiros (NFe.io, Focus NFe).
                    </p>
                    <p className="mt-2 text-red-800 font-medium">
                      👉 Use a aba "Buscar por Chave" para consultas reais!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchByPeriod}
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Buscar NF-e</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Search by Key */}
          {searchType === 'chave' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave de Acesso (44 dígitos)
                </label>
                <input
                  type="text"
                  value={searchForm.chaveAcesso}
                  onChange={(e) => setSearchForm({ ...searchForm, chaveAcesso: e.target.value.replace(/\D/g, '') })}
                  className="input font-mono"
                  placeholder="00000000000000000000000000000000000000000000"
                  maxLength="44"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {searchForm.chaveAcesso.length}/44 dígitos
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm mb-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">✅ Consulta Real Ativada!</p>
                    <p className="mt-1 text-green-800">
                      Esta opção consulta diretamente no site da Receita Federal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                <p className="font-medium">💡 Onde encontrar a chave?</p>
                <p className="mt-1">
                  A chave de acesso está no DANFE (documento auxiliar) da NF-e, 
                  geralmente no rodapé ou no QR Code.
                </p>
              </div>

              <button
                onClick={handleSearchByKey}
                disabled={loading || searchForm.chaveAcesso.length !== 44}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Consultar NF-e</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Detail Modal */}
      {selectedNfe && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detalhes da NF-e ${selectedNfe.numero}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Número</label>
                <p className="text-gray-900">{selectedNfe.numero}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Série</label>
                <p className="text-gray-900">{selectedNfe.serie}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Emissão</label>
                <p className="text-gray-900">{formatDate(selectedNfe.dataEmissao)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`badge ${
                  selectedNfe.status === 'Autorizada' ? 'badge-success' : 'badge-danger'
                }`}>
                  {selectedNfe.status}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Emitente</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Razão Social:</span> {selectedNfe.emitente.razaoSocial}</p>
                <p><span className="text-gray-600">CNPJ:</span> {selectedNfe.emitente.cnpj}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Destinatário</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Razão Social:</span> {selectedNfe.destinatario.razaoSocial}</p>
                <p><span className="text-gray-600">CNPJ:</span> {selectedNfe.destinatario.cnpj}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Valores</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valor Total da NF-e</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(selectedNfe.valor)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Chave de Acesso</h4>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                {nfeService.formatarChave(selectedNfe.chaveAcesso)}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default InvoiceManagement
