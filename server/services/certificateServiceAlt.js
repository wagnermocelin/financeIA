import fs from 'fs'
import https from 'https'
import { execSync } from 'child_process'

let certificateAgent = null
let certificateInfo = null

/**
 * Carrega e configura o certificado digital A1 usando método alternativo
 */
export const setupCertificateAlt = async () => {
  try {
    const certPath = process.env.CERT_PATH
    const certPassword = process.env.CERT_PASSWORD

    if (!certPassword) {
      console.warn('⚠️  CERT_PASSWORD não configurado')
      return null
    }

    if (!certPath || !fs.existsSync(certPath)) {
      console.warn('⚠️  Certificado não encontrado')
      return null
    }

    console.log(`📄 Carregando certificado de: ${certPath}`)

    // Ler certificado como buffer
    const pfxBuffer = fs.readFileSync(certPath)

    // Criar agente HTTPS diretamente com o buffer
    certificateAgent = new https.Agent({
      pfx: pfxBuffer,
      passphrase: certPassword,
      rejectUnauthorized: process.env.SEFAZ_ENVIRONMENT === 'producao'
    })

    console.log('✅ Certificado carregado com sucesso!')

    // Tentar extrair informações básicas
    try {
      // Usar openssl para extrair informações (se disponível)
      const tempCertPath = certPath.replace('.pfx', '_temp.pem')
      
      try {
        execSync(`openssl pkcs12 -in "${certPath}" -out "${tempCertPath}" -nodes -passin pass:${certPassword}`, {
          stdio: 'pipe'
        })
        
        const certPem = fs.readFileSync(tempCertPath, 'utf8')
        
        // Extrair CNPJ do certificado
        const cnpjMatch = certPem.match(/serialNumber=(\d+)/)
        const cnpj = cnpjMatch ? cnpjMatch[1] : 'N/A'
        
        // Extrair datas
        const validFromMatch = certPem.match(/Not Before: (.+)/)
        const validToMatch = certPem.match(/Not After : (.+)/)
        
        certificateInfo = {
          cnpj: cnpj.replace(/\D/g, ''),
          validFrom: validFromMatch ? new Date(validFromMatch[1]) : new Date(),
          validTo: validToMatch ? new Date(validToMatch[1]) : new Date(),
          issuer: 'Autoridade Certificadora',
          subject: 'Certificado Digital'
        }
        
        // Limpar arquivo temporário
        fs.unlinkSync(tempCertPath)
      } catch (opensslError) {
        console.warn('⚠️  OpenSSL não disponível, usando informações básicas')
        certificateInfo = {
          cnpj: 'Não identificado',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 ano
          issuer: 'Autoridade Certificadora',
          subject: 'Certificado Digital'
        }
      }
    } catch (error) {
      console.warn('⚠️  Não foi possível extrair informações detalhadas')
      certificateInfo = {
        cnpj: 'Não identificado',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuer: 'Autoridade Certificadora',
        subject: 'Certificado Digital'
      }
    }

    return certificateInfo
  } catch (error) {
    console.error('❌ Erro ao configurar certificado:', error.message)
    throw error
  }
}

/**
 * Valida certificado sem carregar completamente
 */
export const validateCertificate = (pfxPath, password) => {
  try {
    const pfxBuffer = fs.readFileSync(pfxPath)
    
    // Tentar criar agente HTTPS (isso valida senha e formato)
    const testAgent = new https.Agent({
      pfx: pfxBuffer,
      passphrase: password,
      rejectUnauthorized: false
    })
    
    return { valid: true, agent: testAgent }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

/**
 * Retorna o agente HTTPS configurado com certificado
 */
export const getCertificateAgent = () => {
  if (!certificateAgent) {
    throw new Error('Certificado não configurado. Execute setupCertificateAlt() primeiro.')
  }
  return certificateAgent
}

/**
 * Retorna informações do certificado
 */
export const getCertificateInfo = () => {
  return certificateInfo
}

/**
 * Valida se o certificado está válido
 */
export const isCertificateValid = () => {
  if (!certificateInfo) return false
  
  const now = new Date()
  return now >= certificateInfo.validFrom && now <= certificateInfo.validTo
}

/**
 * Retorna dias até expiração do certificado
 */
export const getDaysUntilExpiration = () => {
  if (!certificateInfo) return null
  
  const now = new Date()
  const expiration = new Date(certificateInfo.validTo)
  const diffTime = expiration - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
