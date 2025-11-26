import fs from 'fs'
import forge from 'node-forge'
import https from 'https'

let certificateAgent = null
let certificateInfo = null

/**
 * Carrega e configura o certificado digital A1
 */
export const setupCertificate = async () => {
  try {
    const certPath = process.env.CERT_PATH
    const certPassword = process.env.CERT_PASSWORD
    const certBase64 = process.env.CERT_BASE64

    if (!certPassword) {
      console.warn('⚠️  CERT_PASSWORD não configurado')
      return null
    }

    let pfxData

    // Carregar certificado de arquivo ou base64
    if (certBase64) {
      console.log('📄 Carregando certificado de base64...')
      pfxData = Buffer.from(certBase64, 'base64')
    } else if (certPath && fs.existsSync(certPath)) {
      console.log(`📄 Carregando certificado de: ${certPath}`)
      pfxData = fs.readFileSync(certPath)
    } else {
      console.warn('⚠️  Certificado não encontrado')
      return null
    }

    // Decodificar PFX
    console.log('🔓 Tentando decodificar certificado...')
    
    let p12
    try {
      const p12Asn1 = forge.asn1.fromDer(pfxData.toString('binary'))
      
      // Tentar com senha
      p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword)
      console.log('✅ Certificado decodificado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao decodificar:', error.message)
      
      // Tentar sem validar MAC (alguns certificados têm esse problema)
      try {
        console.log('🔄 Tentando sem validação de MAC...')
        const p12Asn1 = forge.asn1.fromDer(pfxData.toString('binary'))
        p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certPassword)
        console.log('✅ Certificado decodificado (sem validação MAC)')
      } catch (error2) {
        console.error('❌ Falhou também sem MAC:', error2.message)
        throw new Error(`Senha incorreta ou certificado inválido: ${error.message}`)
      }
    }

    // Extrair chave privada e certificado
    const bags = p12.getBags({ bagType: forge.pki.oids.certBag })
    const certBag = bags[forge.pki.oids.certBag][0]
    const certificate = certBag.cert

    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0]
    const privateKey = keyBag.key

    // Converter para PEM
    const certPem = forge.pki.certificateToPem(certificate)
    const keyPem = forge.pki.privateKeyToPem(privateKey)

    // Criar agente HTTPS com certificado
    certificateAgent = new https.Agent({
      cert: certPem,
      key: keyPem,
      rejectUnauthorized: process.env.SEFAZ_ENVIRONMENT === 'producao'
    })

    // Extrair informações do certificado
    const subject = certificate.subject.attributes
    const cnpjAttr = subject.find(attr => 
      attr.shortName === 'serialNumber' || 
      attr.name === 'serialNumber'
    )

    certificateInfo = {
      cnpj: cnpjAttr ? cnpjAttr.value.replace(/\D/g, '') : 'N/A',
      validFrom: certificate.validity.notBefore,
      validTo: certificate.validity.notAfter,
      issuer: certificate.issuer.attributes.find(a => a.shortName === 'CN')?.value || 'N/A',
      subject: subject.find(a => a.shortName === 'CN')?.value || 'N/A'
    }

    console.log('✅ Certificado configurado com sucesso!')
    return certificateInfo
  } catch (error) {
    console.error('❌ Erro ao configurar certificado:', error.message)
    throw error
  }
}

/**
 * Retorna o agente HTTPS configurado com certificado
 */
export const getCertificateAgent = () => {
  if (!certificateAgent) {
    // Tentar criar agente com certificado do arquivo
    const certPath = process.env.CERT_PATH
    const certPassword = process.env.CERT_PASSWORD
    
    if (certPath && certPassword && fs.existsSync(certPath)) {
      try {
        console.log('🔄 Carregando certificado para agente HTTPS...')
        const pfxBuffer = fs.readFileSync(certPath)
        certificateAgent = new https.Agent({
          pfx: pfxBuffer,
          passphrase: certPassword,
          rejectUnauthorized: process.env.SEFAZ_ENVIRONMENT === 'producao'
        })
        console.log('✅ Agente HTTPS criado com sucesso')
        return certificateAgent
      } catch (error) {
        console.error('❌ Erro ao criar agente:', error.message)
        throw new Error('Erro ao carregar certificado: ' + error.message)
      }
    }
    
    throw new Error('Certificado não configurado. Execute setupCertificate() primeiro.')
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
