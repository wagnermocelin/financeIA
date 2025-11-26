import * as XLSX from 'xlsx'

/**
 * Importa fornecedores de uma planilha Excel
 * @param {File} file - Arquivo Excel (.xlsx, .xls)
 * @returns {Promise<Array>} - Array de fornecedores
 */
export async function importSuppliersFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        console.log('📂 Lendo arquivo Excel...')
        
        // Lê o arquivo
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        console.log(`📊 Planilha encontrada: ${sheetName}`)

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '' 
        })

        console.log(`📋 Total de linhas: ${jsonData.length}`)

        // Mapeia os dados para o formato esperado
        const suppliers = jsonData.map((row, index) => {
          try {
            return parseSupplierRow(row, index)
          } catch (error) {
            console.warn(`⚠️ Erro na linha ${index + 2}:`, error.message)
            return null
          }
        }).filter(s => s !== null)

        console.log(`✅ Fornecedores válidos: ${suppliers.length}`)
        resolve(suppliers)

      } catch (error) {
        console.error('❌ Erro ao processar Excel:', error)
        reject(new Error(`Erro ao processar arquivo: ${error.message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Converte uma linha da planilha em objeto de fornecedor
 * Aceita múltiplos formatos de colunas
 */
function parseSupplierRow(row, index) {
  // Tenta diferentes nomes de colunas (case insensitive)
  const getName = () => {
    return row['Nome'] || row['nome'] || row['NOME'] || 
           row['Razão Social'] || row['razao_social'] || row['RAZAO_SOCIAL'] ||
           row['Fornecedor'] || row['fornecedor'] || row['FORNECEDOR'] || ''
  }

  const getCNPJ = () => {
    return row['CNPJ'] || row['cnpj'] || row['CPF'] || row['cpf'] || 
           row['Documento'] || row['documento'] || ''
  }

  const getEmail = () => {
    return row['Email'] || row['email'] || row['E-mail'] || row['e-mail'] || ''
  }

  const getPhone = () => {
    return row['Telefone'] || row['telefone'] || row['TELEFONE'] ||
           row['Fone'] || row['fone'] || row['Celular'] || row['celular'] || ''
  }

  const getAddress = () => {
    return row['Endereço'] || row['endereco'] || row['ENDERECO'] ||
           row['Rua'] || row['rua'] || ''
  }

  const getCity = () => {
    return row['Cidade'] || row['cidade'] || row['CIDADE'] || ''
  }

  const getState = () => {
    return row['Estado'] || row['estado'] || row['ESTADO'] ||
           row['UF'] || row['uf'] || ''
  }

  const getZipCode = () => {
    return row['CEP'] || row['cep'] || row['Cep'] || ''
  }

  const getContact = () => {
    return row['Contato'] || row['contato'] || row['CONTATO'] ||
           row['Responsável'] || row['responsavel'] || ''
  }

  const getNotes = () => {
    return row['Observações'] || row['observacoes'] || row['OBSERVACOES'] ||
           row['Obs'] || row['obs'] || row['Notas'] || row['notas'] || ''
  }

  const name = getName().trim()
  
  // Validação: nome é obrigatório
  if (!name) {
    throw new Error(`Nome do fornecedor é obrigatório (linha ${index + 2})`)
  }

  // Limpa e formata CNPJ/CPF
  const document = getCNPJ().toString().replace(/[^\d]/g, '')

  // Limpa e formata telefone
  const phone = getPhone().toString().replace(/[^\d]/g, '')

  // Limpa e formata CEP
  const zipCode = getZipCode().toString().replace(/[^\d]/g, '')

  return {
    name,
    document: document || null,
    email: getEmail().trim() || null,
    phone: phone || null,
    address: getAddress().trim() || null,
    city: getCity().trim() || null,
    state: getState().trim() || null,
    zip_code: zipCode || null,
    contact_person: getContact().trim() || null,
    notes: getNotes().trim() || null,
    active: true
  }
}

/**
 * Valida um fornecedor
 */
export function validateSupplier(supplier) {
  const errors = []

  if (!supplier.name || supplier.name.length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres')
  }

  if (supplier.document) {
    const doc = supplier.document.replace(/[^\d]/g, '')
    if (doc.length !== 11 && doc.length !== 14) {
      errors.push('CNPJ/CPF inválido (deve ter 11 ou 14 dígitos)')
    }
  }

  if (supplier.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(supplier.email)) {
      errors.push('Email inválido')
    }
  }

  if (supplier.zip_code) {
    const cep = supplier.zip_code.replace(/[^\d]/g, '')
    if (cep.length !== 8) {
      errors.push('CEP inválido (deve ter 8 dígitos)')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Gera um template Excel para download
 */
export function generateSupplierTemplate() {
  const template = [
    {
      'Nome': 'Exemplo Fornecedor Ltda',
      'CNPJ': '12.345.678/0001-90',
      'Email': 'contato@fornecedor.com.br',
      'Telefone': '(41) 3333-4444',
      'Endereço': 'Rua Exemplo, 123',
      'Cidade': 'Curitiba',
      'Estado': 'PR',
      'CEP': '80000-000',
      'Contato': 'João Silva',
      'Observações': 'Fornecedor de materiais'
    },
    {
      'Nome': 'Outro Fornecedor ME',
      'CNPJ': '98.765.432/0001-10',
      'Email': 'vendas@outro.com.br',
      'Telefone': '(41) 9999-8888',
      'Endereço': 'Av. Principal, 456',
      'Cidade': 'São Paulo',
      'Estado': 'SP',
      'CEP': '01000-000',
      'Contato': 'Maria Santos',
      'Observações': 'Prazo de pagamento: 30 dias'
    }
  ]

  // Cria workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(template)

  // Ajusta largura das colunas
  ws['!cols'] = [
    { wch: 30 }, // Nome
    { wch: 20 }, // CNPJ
    { wch: 30 }, // Email
    { wch: 18 }, // Telefone
    { wch: 35 }, // Endereço
    { wch: 20 }, // Cidade
    { wch: 8 },  // Estado
    { wch: 12 }, // CEP
    { wch: 25 }, // Contato
    { wch: 40 }  // Observações
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Fornecedores')

  // Gera arquivo
  XLSX.writeFile(wb, 'template_fornecedores.xlsx')
  
  console.log('✅ Template gerado: template_fornecedores.xlsx')
}

/**
 * Estatísticas de importação
 */
export function getImportStats(suppliers, validationResults) {
  const total = suppliers.length
  const valid = validationResults.filter(r => r.valid).length
  const invalid = total - valid

  return {
    total,
    valid,
    invalid,
    successRate: total > 0 ? Math.round((valid / total) * 100) : 0
  }
}

export default {
  importSuppliersFromExcel,
  validateSupplier,
  generateSupplierTemplate,
  getImportStats
}
