import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

/**
 * Extrai texto de um arquivo PDF
 * @param {File} file - Arquivo PDF
 * @returns {Promise<string>} - Texto extraído
 */
async function extractTextFromPDF(file) {
  try {
    console.log('📄 Extraindo texto do PDF...')
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // Extrair texto de todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }
    
    console.log('✅ Texto extraído com sucesso')
    return fullText
  } catch (error) {
    console.error('❌ Erro ao extrair texto do PDF:', error)
    throw new Error('Erro ao ler arquivo PDF')
  }
}

/**
 * Identifica o banco/operadora do cartão
 */
function identifyCardOperator(text) {
  const textLower = text.toLowerCase()
  
  if (textLower.includes('nubank') || textLower.includes('nu pagamentos')) {
    return 'Nubank'
  }
  if (textLower.includes('itaú') || textLower.includes('itau')) {
    return 'Itaú'
  }
  if (textLower.includes('bradesco')) {
    return 'Bradesco'
  }
  if (textLower.includes('banco do brasil') || textLower.includes('bb')) {
    return 'Banco do Brasil'
  }
  if (textLower.includes('santander')) {
    return 'Santander'
  }
  if (textLower.includes('caixa') || textLower.includes('cef')) {
    return 'Caixa'
  }
  if (textLower.includes('inter')) {
    return 'Inter'
  }
  if (textLower.includes('c6 bank') || textLower.includes('c6')) {
    return 'C6 Bank'
  }
  
  return 'Desconhecido'
}

/**
 * Extrai data de vencimento
 */
function extractDueDate(text) {
  // Padrões comuns: "Vencimento: 10/12/2024", "Data de vencimento 10/12/2024"
  const patterns = [
    /vencimento[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    /vencimento[:\s]+(\d{2}-\d{2}-\d{4})/i,
    /due date[:\s]+(\d{2}\/\d{2}\/\d{4})/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const dateStr = match[1].replace(/-/g, '/')
      const [day, month, year] = dateStr.split('/')
      return new Date(year, month - 1, day)
    }
  }
  
  return null
}

/**
 * Extrai valor total da fatura
 */
function extractTotalAmount(text) {
  // Padrões: "Total R$ 1.234,56", "Valor total: R$ 1.234,56"
  const patterns = [
    /total[:\s]+r\$?\s*([\d.,]+)/i,
    /valor total[:\s]+r\$?\s*([\d.,]+)/i,
    /total da fatura[:\s]+r\$?\s*([\d.,]+)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // Converter formato brasileiro para número
      const value = match[1]
        .replace(/\./g, '') // Remove pontos de milhar
        .replace(',', '.') // Troca vírgula por ponto
      return parseFloat(value)
    }
  }
  
  return 0
}

/**
 * Extrai transações da fatura com múltiplos padrões
 */
function extractTransactions(text) {
  const transactions = []
  const lines = text.split('\n')
  
  console.log(`🔍 Analisando ${lines.length} linhas do PDF...`)
  
  // DEBUG: Mostrar primeiras 20 linhas para análise
  console.log('📋 Primeiras 20 linhas do PDF:')
  lines.slice(0, 20).forEach((line, idx) => {
    if (line.trim().length > 5) {
      console.log(`  ${idx + 1}: "${line.trim()}"`)
    }
  })
  
  // Múltiplos padrões de transações comuns em faturas
  const patterns = [
    // Padrão BRADESCO SIMPLIFICADO: "DD/MM   DESCRIÇÃO   VALOR"
    // Captura apenas data, descrição (até encontrar valor) e valor
    // Ignora cidades e outras datas intermediárias
    // Exemplo: "27/08   BIOLEADER   02/04   PONTA GROSSA   475,00" → captura "27/08 BIOLEADER 02/04 PONTA GROSSA 475,00"
    /(\d{2}\/\d{2})\s+([A-Z][A-Za-z0-9\s]+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})(?=\s+\d{2}\/\d{2}|\s*$)/gi,
    
    // Padrão 1: "10/11 LOJA NOME R$ 123,45" ou "10/11 LOJA NOME 123,45"
    /(\d{2}\/\d{2})(?:\/\d{2,4})?\s+(.+?)\s+(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    
    // Padrão 2: "10 NOV LOJA NOME R$ 123,45"
    /(\d{2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(.+?)\s+(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    
    // Padrão 3: "LOJA NOME 10/11 R$ 123,45"
    /(.+?)\s+(\d{2}\/\d{2})(?:\/\d{2,4})?\s+(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    
    // Padrão 4: Nubank - "10 NOV LOJA NOME R$ 123,45"
    /(\d{2})\s+(\w{3})\s+(.+?)\s+R\$\s*(-?\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    
    // Padrão 5: Bradesco - "LOJA NOME 123,45" (sem data na mesma linha)
    /^([A-Z\s]{3,50})\s+(\d{1,3}(?:\.\d{3})*,\d{2})$/gim,
    
    // Padrão 6: Bradesco alternativo - "DD/MM LOJA NOME 123,45"
    /(\d{2}\/\d{2})\s+([A-Z\s]+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    
    // Padrão 7: Formato tabular - "DESCRICAO | DATA | VALOR"
    /([A-Z\s]{3,})\s+(\d{2}\/\d{2}\/\d{2,4})\s+(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    
    // Padrão 8: Valor no início - "123,45 LOJA NOME 10/11"
    /(\d{1,3}(?:\.\d{3})*,\d{2})\s+(.+?)\s+(\d{2}\/\d{2})/gi
  ]
  
  const monthMap = {
    'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3, 'MAI': 4, 'JUN': 5,
    'JUL': 6, 'AGO': 7, 'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
  }
  
  // Palavras-chave para filtrar linhas que não são transações
  // NOTA: Removidos filtros que aparecem em linhas COM transações
  // A linha 1 contém "Data de Vencimento" MAS também contém transações!
  const excludeKeywords = [
    'parcelamento desta fatura',
    'novo teto de juros',
    'valor original da dívida',
    'os juros e encargos que você irá pagar'
  ]
  
  // Palavras-chave para filtrar DESCRIÇÕES de transações (não linhas inteiras)
  const excludeDescriptions = [
    'total para',
    'total da fatura',
    'cartão',
    'xxxx xxxx',
    'página',
    'empresarial elo',
    'parcelados futuros',
    'próximas faturas',
    'valores sujeitos',
    'anuidades total',
    'data de vencimento',
    'pagamento mínimo',
    'parcelado fácil',
    'mensagem importante',
    'cuide de nosso planeta',
    'fone fácil',
    'sac bradesco',
    'débito automático',
    'taxas mensais',
    'resumo das despesas',
    'saldo anterior',
    'despesas locais',
    'consulte a taxa'
  ]
  
  const seenTransactions = new Set() // Para evitar duplicatas
  let linesProcessed = 0
  let linesWithMatches = 0
  let linesExcluded = 0
  
  for (const line of lines) {
    // Pular linhas muito curtas
    if (line.length < 10) continue
    
    linesProcessed++
    
    // Verificar palavras-chave de exclusão
    const lineLower = line.toLowerCase()
    let shouldExclude = false
    for (const keyword of excludeKeywords) {
      if (lineLower.includes(keyword)) {
        shouldExclude = true
        linesExcluded++
        console.log(`❌ Linha excluída (contém "${keyword}"): "${line.substring(0, 100)}..."`)
        break
      }
    }
    
    if (shouldExclude) continue
    
    let foundMatch = false
    
    // Tentar cada padrão
    for (const pattern of patterns) {
      pattern.lastIndex = 0 // Reset regex
      const matches = [...line.matchAll(pattern)]
      
      if (matches.length > 0) {
        foundMatch = true
        linesWithMatches++
      }
      
      for (const match of matches) {
        try {
          let day, month, description, amountStr, dateStr, monthStr
          
          // Identificar qual padrão foi usado
          if (match.length === 4 && match[1].includes('/') && !match[2].match(/^(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)/i)) {
            // Padrão 1: data/descrição/valor
            [, dateStr, description, amountStr] = match
            const [d, m] = dateStr.split('/')
            day = parseInt(d)
            month = parseInt(m) - 1
          } else if (match.length === 5 && monthMap[match[2]?.toUpperCase()]) {
            // Padrão 2: dia/mês(texto)/descrição/valor
            const dayStr = match[1]
            monthStr = match[2]
            description = match[3]
            amountStr = match[4]
            day = parseInt(dayStr)
            month = monthMap[monthStr.toUpperCase()]
          } else if (match.length === 4 && match[2].includes('/')) {
            // Padrão 3: descrição/data/valor
            [, description, dateStr, amountStr] = match
            const [d, m] = dateStr.split('/')
            day = parseInt(d)
            month = parseInt(m) - 1
          } else if (match.length === 5) {
            // Padrão 4: dia/mês/descrição/valor
            const dayStr = match[1]
            monthStr = match[2]
            description = match[3]
            amountStr = match[4]
            day = parseInt(dayStr)
            month = monthMap[monthStr.toUpperCase()] ?? parseInt(monthStr) - 1
          } else if (match.length === 3 && !match[1].includes('/')) {
            // Padrão 5: descrição/valor (sem data - usar data atual)
            [, description, amountStr] = match
            const now = new Date()
            day = now.getDate()
            month = now.getMonth()
          } else if (match.length === 4 && match[1].includes('/') && match[1].length <= 5) {
            // Padrão 6: data/descrição/valor (Bradesco)
            [, dateStr, description, amountStr] = match
            const [d, m] = dateStr.split('/')
            day = parseInt(d)
            month = parseInt(m) - 1
          } else if (match.length === 4 && match[2].includes('/')) {
            // Padrão 7: descrição/data/valor (tabular)
            [, description, dateStr, amountStr] = match
            const parts = dateStr.split('/')
            day = parseInt(parts[0])
            month = parseInt(parts[1]) - 1
          } else if (match.length === 4 && !isNaN(parseFloat(match[1].replace(/\./g, '').replace(',', '.')))) {
            // Padrão 8: valor/descrição/data
            [, amountStr, description, dateStr] = match
            const [d, m] = dateStr.split('/')
            day = parseInt(d)
            month = parseInt(m) - 1
          } else {
            continue
          }
          
          // Limpar descrição
          description = description
            .trim()
            .replace(/\s+/g, ' ') // Múltiplos espaços -> um espaço
            .replace(/[^\w\s\-\.]/gi, ' ') // Remove caracteres especiais
            .trim()
          
          // Pular descrições muito curtas ou inválidas
          if (description.length < 3) continue
          
          // Filtrar descrições que contêm palavras-chave de exclusão
          const descLower = description.toLowerCase()
          if (excludeDescriptions.some(keyword => descLower.includes(keyword))) {
            continue
          }
          
          // Filtrar descrições que são apenas números (valores capturados errados)
          if (/^\d+\s*\d*$/.test(description.trim())) {
            continue
          }
          
          // Filtrar descrições que são apenas nomes de cidades (muito curtas sem contexto)
          const cityNames = ['ponta grossa', 'contagem', 'juiz de fora', 'osasco', 'sao paulo', 'curitiba', 'campo largo', 'cordeiropolis', 'pinhais', 'serra', 'vitoria', 'balneario ca', 'santo andre', 'pedreira', 'almirante tam', 'so paulo']
          if (cityNames.includes(descLower.trim())) {
            continue
          }
          
          // Filtrar descrições muito longas que provavelmente capturaram múltiplas transações
          if (description.length > 100) {
            continue
          }
          
          // Validar dia e mês
          if (!day || !month === undefined || day < 1 || day > 31 || month < 0 || month > 11) {
            console.warn(`⚠️ Data inválida: dia=${day}, mês=${month}`)
            continue
          }
          
          // Converter valor
          const amount = Math.abs(parseFloat(
            amountStr.replace(/\./g, '').replace(',', '.')
          ))
          
          // Ignorar valores muito pequenos ou muito grandes (provavelmente ruído)
          if (amount < 0.50 || amount > 999999) continue
          
          // Criar chave única para detectar duplicatas
          const transactionKey = `${day}-${month}-${description.substring(0, 20)}-${amount}`
          if (seenTransactions.has(transactionKey)) continue
          seenTransactions.add(transactionKey)
          
          // Criar data (usar ano atual ou anterior se mês já passou)
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth()
          
          // Se o mês da transação é maior que o mês atual, é do ano passado
          const year = month > currentMonth ? currentYear - 1 : currentYear
          const date = new Date(year, month, day)
          
          // Validar se a data foi criada corretamente
          if (isNaN(date.getTime())) {
            console.warn(`⚠️ Data inválida criada: ${year}-${month}-${day}`)
            continue
          }
          
          transactions.push({
            date: date.toISOString(),
            description: description,
            amount,
            type: 'expense',
            category: 'Cartão de Crédito',
            reconciled: false
          })
          
          console.log(`✅ Transação extraída: ${description} - R$ ${amount.toFixed(2)}`)
        } catch (error) {
          console.warn('⚠️ Erro ao processar match:', error)
          continue
        }
      }
    }
  }
  
  // Ordenar por data
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date))
  
  console.log(`\n📊 Estatísticas de Extração:`)
  console.log(`   📄 Linhas processadas: ${linesProcessed}`)
  console.log(`   🚫 Linhas excluídas (filtros): ${linesExcluded}`)
  console.log(`   ✅ Linhas com matches: ${linesWithMatches}`)
  console.log(`   💳 Transações extraídas: ${transactions.length}`)
  console.log(`   ❌ Duplicatas removidas: ${linesWithMatches - transactions.length}`)
  
  if (transactions.length === 0) {
    console.warn(`\n⚠️ NENHUMA TRANSAÇÃO ENCONTRADA!`)
    console.warn(`   Possíveis causas:`)
    console.warn(`   1. Formato do PDF não reconhecido`)
    console.warn(`   2. Texto não extraído corretamente`)
    console.warn(`   3. Padrões regex não batem com o formato`)
    console.warn(`\n   💡 Veja as "Primeiras 20 linhas" acima para identificar o padrão`)
    console.warn(`   💡 Compartilhe uma linha de exemplo para criar regex específico`)
  }
  
  return transactions
}

/**
 * Processa fatura de cartão de crédito em PDF
 * @param {File} file - Arquivo PDF da fatura
 * @returns {Promise<Object>} - Dados extraídos da fatura
 */
export async function parseCreditCardInvoice(file) {
  try {
    console.log('🔍 Processando fatura de cartão...')
    
    // Extrair texto do PDF
    const text = await extractTextFromPDF(file)
    
    // Identificar operadora
    const operator = identifyCardOperator(text)
    console.log(`🏦 Operadora identificada: ${operator}`)
    
    // Extrair informações
    const dueDate = extractDueDate(text)
    const totalAmount = extractTotalAmount(text)
    const transactions = extractTransactions(text)
    
    console.log(`📊 Fatura processada:`)
    console.log(`   💰 Valor total: R$ ${totalAmount.toFixed(2)}`)
    console.log(`   📅 Vencimento: ${dueDate ? dueDate.toLocaleDateString('pt-BR') : 'Não encontrado'}`)
    console.log(`   📝 Transações: ${transactions.length}`)
    
    return {
      operator,
      dueDate,
      totalAmount,
      transactions,
      fileName: file.name,
      processedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Erro ao processar fatura:', error)
    throw error
  }
}

/**
 * Valida fatura extraída
 */
export function validateInvoice(invoice) {
  const errors = []
  
  if (!invoice.totalAmount || invoice.totalAmount <= 0) {
    errors.push('Valor total não encontrado ou inválido')
  }
  
  if (!invoice.dueDate) {
    errors.push('Data de vencimento não encontrada')
  }
  
  if (!invoice.transactions || invoice.transactions.length === 0) {
    errors.push('Nenhuma transação encontrada')
  }
  
  // Verificar se soma das transações bate com total
  if (invoice.transactions.length > 0) {
    const sum = invoice.transactions.reduce((acc, t) => acc + t.amount, 0)
    const diff = Math.abs(sum - invoice.totalAmount)
    
    if (diff > 1) { // Tolerância de R$ 1,00
      errors.push(`Soma das transações (R$ ${sum.toFixed(2)}) difere do total (R$ ${invoice.totalAmount.toFixed(2)})`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: errors.length > 0 ? ['Verifique os dados extraídos manualmente'] : []
  }
}

/**
 * Gera resumo da importação
 */
export function getImportSummary(invoice, validation) {
  return {
    operator: invoice.operator,
    fileName: invoice.fileName,
    dueDate: invoice.dueDate,
    totalAmount: invoice.totalAmount,
    transactionCount: invoice.transactions.length,
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings
  }
}

export default {
  parseCreditCardInvoice,
  validateInvoice,
  getImportSummary
}
