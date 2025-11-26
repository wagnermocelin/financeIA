// Serviço para consulta e processamento de NF-e (Nota Fiscal Eletrônica)

const USE_REAL_API = true // Alternar entre API real e mock
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const nfeService = {
  // Consulta NF-e pela chave de acesso (44 dígitos)
  consultarPorChave: async (chaveAcesso) => {
    console.log('🔍 Consultando NF-e por chave:', chaveAcesso)
    
    // Valida chave de acesso (44 dígitos)
    const chaveClean = chaveAcesso.replace(/\D/g, '')
    if (!chaveClean || chaveClean.length !== 44) {
      throw new Error('Chave de acesso inválida. Deve conter 44 dígitos.')
    }

    if (!USE_REAL_API) {
      // Modo mock (desenvolvimento)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return {
        success: true,
        nfe: {
          chaveAcesso: chaveClean,
          numero: chaveClean.substring(25, 34),
          serie: chaveClean.substring(22, 25),
          dataEmissao: new Date().toISOString(),
          valor: Math.random() * 10000 + 1000,
          emitente: {
            cnpj: '12.345.678/0001-90',
            razaoSocial: 'FORNECEDOR EXEMPLO LTDA',
            nomeFantasia: 'Fornecedor Exemplo',
          },
          destinatario: {
            cnpj: '98.765.432/0001-10',
            razaoSocial: 'SUA EMPRESA LTDA',
          },
          status: 'Autorizada',
        }
      }
    }

    try {
      // Consulta via API Backend (com certificado digital)
      console.log('📡 Consultando via API Backend...')
      
      const response = await fetch(`${API_URL}/api/nfe/consultar-chave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chaveAcesso: chaveClean })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erro na consulta: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ NF-e consultada com sucesso')

      return {
        success: true,
        nfe: {
          chaveAcesso: result.chaveAcesso,
          numero: result.nfe.numero,
          serie: result.nfe.serie,
          dataEmissao: result.nfe.dataEmissao,
          valor: result.nfe.valor,
          emitente: result.nfe.emitente,
          destinatario: result.nfe.destinatario,
          status: result.status,
          protocolo: result.protocolo,
          tipo: 'Entrada'
        }
      }
    } catch (error) {
      console.error('❌ Erro ao consultar NF-e:', error)
      throw new Error(`Erro ao consultar NF-e: ${error.message}`)
    }
  },

  // Busca NF-e por período e CNPJ
  buscarPorPeriodo: async (cnpj, dataInicio, dataFim) => {
    console.log('🔍 Buscando NF-e por período:', { cnpj, dataInicio, dataFim })
    
    if (!USE_REAL_API) {
      throw new Error('Busca por período requer API backend configurada')
    }

    try {
      // Busca via API Backend (com certificado digital)
      console.log('📡 Buscando via API Backend...')
      
      const response = await fetch(`${API_URL}/api/nfe/buscar-periodo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          cnpj: cnpj.replace(/\D/g, ''),
          dataInicio,
          dataFim
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erro na busca: ${response.status}`)
      }

      const result = await response.json()
      console.log(`✅ ${result.total} NF-e(s) encontrada(s)`)

      return {
        success: true,
        nfes: result.nfes.map(nfe => ({
          ...nfe,
          tipo: 'Entrada',
          status: 'Autorizada'
        })),
        total: result.total
      }
    } catch (error) {
      console.error('❌ Erro ao buscar NF-e:', error)
      throw new Error(`Erro ao buscar NF-e: ${error.message}`)
    }
  },

  // Parser de XML de NF-e
  parseXML: (xmlContent) => {
    try {
      // Simula parsing de XML
      // Em produção, usar DOMParser ou biblioteca XML
      
      // Extrai informações básicas do XML
      const chaveMatch = xmlContent.match(/<chNFe>(\d{44})<\/chNFe>/)
      const numeroMatch = xmlContent.match(/<nNF>(\d+)<\/nNF>/)
      const serieMatch = xmlContent.match(/<serie>(\d+)<\/serie>/)
      const dataMatch = xmlContent.match(/<dhEmi>([\d\-T:]+)<\/dhEmi>/)
      const valorMatch = xmlContent.match(/<vNF>([\d.]+)<\/vNF>/)
      
      if (!chaveMatch) {
        throw new Error('XML inválido: chave de acesso não encontrada')
      }

      return {
        success: true,
        nfe: {
          chaveAcesso: chaveMatch[1],
          numero: numeroMatch?.[1] || '',
          serie: serieMatch?.[1] || '001',
          dataEmissao: dataMatch?.[1] || new Date().toISOString(),
          valor: parseFloat(valorMatch?.[1] || '0'),
          status: 'Autorizada',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Valida chave de acesso
  validarChave: (chave) => {
    if (!chave) return false
    
    // Remove espaços e caracteres especiais
    const chaveClean = chave.replace(/\D/g, '')
    
    // Deve ter 44 dígitos
    if (chaveClean.length !== 44) return false
    
    // Valida dígito verificador (último dígito)
    // Implementação simplificada
    return true
  },

  // Extrai informações da chave de acesso
  extrairInfoChave: (chave) => {
    if (!chave || chave.length !== 44) return null

    return {
      uf: chave.substring(0, 2),
      anoMes: chave.substring(2, 6),
      cnpj: chave.substring(6, 20),
      modelo: chave.substring(20, 22),
      serie: chave.substring(22, 25),
      numero: chave.substring(25, 34),
      tipoEmissao: chave.substring(34, 35),
      codigo: chave.substring(35, 43),
      dv: chave.substring(43, 44),
    }
  },

  // Formata chave de acesso para exibição
  formatarChave: (chave) => {
    if (!chave || chave.length !== 44) return chave
    
    // Formato: 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999 9999
    return chave.match(/.{1,4}/g)?.join(' ') || chave
  },

  // Download de XML da NF-e
  downloadXML: async (chaveAcesso) => {
    // Simula download do XML
    // Em produção, fazer requisição à SEFAZ ou serviço terceiro
    await new Promise(resolve => setTimeout(resolve, 1500))

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc>
  <NFe>
    <infNFe>
      <ide>
        <cUF>35</cUF>
        <nNF>${chaveAcesso.substring(25, 34)}</nNF>
        <serie>${chaveAcesso.substring(22, 25)}</serie>
        <dhEmi>${new Date().toISOString()}</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>FORNECEDOR EXEMPLO LTDA</xNome>
      </emit>
      <dest>
        <CNPJ>98765432000110</CNPJ>
        <xNome>SUA EMPRESA LTDA</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>1000.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <chNFe>${chaveAcesso}</chNFe>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`

    return {
      success: true,
      xml,
      filename: `NFe${chaveAcesso}.xml`,
    }
  },

  // Importa NF-e para o sistema
  importarNFe: (nfe) => {
    // Converte NF-e para transação
    return {
      id: `nfe-${nfe.chaveAcesso}`,
      description: `NF-e ${nfe.numero} - ${nfe.emitente.razaoSocial}`,
      amount: nfe.valor,
      type: nfe.tipo === 'Entrada' ? 'expense' : 'income',
      category: 'Fornecedores',
      date: nfe.dataEmissao,
      nfeChave: nfe.chaveAcesso,
      nfeNumero: nfe.numero,
      supplier: nfe.emitente.razaoSocial,
      supplierCnpj: nfe.emitente.cnpj,
      reconciled: false,
      status: 'pending',
      imported: true,
      source: 'nfe',
    }
  },
}

// Parse do HTML retornado pela Receita Federal
function parseNFeHTML(html, chaveAcesso) {
  console.log('🔍 Fazendo parse do HTML da Receita...')
  
  try {
    // Cria um parser DOM
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Extrai informações do HTML
    const getTextContent = (selector) => {
      const element = doc.querySelector(selector)
      return element?.textContent?.trim() || ''
    }
    
    // Busca por padrões comuns no HTML da Receita
    const numero = chaveAcesso.substring(25, 34)
    const serie = chaveAcesso.substring(22, 25)
    
    // Tenta extrair dados do HTML
    let razaoSocialEmitente = ''
    let cnpjEmitente = ''
    let valorNota = 0
    let dataEmissao = ''
    let status = 'Autorizada'
    
    // Procura por padrões no HTML
    const htmlText = html.toLowerCase()
    
    // Verifica se a NF-e foi encontrada
    if (htmlText.includes('não encontrada') || htmlText.includes('inexistente')) {
      throw new Error('NF-e não encontrada na base da Receita Federal')
    }
    
    if (htmlText.includes('cancelada')) {
      status = 'Cancelada'
    } else if (htmlText.includes('denegada')) {
      status = 'Denegada'
    }
    
    // Extrai valor (procura por padrões de valor)
    const valorMatch = html.match(/R\$\s*([\d.,]+)/i) || html.match(/valor.*?([\d.,]+)/i)
    if (valorMatch) {
      valorNota = parseFloat(valorMatch[1].replace(/\./g, '').replace(',', '.'))
    }
    
    // Extrai CNPJ do emitente
    const cnpjMatch = html.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)
    if (cnpjMatch) {
      cnpjEmitente = cnpjMatch[1]
    }
    
    // Extrai razão social (procura por padrões)
    const razaoMatch = html.match(/Razão Social[:\s]*(.*?)(?:<|$)/i) || 
                      html.match(/Emitente[:\s]*(.*?)(?:<|$)/i)
    if (razaoMatch) {
      razaoSocialEmitente = razaoMatch[1].trim()
    }
    
    // Extrai data de emissão
    const dataMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/)
    if (dataMatch) {
      const [dia, mes, ano] = dataMatch[1].split('/')
      dataEmissao = new Date(ano, mes - 1, dia).toISOString()
    } else {
      dataEmissao = new Date().toISOString()
    }
    
    console.log('✅ Parse concluído:', { razaoSocialEmitente, cnpjEmitente, valorNota, status })
    
    return {
      chaveAcesso,
      numero,
      serie,
      dataEmissao,
      valor: valorNota || 0,
      emitente: {
        cnpj: cnpjEmitente || 'Não identificado',
        razaoSocial: razaoSocialEmitente || 'Não identificado',
        nomeFantasia: razaoSocialEmitente || 'Não identificado',
      },
      destinatario: {
        cnpj: '98.765.432/0001-10',
        razaoSocial: 'SUA EMPRESA LTDA',
      },
      status,
      tipo: 'Entrada',
    }
  } catch (error) {
    console.error('❌ Erro no parse:', error)
    // Retorna dados básicos da chave se o parse falhar
    return {
      chaveAcesso,
      numero: chaveAcesso.substring(25, 34),
      serie: chaveAcesso.substring(22, 25),
      dataEmissao: new Date().toISOString(),
      valor: 0,
      emitente: {
        cnpj: 'Não identificado',
        razaoSocial: 'Consulte manualmente',
        nomeFantasia: 'Consulte manualmente',
      },
      destinatario: {
        cnpj: '98.765.432/0001-10',
        razaoSocial: 'SUA EMPRESA LTDA',
      },
      status: 'Consulta parcial',
      tipo: 'Entrada',
    }
  }
}

// Funções auxiliares
function gerarChaveAcessoSimulada(cnpj, numero) {
  const cnpjClean = cnpj.replace(/\D/g, '').padStart(14, '0')
  const uf = '35' // SP
  const anoMes = new Date().getFullYear().toString().substring(2) + String(new Date().getMonth() + 1).padStart(2, '0')
  const modelo = '55'
  const serie = '001'
  const numeroNF = numero.padStart(9, '0')
  const tipoEmissao = '1'
  const codigo = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  const dv = '0'
  
  return uf + anoMes + cnpjClean + modelo + serie + numeroNF + tipoEmissao + codigo + dv
}

function gerarDataAleatoria(inicio, fim) {
  const start = new Date(inicio).getTime()
  const end = new Date(fim).getTime()
  const random = start + Math.random() * (end - start)
  return new Date(random).toISOString()
}

function gerarCNPJAleatorio() {
  const num = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
  return `${num.substring(0, 2)}.${num.substring(2, 5)}.${num.substring(5, 8)}/0001-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`
}

// Instruções para integração real
export const nfeIntegrationGuide = {
  title: 'Integração com NF-e',
  description: 'Para integrar com dados reais de NF-e, você pode usar:',
  options: [
    {
      name: 'API SEFAZ',
      description: 'Acesso direto às APIs das Secretarias de Fazenda estaduais',
      requirements: ['Certificado Digital A1 ou A3', 'CNPJ da empresa', 'Credenciais de acesso'],
      complexity: 'Alta',
    },
    {
      name: 'Serviços Terceiros',
      description: 'Empresas que facilitam o acesso às NF-e',
      examples: ['NFe.io', 'Focus NFe', 'Bling', 'Omie'],
      complexity: 'Média',
    },
    {
      name: 'Portal da Nota Fiscal',
      description: 'Consulta manual no site da SEFAZ',
      url: 'https://www.nfe.fazenda.gov.br/portal/consulta.aspx',
      complexity: 'Baixa',
    },
  ],
  steps: [
    'Obter certificado digital da empresa',
    'Cadastrar empresa no portal da SEFAZ',
    'Configurar credenciais de API',
    'Implementar autenticação com certificado',
    'Fazer requisições às APIs da SEFAZ',
  ],
}
