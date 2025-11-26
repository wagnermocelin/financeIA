import express from 'express'
import { 
  consultarNFePorChave, 
  buscarNFePorPeriodo, 
  downloadXML,
  verificarStatusServico 
} from '../services/sefazService.js'
import { 
  getCertificateInfo, 
  isCertificateValid,
  getDaysUntilExpiration 
} from '../services/certificateService.js'

const router = express.Router()

/**
 * GET /api/nfe/status
 * Verifica status do serviço e certificado
 */
router.get('/status', async (req, res) => {
  try {
    const certInfo = getCertificateInfo()
    const certValid = isCertificateValid()
    const daysUntilExpiration = getDaysUntilExpiration()
    const sefazStatus = await verificarStatusServico()
    
    res.json({
      success: true,
      certificate: {
        configured: !!certInfo,
        valid: certValid,
        cnpj: certInfo?.cnpj || 'N/A',
        validTo: certInfo?.validTo || 'N/A',
        daysUntilExpiration,
        warning: daysUntilExpiration && daysUntilExpiration < 30 ? 
          'Certificado próximo do vencimento!' : null
      },
      sefaz: sefazStatus,
      environment: process.env.SEFAZ_ENVIRONMENT || 'homologacao',
      uf: process.env.UF_CODE || '35'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/nfe/consultar-chave
 * Consulta NF-e pela chave de acesso
 * 
 * Body: { chaveAcesso: string }
 */
router.post('/consultar-chave', async (req, res) => {
  try {
    const { chaveAcesso } = req.body
    
    if (!chaveAcesso) {
      return res.status(400).json({
        success: false,
        error: 'Chave de acesso é obrigatória'
      })
    }
    
    // Validar formato da chave
    const chaveClean = chaveAcesso.replace(/\D/g, '')
    if (chaveClean.length !== 44) {
      return res.status(400).json({
        success: false,
        error: 'Chave de acesso inválida. Deve conter 44 dígitos.'
      })
    }
    
    const result = await consultarNFePorChave(chaveClean)
    res.json(result)
  } catch (error) {
    console.error('❌ Erro na rota consultar-chave:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/nfe/buscar-periodo
 * Busca NF-e por período usando Distribuição DFe
 * 
 * Body: { 
 *   cnpj: string,
 *   dataInicio: string (YYYY-MM-DD),
 *   dataFim: string (YYYY-MM-DD)
 * }
 */
router.post('/buscar-periodo', async (req, res) => {
  try {
    const { cnpj, dataInicio, dataFim } = req.body
    
    if (!cnpj || !dataInicio || !dataFim) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ, dataInicio e dataFim são obrigatórios'
      })
    }
    
    // Validar CNPJ
    const cnpjClean = cnpj.replace(/\D/g, '')
    if (cnpjClean.length !== 14) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ inválido'
      })
    }
    
    // Validar datas
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Datas inválidas'
      })
    }
    
    if (inicio > fim) {
      return res.status(400).json({
        success: false,
        error: 'Data início deve ser anterior à data fim'
      })
    }
    
    // Limitar período a 90 dias
    const diffDays = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24))
    if (diffDays > 90) {
      return res.status(400).json({
        success: false,
        error: 'Período máximo de busca é 90 dias'
      })
    }
    
    const result = await buscarNFePorPeriodo(cnpjClean, dataInicio, dataFim)
    res.json(result)
  } catch (error) {
    console.error('❌ Erro na rota buscar-periodo:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/nfe/download-xml
 * Download do XML da NF-e
 * 
 * Body: { chaveAcesso: string }
 */
router.post('/download-xml', async (req, res) => {
  try {
    const { chaveAcesso } = req.body
    
    if (!chaveAcesso) {
      return res.status(400).json({
        success: false,
        error: 'Chave de acesso é obrigatória'
      })
    }
    
    const chaveClean = chaveAcesso.replace(/\D/g, '')
    if (chaveClean.length !== 44) {
      return res.status(400).json({
        success: false,
        error: 'Chave de acesso inválida'
      })
    }
    
    const result = await downloadXML(chaveClean)
    
    // Retornar XML como download
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
    res.send(result.xml)
  } catch (error) {
    console.error('❌ Erro na rota download-xml:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/nfe/distribuicao
 * Busca documentos fiscais via Distribuição DFe
 * (Método alternativo mais eficiente)
 * 
 * Body: { 
 *   cnpj: string,
 *   ultNSU?: string (último NSU processado)
 * }
 */
router.post('/distribuicao', async (req, res) => {
  try {
    const { cnpj, ultNSU = '0' } = req.body
    
    if (!cnpj) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ é obrigatório'
      })
    }
    
    const cnpjClean = cnpj.replace(/\D/g, '')
    if (cnpjClean.length !== 14) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ inválido'
      })
    }
    
    // Usar busca por período com NSU
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    const result = await buscarNFePorPeriodo(
      cnpjClean,
      trintaDiasAtras.toISOString().split('T')[0],
      hoje.toISOString().split('T')[0]
    )
    
    res.json(result)
  } catch (error) {
    console.error('❌ Erro na rota distribuicao:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
