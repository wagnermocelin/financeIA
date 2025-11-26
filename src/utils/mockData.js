export const generateMockData = () => {
  const categories = [
    { id: '1', name: 'Vendas', type: 'income', icon: 'TrendingUp', color: '#10b981' },
    { id: '2', name: 'Serviços', type: 'income', icon: 'Briefcase', color: '#3b82f6' },
    { id: '3', name: 'Salários', type: 'expense', icon: 'Users', color: '#ef4444' },
    { id: '4', name: 'Aluguel', type: 'expense', icon: 'Home', color: '#f59e0b' },
    { id: '5', name: 'Fornecedores', type: 'expense', icon: 'Package', color: '#8b5cf6' },
    { id: '6', name: 'Marketing', type: 'expense', icon: 'Megaphone', color: '#ec4899' },
    { id: '7', name: 'Utilidades', type: 'expense', icon: 'Zap', color: '#14b8a6' },
    { id: '8', name: 'Impostos', type: 'expense', icon: 'FileText', color: '#f97316' },
  ]

  // Transações vazias - dados reais serão lançados pelo usuário
  const transactions = []

  // Orçamentos vazios - serão configurados conforme necessário
  const budgets = []

  // Extratos bancários vazios - serão importados via CSV/OFX
  const bankStatements = []

  return {
    categories,
    transactions,
    budgets,
    bankStatements
  }
}
