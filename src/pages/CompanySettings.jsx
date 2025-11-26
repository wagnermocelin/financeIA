import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Building,
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Save,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const CompanySettings = () => {
  const [loading, setLoading] = useState(false)
  const [certificateStatus, setCertificateStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  
  // Dados da empresa
  const [companyData, setCompanyData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    uf: '35', // SP
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: 'SP',
      cep: ''
    }
  })

  // Dados do certificado
  const [certificateData, setCertificateData] = useState({
    file: null,
    password: '',
    environment: 'homologacao' // homologacao ou producao
  })

  // Modal de confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Carregar status do certificado ao montar
  useEffect(() => {
    loadCertificateStatus()
    loadCompanyData()
  }, [])

  const loadCertificateStatus = async () => {
    try {
      console.log('🔍 Carregando status do certificado de:', `${API_URL}/api/nfe/status`)
      const response = await fetch(`${API_URL}/api/nfe/status`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Status carregado:', data)
      setCertificateStatus(data)
    } catch (error) {
      console.error('❌ Erro ao carregar status do certificado:', error)
      // Não mostrar erro para o usuário, apenas no console
    }
  }

  const loadCompanyData = () => {
    // Carregar dados salvos do localStorage ou Supabase
    const saved = localStorage.getItem('companyData')
    if (saved) {
      setCompanyData(JSON.parse(saved))
    }
  }

  const handleCompanyDataChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value
      }
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.endsWith('.pfx') && !file.name.endsWith('.p12')) {
        alert('Por favor, selecione um arquivo .pfx ou .p12')
        return
      }
      
      setCertificateData(prev => ({
        ...prev,
        file
      }))
    }
  }

  const handleUploadCertificate = async () => {
    if (!certificateData.file) {
      alert('Selecione um arquivo de certificado')
      return
    }

    if (!certificateData.password) {
      alert('Digite a senha do certificado')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('certificate', certificateData.file)
      formData.append('password', certificateData.password)
      formData.append('environment', certificateData.environment)
      formData.append('cnpj', companyData.cnpj.replace(/\D/g, ''))

      console.log('📤 Enviando certificado para:', `${API_URL}/api/certificate/upload`)
      
      const response = await fetch(`${API_URL}/api/certificate/upload`, {
        method: 'POST',
        body: formData
      })

      console.log('📡 Resposta recebida:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer upload do certificado'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      console.log('✅ Certificado instalado:', result)
      alert('✅ Certificado instalado com sucesso!\n\n' +
            `CNPJ: ${result.certificate?.cnpj}\n` +
            `Válido até: ${new Date(result.certificate?.validTo).toLocaleDateString('pt-BR')}`)
      
      // Limpar dados sensíveis
      setCertificateData({
        file: null,
        password: '',
        environment: certificateData.environment
      })
      
      // Recarregar status
      await loadCertificateStatus()
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      
      let userMessage = error.message
      
      // Mensagens mais amigáveis
      if (error.message.includes('MAC was not validated')) {
        userMessage = '❌ Senha do certificado incorreta!\n\nVerifique:\n' +
                     '• A senha está correta?\n' +
                     '• Não há espaços extras?\n' +
                     '• Maiúsculas e minúsculas estão corretas?'
      } else if (error.message.includes('Invalid PKCS#12')) {
        userMessage = '❌ Certificado inválido!\n\nVerifique:\n' +
                     '• O arquivo é um certificado .pfx válido?\n' +
                     '• O arquivo não está corrompido?'
      }
      
      alert(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCertificate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/certificate/remove`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao remover certificado')
      }

      alert('✅ Certificado removido com sucesso!')
      await loadCertificateStatus()
    } catch (error) {
      console.error('Erro ao remover certificado:', error)
      alert(`❌ Erro: ${error.message}`)
    } finally {
      setLoading(false)
      setIsConfirmModalOpen(false)
    }
  }

  const handleSaveCompanyData = () => {
    // Salvar no localStorage (depois integrar com Supabase)
    localStorage.setItem('companyData', JSON.stringify(companyData))
    alert('✅ Dados da empresa salvos com sucesso!')
  }

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return value
  }

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d)/, '$1-$2')
  }

  const getDaysUntilExpiration = () => {
    if (!certificateStatus?.certificate?.daysUntilExpiration) return null
    return certificateStatus.certificate.daysUntilExpiration
  }

  const getExpirationColor = () => {
    const days = getDaysUntilExpiration()
    if (!days) return 'text-gray-600'
    if (days < 30) return 'text-red-600'
    if (days < 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações da Empresa</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os dados da empresa e certificado digital
          </p>
        </div>
      </div>

      {/* Dados da Empresa */}
      <Card title="Dados da Empresa" icon={Building}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                value={formatCNPJ(companyData.cnpj)}
                onChange={(e) => handleCompanyDataChange('cnpj', e.target.value)}
                className="input"
                placeholder="00.000.000/0000-00"
                maxLength="18"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Estadual
              </label>
              <input
                type="text"
                value={companyData.inscricaoEstadual}
                onChange={(e) => handleCompanyDataChange('inscricaoEstadual', e.target.value)}
                className="input"
                placeholder="000.000.000.000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                value={companyData.razaoSocial}
                onChange={(e) => handleCompanyDataChange('razaoSocial', e.target.value)}
                className="input"
                placeholder="EMPRESA EXEMPLO LTDA"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={companyData.nomeFantasia}
                onChange={(e) => handleCompanyDataChange('nomeFantasia', e.target.value)}
                className="input"
                placeholder="Empresa Exemplo"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logradouro
                </label>
                <input
                  type="text"
                  value={companyData.endereco.logradouro}
                  onChange={(e) => handleAddressChange('logradouro', e.target.value)}
                  className="input"
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={companyData.endereco.numero}
                  onChange={(e) => handleAddressChange('numero', e.target.value)}
                  className="input"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={companyData.endereco.complemento}
                  onChange={(e) => handleAddressChange('complemento', e.target.value)}
                  className="input"
                  placeholder="Sala, Andar, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={companyData.endereco.bairro}
                  onChange={(e) => handleAddressChange('bairro', e.target.value)}
                  className="input"
                  placeholder="Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={companyData.endereco.cidade}
                  onChange={(e) => handleAddressChange('cidade', e.target.value)}
                  className="input"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UF
                </label>
                <select
                  value={companyData.endereco.uf}
                  onChange={(e) => handleAddressChange('uf', e.target.value)}
                  className="input"
                >
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formatCEP(companyData.endereco.cep)}
                  onChange={(e) => handleAddressChange('cep', e.target.value)}
                  className="input"
                  placeholder="00000-000"
                  maxLength="9"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveCompanyData}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados da Empresa</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Certificado Digital */}
      <Card title="Certificado Digital" icon={Shield}>
        <div className="space-y-6">
          {/* Status do Certificado */}
          {certificateStatus && (
            <div className={`rounded-lg p-4 ${
              certificateStatus.certificate?.valid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {certificateStatus.certificate?.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {certificateStatus.certificate?.configured 
                        ? 'Certificado Instalado' 
                        : 'Nenhum Certificado Instalado'}
                    </h3>
                    
                    {certificateStatus.certificate?.configured && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-gray-700">
                          <strong>CNPJ:</strong> {certificateStatus.certificate.cnpj}
                        </p>
                        <p className={getExpirationColor()}>
                          <strong>Válido até:</strong> {new Date(certificateStatus.certificate.validTo).toLocaleDateString('pt-BR')}
                          {getDaysUntilExpiration() && (
                            <span className="ml-2">
                              ({getDaysUntilExpiration()} dias restantes)
                            </span>
                          )}
                        </p>
                        <p className="text-gray-700">
                          <strong>Ambiente:</strong> {certificateStatus.environment === 'producao' ? 'Produção' : 'Homologação'}
                        </p>
                        <p className="text-gray-700">
                          <strong>SEFAZ:</strong> 
                          <span className={certificateStatus.sefaz?.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                            {' '}{certificateStatus.sefaz?.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                          </span>
                        </p>
                      </div>
                    )}

                    {certificateStatus.certificate?.warning && (
                      <div className="mt-3 flex items-center space-x-2 text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{certificateStatus.certificate.warning}</span>
                      </div>
                    )}
                  </div>
                </div>

                {certificateStatus.certificate?.configured && (
                  <div className="flex space-x-2">
                    <button
                      onClick={loadCertificateStatus}
                      className="btn btn-secondary text-sm flex items-center space-x-1"
                      title="Atualizar status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction('remove')
                        setIsConfirmModalOpen(true)
                      }}
                      className="btn btn-danger text-sm flex items-center space-x-1"
                      title="Remover certificado"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remover</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload de Certificado */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {certificateStatus?.certificate?.configured ? 'Atualizar Certificado' : 'Instalar Certificado'}
            </h3>

            <div className="space-y-4">
              {/* Ambiente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiente SEFAZ
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="homologacao"
                      checked={certificateData.environment === 'homologacao'}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, environment: e.target.value }))}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">
                      Homologação (Testes)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="producao"
                      checked={certificateData.environment === 'producao'}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, environment: e.target.value }))}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">
                      Produção (Real)
                    </span>
                  </label>
                </div>
                {certificateData.environment === 'producao' && (
                  <p className="text-sm text-yellow-600 mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Atenção: Ambiente de produção gera obrigações fiscais reais!</span>
                  </p>
                )}
              </div>

              {/* Upload do arquivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo do Certificado (.pfx ou .p12)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {certificateData.file ? certificateData.file.name : 'Clique para selecionar o arquivo'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Formatos aceitos: .pfx, .p12
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha do Certificado
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={certificateData.password}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, password: e.target.value }))}
                    className="input pr-10"
                    placeholder="Digite a senha do certificado"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Botão de Upload */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleUploadCertificate}
                  disabled={loading || !certificateData.file || !certificateData.password}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Instalando...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Instalar Certificado</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Como obter um certificado digital:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Adquira um certificado A1 (arquivo .pfx) em uma Autoridade Certificadora</li>
                  <li>Autoridades: Serasa, Certisign, Valid, Soluti</li>
                  <li>Custo aproximado: R$ 150 a R$ 300 por ano</li>
                  <li>Validade: 1 ano (A1) ou 3 anos (A3)</li>
                  <li>Use homologação para testes antes de usar em produção</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Ação"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {confirmAction === 'remove' && 
              'Tem certeza que deseja remover o certificado digital? Esta ação não pode ser desfeita.'}
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAction === 'remove' ? handleRemoveCertificate : null}
              className="btn btn-danger"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CompanySettings
