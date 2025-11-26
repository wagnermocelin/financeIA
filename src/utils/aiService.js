// Serviço de IA simulado para análise financeira
// Em produção, integrar com OpenAI, Claude ou outro serviço de IA

export const aiService = {
  // Análise de transações e sugestões de categorização
  analyzeTransaction: async (description, amount) => {
    // Simula processamento de IA
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const keywords = {
      'salário': 'Salários',
      'folha': 'Salários',
      'aluguel': 'Aluguel',
      'venda': 'Vendas',
      'serviço': 'Serviços',
      'marketing': 'Marketing',
      'ads': 'Marketing',
      'fornecedor': 'Fornecedores',
      'material': 'Fornecedores',
      'energia': 'Utilidades',
      'água': 'Utilidades',
      'internet': 'Utilidades',
    }

    const lowerDesc = description.toLowerCase()
    let suggestedCategory = 'Outros'
    
    for (const [keyword, category] of Object.entries(keywords)) {
      if (lowerDesc.includes(keyword)) {
        suggestedCategory = category
        break
      }
    }

    return {
      category: suggestedCategory,
      confidence: 0.85,
      suggestions: [
        `Categoria sugerida: ${suggestedCategory}`,
        amount > 10000 ? 'Transação de alto valor - verificar aprovação' : null,
      ].filter(Boolean)
    }
  },

  // Conciliação bancária inteligente
  suggestReconciliation: async (transactions, bankStatements) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const matches = []
    const unreconciled = transactions.filter(t => !t.reconciled)
    const unreconciledStatements = bankStatements.filter(s => !s.reconciled)

    unreconciled.forEach(transaction => {
      unreconciledStatements.forEach(statement => {
        const amountMatch = Math.abs(transaction.amount - statement.amount) < 0.01
        const dateMatch = Math.abs(
          new Date(transaction.date) - new Date(statement.date)
        ) < 7 * 24 * 60 * 60 * 1000 // 7 dias

        if (amountMatch && dateMatch) {
          matches.push({
            transaction,
            statement,
            confidence: 0.95,
            reason: 'Valor e data compatíveis'
          })
        } else if (amountMatch) {
          matches.push({
            transaction,
            statement,
            confidence: 0.75,
            reason: 'Valor compatível, data divergente'
          })
        }
      })
    })

    return matches.sort((a, b) => b.confidence - a.confidence)
  },

  // Geração de relatórios com insights
  generateReport: async (transactions, budgets, period) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses
    const profitMargin = income > 0 ? ((balance / income) * 100).toFixed(2) : 0

    // Análise por categoria
    const categoryAnalysis = {}
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryAnalysis[t.category] = (categoryAnalysis[t.category] || 0) + t.amount
      }
    })

    const topExpenses = Object.entries(categoryAnalysis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Insights gerados por IA
    const insights = [
      {
        type: 'success',
        title: 'Receita em crescimento',
        description: `Receita total de R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no período.`,
        icon: 'TrendingUp'
      },
      balance < 0 ? {
        type: 'warning',
        title: 'Atenção ao fluxo de caixa',
        description: `Despesas superaram receitas em R$ ${Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Considere revisar gastos.`,
        icon: 'AlertTriangle'
      } : null,
      topExpenses.length > 0 ? {
        type: 'info',
        title: 'Maior categoria de despesa',
        description: `${topExpenses[0][0]}: R$ ${topExpenses[0][1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${((topExpenses[0][1] / expenses) * 100).toFixed(1)}% do total)`,
        icon: 'PieChart'
      } : null,
      profitMargin > 20 ? {
        type: 'success',
        title: 'Margem de lucro saudável',
        description: `Margem de ${profitMargin}% indica boa saúde financeira.`,
        icon: 'CheckCircle'
      } : null,
    ].filter(Boolean)

    // Recomendações
    const recommendations = [
      balance < 0 ? 'Priorize redução de custos nas categorias de maior impacto' : null,
      'Considere aumentar reserva de emergência para 6 meses de despesas',
      topExpenses[0] && topExpenses[0][1] / expenses > 0.4 
        ? `Categoria ${topExpenses[0][0]} representa mais de 40% das despesas - avaliar otimizações`
        : null,
      'Automatize conciliação bancária para reduzir tempo de fechamento',
    ].filter(Boolean)

    return {
      summary: {
        income,
        expenses,
        balance,
        profitMargin,
        transactionCount: transactions.length
      },
      categoryAnalysis: topExpenses,
      insights,
      recommendations,
      generatedAt: new Date().toISOString()
    }
  },

  // Previsão de fluxo de caixa
  predictCashFlow: async (transactions, months = 3) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Calcula médias dos últimos meses
    const monthlyData = {}
    transactions.forEach(t => {
      const date = new Date(t.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expenses: 0 }
      }
      
      if (t.type === 'income') {
        monthlyData[key].income += t.amount
      } else {
        monthlyData[key].expenses += t.amount
      }
    })

    const values = Object.values(monthlyData)
    const avgIncome = values.reduce((sum, m) => sum + m.income, 0) / values.length
    const avgExpenses = values.reduce((sum, m) => sum + m.expenses, 0) / values.length

    // Gera previsões
    const predictions = []
    const today = new Date()
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const variance = 0.1 // 10% de variação
      
      predictions.push({
        month: futureDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        predictedIncome: avgIncome * (1 + (Math.random() - 0.5) * variance),
        predictedExpenses: avgExpenses * (1 + (Math.random() - 0.5) * variance),
        confidence: 0.75 - (i * 0.05) // Confiança diminui com o tempo
      })
    }

    return {
      predictions,
      baselineIncome: avgIncome,
      baselineExpenses: avgExpenses,
      trend: avgIncome > avgExpenses ? 'positive' : 'negative'
    }
  },

  // Chat com assistente de IA
  chat: async (message, context) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const lowerMessage = message.toLowerCase()
    
    // Respostas baseadas em palavras-chave
    if (lowerMessage.includes('receita') || lowerMessage.includes('faturamento')) {
      return {
        response: `Com base nos dados atuais, sua receita mensal média é de R$ ${context.avgIncome?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}. ${context.trend === 'positive' ? 'A tendência é positiva!' : 'Recomendo focar em aumentar as vendas.'}`,
        suggestions: ['Ver detalhes de receita', 'Comparar com mês anterior', 'Gerar relatório completo']
      }
    }
    
    if (lowerMessage.includes('despesa') || lowerMessage.includes('gasto')) {
      return {
        response: `Suas despesas mensais médias são de R$ ${context.avgExpenses?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}. As principais categorias são: Salários, Fornecedores e Marketing.`,
        suggestions: ['Ver detalhes por categoria', 'Identificar oportunidades de economia', 'Comparar com orçamento']
      }
    }
    
    if (lowerMessage.includes('orçamento') || lowerMessage.includes('budget')) {
      return {
        response: 'Posso ajudá-lo a criar e monitorar orçamentos por categoria. Recomendo estabelecer limites para Marketing, Fornecedores e Utilidades primeiro.',
        suggestions: ['Criar novo orçamento', 'Ver status dos orçamentos', 'Configurar alertas']
      }
    }
    
    if (lowerMessage.includes('conciliação') || lowerMessage.includes('conciliar')) {
      return {
        response: 'Encontrei algumas transações que podem ser conciliadas automaticamente. Posso processar a conciliação inteligente para você.',
        suggestions: ['Iniciar conciliação automática', 'Ver pendências', 'Configurar regras']
      }
    }
    
    return {
      response: 'Olá! Sou seu assistente financeiro com IA. Posso ajudá-lo com análise de receitas e despesas, conciliação bancária, criação de orçamentos e geração de relatórios. Como posso ajudar?',
      suggestions: ['Analisar receitas', 'Revisar despesas', 'Conciliar transações', 'Gerar relatório']
    }
  }
}
