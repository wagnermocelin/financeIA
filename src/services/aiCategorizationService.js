/**
 * Serviço de Categorização Inteligente de Transações
 * Usa regras baseadas em palavras-chave para sugerir categorias
 */

// Regras de categorização baseadas em palavras-chave
const categorizationRules = {
  // RECEITAS
  'Vendas': [
    'venda', 'vendas', 'ifood', 'uber eats', 'rappi', 'delivery',
    'pedido', 'pagamento recebido', 'recebimento', 'ted recebida',
    'transferencia recebida', 'pix recebido', 'credito', 'elo credito',
    'mastercard credito', 'visa credito'
  ],
  'Serviços': [
    'servico', 'serviços', 'prestacao', 'consultoria', 'manutencao',
    'reparo', 'instalacao'
  ],

  // DESPESAS - Fornecedores
  'Fornecedores': [
    'fornecedor', 'atacadao', 'distribuidora', 'comercio', 'industria',
    'ltda', 's.a.', 'eireli', 'me', 'epp', 'oesa', 'tozzo', 'lange',
    'spal', 'stampa', 'bora embalagens'
  ],

  // DESPESAS - Salários
  'Salários': [
    'salario', 'folha', 'pagamento funcionario', 'pro labore',
    'adiantamento', 'vale', 'pix des:', 'transferencia pix des'
  ],

  // DESPESAS - Utilidades
  'Utilidades': [
    'agua', 'luz', 'energia', 'gas', 'internet', 'telefone',
    'sanepar', 'copel', 'comgas', 'vivo', 'claro', 'tim', 'oi',
    'fibra', 'impacta'
  ],

  // DESPESAS - Aluguel
  'Aluguel': [
    'aluguel', 'locacao', 'arrendamento', 'condominio'
  ],

  // DESPESAS - Marketing
  'Marketing': [
    'marketing', 'publicidade', 'propaganda', 'anuncio', 'facebook ads',
    'google ads', 'instagram', 'social media'
  ],

  // DESPESAS - Impostos
  'Impostos': [
    'imposto', 'taxa', 'tributo', 'inss', 'fgts', 'irpj', 'csll',
    'pis', 'cofins', 'icms', 'iss', 'simples', 'darf', 'gps',
    'iof', 'encargo', 'multa'
  ],

  // DESPESAS - Transporte
  'Transporte': [
    'combustivel', 'gasolina', 'diesel', 'alcool', 'posto',
    'estacionamento', 'pedagio', 'manutencao veiculo', 'ipva',
    'seguro veiculo', 'uber', '99', 'taxi'
  ],

  // DESPESAS - Alimentação
  'Alimentação': [
    'restaurante', 'lanchonete', 'padaria', 'mercado', 'supermercado',
    'acougue', 'hortifruti', 'bebidas', 'cafe', 'bar'
  ],

  // DESPESAS - Equipamentos
  'Equipamentos': [
    'equipamento', 'maquina', 'ferramenta', 'computador', 'notebook',
    'impressora', 'celular', 'tablet', 'godoes equipamentos'
  ],

  // DESPESAS - Financeiras
  'Financeiras': [
    'juros', 'tarifa', 'anuidade', 'manutencao conta', 'doc', 'ted',
    'saque', 'emprestimo', 'financiamento', 'parcela', 'limite de cred'
  ]
}

/**
 * Analisa a descrição de uma transação e sugere uma categoria
 * @param {string} description - Descrição da transação
 * @param {string} type - Tipo da transação (income/expense)
 * @param {Array} availableCategories - Categorias disponíveis no sistema
 * @returns {Object} - { category: string, confidence: number, reason: string }
 */
export function suggestCategory(description, type, availableCategories = []) {
  if (!description) {
    return {
      category: 'Sem Categoria',
      confidence: 0,
      reason: 'Descrição vazia'
    }
  }

  const descLower = description.toLowerCase()
  let bestMatch = null
  let bestScore = 0
  let matchedKeywords = []

  // Percorre todas as regras de categorização
  for (const [categoryName, keywords] of Object.entries(categorizationRules)) {
    let score = 0
    const matched = []

    // Verifica cada palavra-chave
    for (const keyword of keywords) {
      if (descLower.includes(keyword.toLowerCase())) {
        score += 1
        matched.push(keyword)
      }
    }

    // Se encontrou match e é melhor que o anterior
    if (score > bestScore) {
      // Verifica se a categoria existe no sistema
      const categoryExists = availableCategories.find(
        c => c.name === categoryName && c.type === type
      )

      if (categoryExists || availableCategories.length === 0) {
        bestScore = score
        bestMatch = categoryName
        matchedKeywords = matched
      }
    }
  }

  // Calcula confiança (0-100%)
  const confidence = Math.min((bestScore / 3) * 100, 100)

  return {
    category: bestMatch || 'Sem Categoria',
    confidence: Math.round(confidence),
    reason: matchedKeywords.length > 0
      ? `Palavras-chave encontradas: ${matchedKeywords.join(', ')}`
      : 'Nenhuma palavra-chave correspondente'
  }
}

/**
 * Categoriza múltiplas transações em lote
 * @param {Array} transactions - Array de transações
 * @param {Array} categories - Categorias disponíveis
 * @returns {Array} - Array de sugestões
 */
export function categorizeBatch(transactions, categories) {
  return transactions.map(transaction => {
    const suggestion = suggestCategory(
      transaction.description,
      transaction.type,
      categories
    )

    return {
      transactionId: transaction.id,
      description: transaction.description,
      currentCategory: transaction.category,
      suggestedCategory: suggestion.category,
      confidence: suggestion.confidence,
      reason: suggestion.reason,
      shouldUpdate: suggestion.category !== transaction.category &&
                    suggestion.category !== 'Sem Categoria' &&
                    suggestion.confidence >= 50
    }
  })
}

/**
 * Aprende com categorizações manuais do usuário
 * (Funcionalidade futura - pode ser expandida)
 */
export function learnFromUserChoice(description, chosenCategory) {
  // TODO: Implementar aprendizado de máquina
  // Por enquanto, apenas registra no console
  console.log('📚 Aprendizado:', {
    description,
    category: chosenCategory,
    timestamp: new Date().toISOString()
  })
}

/**
 * Estatísticas de categorização
 */
export function getCategorizationStats(suggestions) {
  const total = suggestions.length
  const toUpdate = suggestions.filter(s => s.shouldUpdate).length
  const highConfidence = suggestions.filter(s => s.confidence >= 80).length
  const mediumConfidence = suggestions.filter(s => s.confidence >= 50 && s.confidence < 80).length
  const lowConfidence = suggestions.filter(s => s.confidence < 50).length

  return {
    total,
    toUpdate,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    updatePercentage: total > 0 ? Math.round((toUpdate / total) * 100) : 0
  }
}

export default {
  suggestCategory,
  categorizeBatch,
  learnFromUserChoice,
  getCategorizationStats
}
