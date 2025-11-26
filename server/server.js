import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nfeRoutes from './routes/nfe.js'
import certificateRoutes from './routes/certificate.js'
import { setupCertificate } from './services/certificateService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.SEFAZ_ENVIRONMENT || 'homologacao'
  })
})

// Routes
app.use('/api/nfe', nfeRoutes)
app.use('/api/certificate', certificateRoutes)

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err)
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' })
})

// Inicializar servidor
const startServer = async () => {
  try {
    // Verificar certificado (não bloquear se falhar)
    console.log('🔐 Verificando certificado digital...')
    try {
      const certInfo = await setupCertificate()
      
      if (certInfo) {
        console.log('✅ Certificado carregado com sucesso!')
        console.log(`   CNPJ: ${certInfo.cnpj}`)
        console.log(`   Válido até: ${certInfo.validTo}`)
      } else {
        console.warn('⚠️  Certificado não configurado - modo de desenvolvimento')
      }
    } catch (certError) {
      console.warn('⚠️  Erro ao carregar certificado:', certError.message)
      console.warn('⚠️  Servidor iniciará sem certificado - use a tela de configurações para instalar')
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`)
      console.log(`📡 Ambiente: ${process.env.SEFAZ_ENVIRONMENT || 'homologacao'}`)
      console.log(`🌐 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
      console.log(`\n📋 Endpoints disponíveis:`)
      console.log(`   GET  /health`)
      console.log(`   GET  /api/nfe/status`)
      console.log(`   POST /api/nfe/consultar-chave`)
      console.log(`   POST /api/nfe/buscar-periodo`)
      console.log(`   POST /api/nfe/download-xml`)
      console.log(`   POST /api/nfe/distribuicao`)
      console.log(`   POST /api/certificate/upload`)
      console.log(`   DELETE /api/certificate/remove`)
      console.log(`   GET  /api/certificate/info`)
      console.log(`\n✅ Pronto para receber requisições!\n`)
    })
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recebido, encerrando servidor...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT recebido, encerrando servidor...')
  process.exit(0)
})
