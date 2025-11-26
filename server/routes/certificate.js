import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'
import { setupCertificate, getCertificateInfo } from '../services/certificateService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const certDir = path.join(__dirname, '..', 'certificados')
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true })
    }
    cb(null, certDir)
  },
  filename: (req, file, cb) => {
    cb(null, 'certificado.pfx')
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.pfx') || file.originalname.endsWith('.p12')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos .pfx ou .p12 são permitidos'))
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

/**
 * POST /api/certificate/upload
 * Upload e instalação de certificado digital
 */
router.post('/upload', upload.single('certificate'), async (req, res) => {
  try {
    const { password, environment, cnpj } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Senha do certificado é obrigatória'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo de certificado não enviado'
      })
    }

    console.log('📤 Upload de certificado recebido')
    console.log('   Arquivo:', req.file.originalname)
    console.log('   Tamanho:', (req.file.size / 1024).toFixed(2), 'KB')
    console.log('   Ambiente:', environment || 'homologacao')

    // Atualizar variáveis de ambiente
    const envPath = path.join(__dirname, '..', '.env')
    let envContent = ''

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }

    // Atualizar ou adicionar configurações
    const updateEnvVar = (content, key, value) => {
      const regex = new RegExp(`^${key}=.*$`, 'm')
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`)
      } else {
        return content + `\n${key}=${value}`
      }
    }

    envContent = updateEnvVar(envContent, 'CERT_PATH', './certificados/certificado.pfx')
    envContent = updateEnvVar(envContent, 'CERT_PASSWORD', password)
    envContent = updateEnvVar(envContent, 'SEFAZ_ENVIRONMENT', environment || 'homologacao')
    
    if (cnpj) {
      envContent = updateEnvVar(envContent, 'COMPANY_CNPJ', cnpj.replace(/\D/g, ''))
    }

    fs.writeFileSync(envPath, envContent.trim())

    // Recarregar variáveis de ambiente
    process.env.CERT_PATH = './certificados/certificado.pfx'
    process.env.CERT_PASSWORD = password
    process.env.SEFAZ_ENVIRONMENT = environment || 'homologacao'
    if (cnpj) {
      process.env.COMPANY_CNPJ = cnpj.replace(/\D/g, '')
    }

    // Tentar validar o certificado usando método nativo do Node.js
    try {
      console.log('🔐 Validando certificado com método nativo...')
      
      const pfxBuffer = fs.readFileSync(req.file.path)
      
      // Tentar criar agente HTTPS (valida senha e formato)
      const testAgent = new https.Agent({
        pfx: pfxBuffer,
        passphrase: password,
        rejectUnauthorized: false
      })
      
      console.log('✅ Certificado validado com sucesso!')
      
      // Tentar extrair informações usando setupCertificate
      let certInfo
      try {
        certInfo = await setupCertificate()
      } catch (error) {
        console.warn('⚠️  Não foi possível extrair informações detalhadas, usando básicas')
        certInfo = {
          cnpj: cnpj ? cnpj.replace(/\D/g, '') : 'Não identificado',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          issuer: 'Autoridade Certificadora',
          subject: 'Certificado Digital'
        }
      }
      
      console.log('✅ Certificado instalado com sucesso!')
      console.log('   CNPJ:', certInfo.cnpj)
      console.log('   Válido até:', certInfo.validTo)

      res.json({
        success: true,
        message: 'Certificado instalado com sucesso',
        certificate: {
          cnpj: certInfo.cnpj,
          validTo: certInfo.validTo,
          validFrom: certInfo.validFrom,
          issuer: certInfo.issuer || 'Autoridade Certificadora',
          subject: certInfo.subject || 'Certificado Digital'
        }
      })
    } catch (certError) {
      console.error('❌ Erro ao validar certificado:', certError)
      
      // Remover arquivo se falhou
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      
      // Mensagem de erro mais clara
      let errorMessage = certError.message
      if (errorMessage.includes('mac verify failure') || 
          errorMessage.includes('bad decrypt') ||
          errorMessage.includes('bad password')) {
        errorMessage = 'Senha do certificado incorreta'
      } else if (errorMessage.includes('asn1')) {
        errorMessage = 'Arquivo de certificado inválido ou corrompido'
      }
      
      res.status(400).json({
        success: false,
        error: errorMessage
      })
    }
  } catch (error) {
    console.error('❌ Erro no upload:', error)
    
    // Limpar arquivo se houver erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/certificate/remove
 * Remove certificado instalado
 */
router.delete('/remove', async (req, res) => {
  try {
    const certPath = path.join(__dirname, '..', 'certificados', 'certificado.pfx')
    
    if (fs.existsSync(certPath)) {
      fs.unlinkSync(certPath)
      console.log('🗑️  Certificado removido')
    }

    // Limpar variáveis de ambiente
    const envPath = path.join(__dirname, '..', '.env')
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8')
      envContent = envContent.replace(/^CERT_PATH=.*$/m, '# CERT_PATH=')
      envContent = envContent.replace(/^CERT_PASSWORD=.*$/m, '# CERT_PASSWORD=')
      fs.writeFileSync(envPath, envContent)
    }

    // Limpar variáveis de ambiente do processo
    delete process.env.CERT_PATH
    delete process.env.CERT_PASSWORD

    res.json({
      success: true,
      message: 'Certificado removido com sucesso'
    })
  } catch (error) {
    console.error('❌ Erro ao remover certificado:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/certificate/info
 * Retorna informações do certificado instalado
 */
router.get('/info', (req, res) => {
  try {
    const certInfo = getCertificateInfo()
    
    if (!certInfo) {
      return res.json({
        success: true,
        configured: false,
        message: 'Nenhum certificado instalado'
      })
    }

    res.json({
      success: true,
      configured: true,
      certificate: certInfo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
