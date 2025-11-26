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
    
    const url = getWebServiceUrl('distribuicao')
    const agent = getCertificateAgent()
    
    // Converter datas para NSU (Número Sequencial Único)
    // Em produção, você precisaria manter controle dos NSUs
    const nsuInicial = '0' // Começar do zero ou último NSU processado
    
    // Montar XML de distribuição
    const xmlDistribuicao = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
  <soap:Header/>
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

    const response = await axios.post(url, xmlDistribuicao, {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe'
      },
      httpsAgent: agent,
      timeout: 60000
    })

    // Parse resposta XML
    const result = xmlParser.parse(response.data)
    
    console.log('✅ NF-e buscadas com sucesso')
    return parseDistribuicaoResponse(result, dataInicio, dataFim)
  } catch (error) {
    console.error('❌ Erro ao buscar NF-e:', error.message)
    throw error
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
    const envelope = xmlResult['soap:Envelope'] || xmlResult['soapenv:Envelope']
    const body = envelope['soap:Body'] || envelope['soapenv:Body']
    const response = body['nfeDistDFeInteresseResponse'] || body['nfeResultMsg']
    const retorno = response['retDistDFeInt']
    
    if (!retorno) {
      throw new Error('Resposta inválida da SEFAZ')
    }
    
    const cStat = retorno.cStat
    const xMotivo = retorno.xMotivo
    
    if (cStat !== '138') { // 138 = Documentos localizados
      return {
        success: true,
        nfes: [],
        total: 0,
        message: xMotivo
      }
    }
    
    // Processar documentos
    const documentos = retorno.loteDistDFeInt?.docZip || []
    const nfes = []
    
    for (const doc of Array.isArray(documentos) ? documentos : [documentos]) {
      try {
        // Decodificar e processar cada documento
        const xmlDoc = Buffer.from(doc['#text'], 'base64').toString('utf-8')
        const nfeData = xmlParser.parse(xmlDoc)
        
        // Extrair informações e adicionar à lista
        const nfe = parseNFeData(nfeData.nfeProc?.NFe?.infNFe || {})
        
        // Filtrar por período se necessário
        const dataEmissao = new Date(nfe.dataEmissao)
        const inicio = new Date(dataInicio)
        const fim = new Date(dataFim)
        
        if (dataEmissao >= inicio && dataEmissao <= fim) {
          nfes.push(nfe)
        }
      } catch (error) {
        console.warn('⚠️  Erro ao processar documento:', error.message)
      }
    }
    
    return {
      success: true,
      nfes: nfes.sort((a, b) => new Date(b.dataEmissao) - new Date(a.dataEmissao)),
      total: nfes.length,
      ultimoNSU: retorno.ultNSU || '0'
    }
  } catch (error) {
    console.error('❌ Erro ao fazer parse da distribuição:', error)
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
