// Utilitário para processar extratos bancários

export const parseBankStatement = {
  // Parser de CSV
  parseCSV: (csvContent) => {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        throw new Error('Arquivo CSV vazio ou inválido')
      }

      // Primeira linha é o cabeçalho
      const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase())
      
      // Detecta colunas automaticamente
      const dateColumn = headers.findIndex(h => 
        h.includes('data') || h.includes('date')
      )
      const descriptionColumn = headers.findIndex(h => 
        h.includes('descri') || h.includes('historic') || h.includes('description')
      )
      const amountColumn = headers.findIndex(h => 
        h.includes('valor') || h.includes('amount') || h.includes('value')
      )
      const typeColumn = headers.findIndex(h => 
        h.includes('tipo') || h.includes('type') || h.includes('credito') || h.includes('debito')
      )

      if (dateColumn === -1 || descriptionColumn === -1 || amountColumn === -1) {
        throw new Error('Não foi possível identificar as colunas necessárias (data, descrição, valor)')
      }

      const statements = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,;]/).map(v => v.trim())
        
        if (values.length < 3) continue

        const date = parseDate(values[dateColumn])
        const description = values[descriptionColumn]
        let amount = parseAmount(values[amountColumn])
        
        // Detecta tipo (crédito/débito)
        let type = 'debit'
        if (typeColumn !== -1) {
          const typeValue = values[typeColumn].toLowerCase()
          if (typeValue.includes('credit') || typeValue.includes('credito') || typeValue.includes('c')) {
            type = 'credit'
          }
        } else {
          // Se não tem coluna de tipo, usa o sinal do valor
          if (amount > 0) {
            type = 'credit'
          } else {
            amount = Math.abs(amount)
          }
        }

        if (date && description && amount > 0) {
          // Gera hash único para evitar duplicação
          const hashKey = `${date.toISOString()}-${description.trim()}-${amount}-${type}`
            .toLowerCase()
            .replace(/\s+/g, '-')
          
          statements.push({
            date: date.toISOString(),
            description,
            amount,
            type,
            reconciled: false,
            imported: true,
            hash_key: hashKey
          })
        }
      }

      return {
        success: true,
        statements,
        count: statements.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statements: [],
      }
    }
  },

  // Parser de OFX (simplificado)
  parseOFX: (ofxContent) => {
    try {
      const statements = []
      
      // Extrai transações do OFX - suporta formato XML e SGML (sem tags de fechamento)
      let transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g
      let matches = [...ofxContent.matchAll(transactionRegex)]

      // Se não encontrou com tags de fechamento, tenta formato SGML
      if (matches.length === 0) {
        transactionRegex = /<STMTTRN>([\s\S]*?)(?=<STMTTRN>|<\/BANKTRANLIST>|$)/g
        matches = [...ofxContent.matchAll(transactionRegex)]
      }

      if (matches.length === 0) {
        throw new Error('Nenhuma transação encontrada no arquivo OFX. Verifique se o arquivo está no formato correto.')
      }

      matches.forEach((match, index) => {
        const transaction = match[1]
        
        // Extrai campos - DTPOSTED pode ter formato YYYYMMDD ou YYYYMMDDHHMMSS
        const dateMatch = transaction.match(/<DTPOSTED>(\d{8,14})/)?.[1]
        const amountMatch = transaction.match(/<TRNAMT>([-\d.,]+)/)?.[1]
        
        // Tenta múltiplos campos para descrição
        let descMatch = transaction.match(/<MEMO>([^<]+)/)?.[1]
        if (!descMatch) {
          descMatch = transaction.match(/<NAME>([^<]+)/)?.[1]
        }
        if (!descMatch) {
          descMatch = transaction.match(/<CHECKNUM>([^<]+)/)?.[1]
        }
        if (!descMatch) {
          descMatch = 'Transação sem descrição'
        }
        
        if (dateMatch && amountMatch) {
          // Extrai apenas os primeiros 8 dígitos da data (YYYYMMDD)
          const dateStr = dateMatch.substring(0, 8)
          const year = dateStr.substring(0, 4)
          const month = dateStr.substring(4, 6)
          const day = dateStr.substring(6, 8)
          const date = new Date(`${year}-${month}-${day}`)
          
          // Normaliza o valor (remove vírgulas, converte para float)
          const normalizedAmount = amountMatch.replace(',', '.')
          const amount = Math.abs(parseFloat(normalizedAmount))
          const type = parseFloat(normalizedAmount) > 0 ? 'credit' : 'debit'

          if (!isNaN(amount) && date instanceof Date && !isNaN(date)) {
            // Gera hash único para evitar duplicação
            const hashKey = `${date.toISOString()}-${descMatch.trim()}-${amount}-${type}`
              .toLowerCase()
              .replace(/\s+/g, '-')
            
            statements.push({
              date: date.toISOString(),
              description: descMatch.trim(),
              amount,
              type,
              reconciled: false,
              imported: true,
              hash_key: hashKey
            })
          }
        }
      })

      if (statements.length === 0) {
        throw new Error('Não foi possível extrair transações válidas do arquivo OFX. Verifique o formato dos dados.')
      }

      return {
        success: true,
        statements,
        count: statements.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statements: [],
      }
    }
  },

  // Detecta formato do arquivo
  detectFormat: (content) => {
    // Verifica OFX - pode ter OFXHEADER, <OFX> ou tags de transação
    if (content.includes('OFXHEADER') || 
        content.includes('<OFX>') || 
        content.includes('<STMTTRN>') ||
        content.includes('<BANKMSGSRSV1>')) {
      return 'OFX'
    }
    // Verifica CSV - deve ter separadores e múltiplas linhas
    if ((content.includes(',') || content.includes(';')) && content.split('\n').length > 1) {
      return 'CSV'
    }
    return 'UNKNOWN'
  },

  // Processa arquivo automaticamente
  processFile: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target.result
          
          // Log para debug
          console.log('Arquivo carregado:', file.name)
          console.log('Tamanho do conteúdo:', content.length, 'caracteres')
          console.log('Primeiros 200 caracteres:', content.substring(0, 200))
          
          const format = parseBankStatement.detectFormat(content)
          console.log('Formato detectado:', format)
          
          let result
          if (format === 'CSV') {
            result = parseBankStatement.parseCSV(content)
          } else if (format === 'OFX') {
            result = parseBankStatement.parseOFX(content)
          } else {
            result = {
              success: false,
              error: 'Formato de arquivo não suportado. Use CSV ou OFX.',
              statements: [],
            }
          }
          
          console.log('Resultado do processamento:', result)
          resolve({ ...result, format })
        } catch (error) {
          console.error('Erro ao processar arquivo:', error)
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      
      // Tenta detectar encoding - OFX geralmente usa ISO-8859-1 ou UTF-8
      const fileExtension = file.name.toLowerCase().split('.').pop()
      if (fileExtension === 'ofx') {
        // Tenta ler como ISO-8859-1 primeiro (padrão OFX brasileiro)
        reader.readAsText(file, 'ISO-8859-1')
      } else {
        reader.readAsText(file, 'UTF-8')
      }
    })
  },
}

// Funções auxiliares
function parseDate(dateString) {
  if (!dateString) return null
  
  // Remove espaços e caracteres especiais
  const cleaned = dateString.trim()
  
  // Tenta vários formatos
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
  ]
  
  for (const format of formats) {
    const match = cleaned.match(format)
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        // DD/MM/YYYY ou DD-MM-YYYY
        return new Date(`${match[3]}-${match[2]}-${match[1]}`)
      } else {
        // YYYY-MM-DD
        return new Date(cleaned)
      }
    }
  }
  
  return null
}

function parseAmount(amountString) {
  if (!amountString) return 0
  
  // Remove símbolos de moeda e espaços
  let cleaned = amountString.replace(/[R$\s]/g, '')
  
  // Substitui vírgula por ponto (formato brasileiro)
  cleaned = cleaned.replace(',', '.')
  
  return parseFloat(cleaned) || 0
}

// Template CSV de exemplo
export const csvTemplate = `Data,Descrição,Valor,Tipo
01/11/2024,TED RECEBIDA - CLIENTE A,15000.00,Crédito
05/11/2024,PAGAMENTO FOLHA,-25000.00,Débito
10/11/2024,PIX RECEBIDO - VENDA,8500.00,Crédito
15/11/2024,BOLETO FORNECEDOR,-6800.00,Débito`

// Instruções para o usuário
export const importInstructions = {
  csv: {
    title: 'Formato CSV',
    description: 'Arquivo de texto com valores separados por vírgula ou ponto-e-vírgula',
    required: [
      'Coluna de Data (formato DD/MM/YYYY ou YYYY-MM-DD)',
      'Coluna de Descrição/Histórico',
      'Coluna de Valor',
      'Coluna de Tipo (Crédito/Débito) - opcional',
    ],
    example: 'Data;Descrição;Valor;Tipo\n01/11/2024;TED RECEBIDA;15000,00;Crédito',
  },
  ofx: {
    title: 'Formato OFX',
    description: 'Formato padrão de extratos bancários (Open Financial Exchange)',
    required: [
      'Arquivo OFX exportado do seu banco',
      'Contém tags XML com informações das transações',
    ],
    example: 'Baixe o extrato OFX diretamente do internet banking do seu banco',
  },
}
