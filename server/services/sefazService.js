import axios from 'axios'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { getCertificateAgent } from './certificateService.js'

// URLs dos Web Services da SEFAZ por UF
const SEFAZ_URLS = {
  // Produção
  producao: {
    '35': 'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx', // SP
    '33': 'https://nfe.fazenda.rj.gov.br/ws/nfestatusservico4.asmx', // RJ
    '31': 'https://nfe.fazenda.mg.gov.br/ws/nfestatusservico4.asmx', // MG
    '43': 'https://nfe.sefaz.rs.gov.br/ws/nfestatusservico4.asmx',   // RS
    '41': 'https://nfe.sefa.pr.gov.br/ws/nfestatusservico4.asmx',    // PR
    '29': 'https://nfe.sefaz.ba.gov.br/ws/nfestatusservico4.asmx',   // BA
    '53': 'https://nfe.sefaz.df.gov.br/ws/nfestatusservico4.asmx',   // DF
    // Adicione mais UFs conforme necessário
  },
  // Homologação
  homologacao: {
    '35': 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
    '33': 'https://homologacao.nfe.fazenda.rj.gov.br/ws/nfestatusservico4.asmx',
    '31': 'https://homologacao.nfe.fazenda.mg.gov.br/ws/nfestatusservico4.asmx',
    '43': 'https://nfe-homologacao.sefaz.rs.gov.br/ws/nfestatusservico4.asmx',
    '41': 'https://homologacao.nfe.sefa.pr.gov.br/ws/nfestatusservico4.asmx',
    '29': 'https://hnfe.sefaz.ba.gov.br/ws/nfestatusservico4.asmx',
    '53': 'https://hom.nfe.fazenda.df.gov.br/ws/nfestatusservico4.asmx',
  }
}

// Serviço de Distribuição DFe (Nacional)
const DFE_URLS = {
  producao: 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
  homologacao: 'https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx'
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

/**
 * Obtém URL do web service baseado na UF e ambiente
 */
const getWebServiceUrl = (service = 'status') => {
  const environment = process.env.SEFAZ_ENVIRONMENT || 'homologacao'
  const ufCode = process.env.UF_CODE || '35'
  
  if (service === 'distribuicao') {
    return DFE_URLS[environment]
  }
  
  return SEFAZ_URLS[environment][ufCode] || SEFAZ_URLS[environment]['35']
}

/**
 * Consulta NF-e pela chave de acesso
 */
export const consultarNFePorChave = async (chaveAcesso) => {
  try {
    console.log('🔍 Consultando NF-e:', chaveAcesso)
    
    const url = getWebServiceUrl('consulta')
    const agent = getCertificateAgent()
    
    // Montar XML de consulta
    const xmlConsulta = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4">
  <soap:Header/>
  <soap:Body>
    <nfe:nfeConsultaNF>
      <nfe:nfeDadosMsg>
        <consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
          <tpAmb>${process.env.SEFAZ_ENVIRONMENT === 'producao' ? '1' : '2'}</tpAmb>
          <xServ>CONSULTAR</xServ>
          <chNFe>${chaveAcesso}</chNFe>
        </consSitNFe>
      </nfe:nfeDadosMsg>
    </nfe:nfeConsultaNF>
  </soap:Body>
</soap:Envelope>`

    const response = await axios.post(url, xmlConsulta, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4'
      },
      httpsAgent: agent,
      timeout: 30000
    })

    // Parse resposta XML
    const result = xmlParser.parse(response.data)
    
    console.log('✅ NF-e consultada com sucesso')
    return parseNFeConsultaResponse(result)
  } catch (error) {
    console.error('❌ Erro ao consultar NF-e:', error.message)
    throw error
  }
}

/**
 * Busca NF-e por período usando Distribuição DFe
 */
export const buscarNFePorPeriodo = async (cnpj, dataInicio, dataFim) => {
  try {
    console.log('🔍 Buscando NF-e por período:', { cnpj, dataInicio, dataFim })
    console.log('⚠️  AVISO: Busca por período requer configuração avançada da SEFAZ')
    
    const url = getWebServiceUrl('distribuicao')
    const agent = getCertificateAgent()
    
    console.log('📡 URL da SEFAZ:', url)
    console.log('🔐 Agente HTTPS configurado')
    
    // Converter datas para NSU (Número Sequencial Único)
    // IMPORTANTE: A SEFAZ retorna o próximo NSU a ser usado
    // Por enquanto, vamos usar 0 mas em produção deve-se salvar o último NSU
    const nsuInicial = '000000000000000' // 15 dígitos - começar do zero
    
    console.log('⚠️  IMPORTANTE: Se receber erro 656, aguarde 1 hora ou use o NSU retornado')
    console.log('   NSU inicial:', nsuInicial)
    
    // Montar XML de distribuição (formato correto sem CDATA)
    const xmlDistribuicao = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
  <soap:Body>
    <nfe:nfeDistDFeInteresse>
      <nfe:nfeDadosMsg>
        <distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">
          <tpAmb>${process.env.SEFAZ_ENVIRONMENT === 'producao' ? '1' : '2'}</tpAmb>
          <cUFAutor>${process.env.UF_CODE || '35'}</cUFAutor>
          <CNPJ>${cnpj.replace(/\D/g, '')}</CNPJ>
          <distNSU>
            <ultNSU>${nsuInicial}</ultNSU>
          </distNSU>
        </distDFeInt>
      </nfe:nfeDadosMsg>
    </nfe:nfeDistDFeInteresse>
  </soap:Body>
</soap:Envelope>`

    console.log('📄 XML enviado (primeiros 500 chars):')
    console.log(xmlDistribuicao.substring(0, 500))

    console.log('📤 Enviando requisição para SEFAZ...')

    const response = await axios.post(url, xmlDistribuicao, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'SOAPAction': ''
      },
      httpsAgent: agent,
      timeout: 60000
    })

    console.log('📥 Resposta recebida da SEFAZ')
    console.log('Status:', response.status)
    console.log('Tamanho da resposta:', response.data?.length, 'bytes')

    // Salvar resposta para debug
    console.log('📄 Primeiros 500 caracteres da resposta:')
    console.log(response.data?.substring(0, 500))

    // Parse resposta XML
    const result = xmlParser.parse(response.data)
    
    console.log('✅ XML parseado, processando resposta...')
    return parseDistribuicaoResponse(result, dataInicio, dataFim)
  } catch (error) {
    console.error('❌ Erro ao buscar NF-e:', error.message)
    
    // Se falhar, retornar mensagem explicativa
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Não foi possível conectar à SEFAZ. Verifique sua conexão e certificado.')
    }
    
    if (error.response) {
      console.error('Resposta da SEFAZ:', error.response.status, error.response.statusText)
      console.error('Dados:', error.response.data?.substring(0, 500))
    }
    
    throw new Error(`Erro na busca: ${error.message}. A busca por período requer configuração avançada do certificado e pode não estar disponível em homologação.`)
  }
}

/**
 * Download do XML da NF-e
 */
export const downloadXML = async (chaveAcesso) => {
  try {
    console.log('📥 Baixando XML da NF-e:', chaveAcesso)
    
    // Primeiro consulta a NF-e para obter o protocolo
    const nfe = await consultarNFePorChave(chaveAcesso)
    
    if (!nfe.xml) {
      throw new Error('XML não disponível para esta NF-e')
    }
    
    console.log('✅ XML baixado com sucesso')
    return {
      success: true,
      xml: nfe.xml,
      filename: `NFe${chaveAcesso}.xml`
    }
  } catch (error) {
    console.error('❌ Erro ao baixar XML:', error.message)
    throw error
  }
}

/**
 * Parse da resposta de consulta de NF-e
 */
const parseNFeConsultaResponse = (xmlResult) => {
  try {
    // Navegar pela estrutura SOAP
    const envelope = xmlResult['soap:Envelope'] || xmlResult['soapenv:Envelope']
    const body = envelope['soap:Body'] || envelope['soapenv:Body']
    const response = body['nfeConsultaNFResponse'] || body['nfeResultMsg']
    const retorno = response['retConsSitNFe']
    
    if (!retorno) {
      throw new Error('Resposta inválida da SEFAZ')
    }
    
    const cStat = retorno.cStat
    const xMotivo = retorno.xMotivo
    
    if (cStat !== '100') {
      throw new Error(`SEFAZ: ${xMotivo} (${cStat})`)
    }
    
    // Extrair dados da NF-e
    const protNFe = retorno.protNFe
    const infProt = protNFe?.infProt
    const nfe = retorno.protNFe?.infNFe || {}
    
    return {
      success: true,
      chaveAcesso: infProt?.chNFe || '',
      status: xMotivo,
      protocolo: infProt?.nProt || '',
      dataAutorizacao: infProt?.dhRecbto || '',
      nfe: parseNFeData(nfe),
      xml: xmlBuilder.build(retorno)
    }
  } catch (error) {
    console.error('❌ Erro ao fazer parse da resposta:', error)
    throw error
  }
}

/**
 * Parse dos dados da NF-e
 */
const parseNFeData = (nfeXml) => {
  try {
    const ide = nfeXml.ide || {}
    const emit = nfeXml.emit || {}
    const dest = nfeXml.dest || {}
    const total = nfeXml.total?.ICMSTot || {}
    
    return {
      numero: ide.nNF || '',
      serie: ide.serie || '',
      dataEmissao: ide.dhEmi || ide.dEmi || '',
      valor: parseFloat(total.vNF || 0),
      emitente: {
        cnpj: emit.CNPJ || '',
        razaoSocial: emit.xNome || '',
        nomeFantasia: emit.xFant || emit.xNome || ''
      },
      destinatario: {
        cnpj: dest.CNPJ || dest.CPF || '',
        razaoSocial: dest.xNome || ''
      },
      totais: {
        valorProdutos: parseFloat(total.vProd || 0),
        valorNota: parseFloat(total.vNF || 0),
        valorICMS: parseFloat(total.vICMS || 0),
        valorIPI: parseFloat(total.vIPI || 0)
      }
    }
  } catch (error) {
    console.error('❌ Erro ao fazer parse dos dados da NF-e:', error)
    return {}
  }
}

/**
 * Parse da resposta de distribuição
 */
const parseDistribuicaoResponse = (xmlResult, dataInicio, dataFim) => {
  try {
    console.log('🔍 Fazendo parse da resposta da SEFAZ...')
    
    // Tentar diferentes estruturas de resposta
    const envelope = xmlResult['soap12:Envelope'] || xmlResult['soap:Envelope'] || xmlResult['soapenv:Envelope']
    
    if (!envelope) {
      console.error('❌ Estrutura SOAP não encontrada')
      console.log('Estrutura recebida:', Object.keys(xmlResult))
      throw new Error('Resposta inválida da SEFAZ - estrutura SOAP não encontrada')
    }
    
    const body = envelope['soap12:Body'] || envelope['soap:Body'] || envelope['soapenv:Body']
    
    if (!body) {
      console.error('❌ Body SOAP não encontrado')
      throw new Error('Resposta inválida da SEFAZ - body não encontrado')
    }
    
    const response = body['nfeDistDFeInteresseResponse'] || body['nfeResultMsg']
    
    if (!response) {
      console.error('❌ Resposta nfeDistDFeInteresse não encontrada')
      console.log('Body disponível:', Object.keys(body))
      throw new Error('Resposta inválida da SEFAZ - resposta não encontrada')
    }
    
    let retorno = response['nfeDistDFeInteresseResult']
    
    if (!retorno) {
      console.error('❌ nfeDistDFeInteresseResult não encontrado')
      console.log('Response disponível:', Object.keys(response))
      throw new Error('Resposta inválida da SEFAZ - nfeDistDFeInteresseResult não encontrado')
    }
    
    // O retorno pode estar dentro de retDistDFeInt
    if (retorno.retDistDFeInt) {
      retorno = retorno.retDistDFeInt
    }
    
    console.log('📦 Estrutura completa do retorno:', JSON.stringify(retorno, null, 2))
    
    const cStat = retorno.cStat || retorno['@_cStat']
    const xMotivo = retorno.xMotivo || retorno['@_xMotivo']
    const ultNSU = retorno.ultNSU || retorno.maxNSU || retorno['@_ultNSU']
    
    console.log(`📊 Status SEFAZ: ${cStat} - ${xMotivo}`)
    console.log(`📊 NSU: ${ultNSU}`)
    console.log(`📊 Chaves do retorno:`, Object.keys(retorno))
    
    // Códigos de retorno comuns:
    // 137 = Nenhum documento localizado
    // 138 = Documentos localizados
    // 656 = Consumo indevido
    // 656 = Rejeição: Consumo Indevido
    
    if (cStat === '137') {
      console.log('ℹ️  Nenhum documento localizado no período')
      console.log('⚠️  IMPORTANTE: Isso pode significar que:')
      console.log('   1. Não há NF-e no período para este CNPJ')
      console.log('   2. O NSU inicial está incorreto')
      console.log('   3. Ambiente de homologação não tem dados')
      console.log('   4. CNPJ não está autorizado para consulta')
      return {
        success: true,
        nfes: [],
        total: 0,
        message: 'Nenhuma NF-e encontrada no período informado'
      }
    }
    
    if (cStat === '656') {
      console.warn(`⚠️  Código 656: Consumo Indevido`)
      console.warn(`⚠️  Próximo NSU a usar: ${ultNSU}`)
      console.warn(`⚠️  Aguarde 1 hora antes de consultar novamente`)
      console.warn(`⚠️  OU implemente cache de NSU para consultas incrementais`)
      return {
        success: true,
        nfes: [],
        total: 0,
        message: `Limite de consultas atingido. Aguarde 1 hora. Próximo NSU: ${ultNSU}`,
        nextNSU: ultNSU
      }
    }
    
    if (cStat !== '138') {
      console.warn(`⚠️  Status não esperado: ${cStat} - ${xMotivo}`)
      console.warn(`⚠️  Possíveis causas:`)
      console.warn(`   - Código 217: CNPJ não autorizado`)
      console.warn(`   - Código 252: Ambiente de homologação`)
      console.warn(`   - Código 656: Consulta muito frequente (aguarde 1h)`)
      return {
        success: true,
        nfes: [],
        total: 0,
        message: `${xMotivo} (Código: ${cStat})`
      }
    }
    
    // Processar documentos
    const documentos = retorno.loteDistDFeInt?.docZip || []
    const nfes = []
    
    console.log(`📦 Processando ${Array.isArray(documentos) ? documentos.length : 1} documento(s)...`)
    
    for (const doc of Array.isArray(documentos) ? documentos : [documentos]) {
      try {
        // Decodificar e processar cada documento
        const xmlDoc = Buffer.from(doc['#text'] || doc, 'base64').toString('utf-8')
        const nfeData = xmlParser.parse(xmlDoc)
        
        // Extrair informações e adicionar à lista
        const nfe = parseNFeData(nfeData.nfeProc?.NFe?.infNFe || nfeData.NFe?.infNFe || {})
        
        // Filtrar por período se necessário
        if (nfe.dataEmissao) {
          const dataEmissao = new Date(nfe.dataEmissao)
          const inicio = new Date(dataInicio)
          const fim = new Date(dataFim)
          
          if (dataEmissao >= inicio && dataEmissao <= fim) {
            nfes.push(nfe)
            console.log(`✅ NF-e ${nfe.numero} adicionada`)
          }
        } else {
          nfes.push(nfe)
        }
      } catch (error) {
        console.warn('⚠️  Erro ao processar documento:', error.message)
      }
    }
    
    console.log(`✅ Total de ${nfes.length} NF-e(s) processada(s)`)
    
    return {
      success: true,
      nfes: nfes.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao)),
      total: nfes.length,
      ultimoNSU: retorno.ultNSU || retorno.maxNSU || '0'
    }
  } catch (error) {
    console.error('❌ Erro ao fazer parse da distribuição:', error.message)
    console.error('Stack:', error.stack)
    throw error
  }
}

/**
 * Verifica status do serviço da SEFAZ
 */
export const verificarStatusServico = async () => {
  try {
    const url = getWebServiceUrl('status')
    const agent = getCertificateAgent()
    
    const xmlStatus = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">
  <soap:Header/>
  <soap:Body>
    <nfe:nfeStatusServicoNF>
      <nfe:nfeDadosMsg>
        <consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
          <tpAmb>${process.env.SEFAZ_ENVIRONMENT === 'producao' ? '1' : '2'}</tpAmb>
          <cUF>${process.env.UF_CODE || '35'}</cUF>
          <xServ>STATUS</xServ>
        </consStatServ>
      </nfe:nfeDadosMsg>
    </nfe:nfeStatusServicoNF>
  </soap:Body>
</soap:Envelope>`

    const response = await axios.post(url, xmlStatus, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8'
      },
      httpsAgent: agent,
      timeout: 10000
    })

    const result = xmlParser.parse(response.data)
    const envelope = result['soap:Envelope'] || result['soapenv:Envelope']
    const body = envelope['soap:Body'] || envelope['soapenv:Body']
    const retorno = body['nfeStatusServicoNFResponse']?.retConsStatServ
    
    return {
      success: true,
      status: retorno?.cStat === '107' ? 'online' : 'offline',
      message: retorno?.xMotivo || 'Status desconhecido'
    }
  } catch (error) {
    return {
      success: false,
      status: 'offline',
      message: error.message
    }
  }
}
