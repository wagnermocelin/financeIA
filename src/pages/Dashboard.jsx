import { useFinance } from '../context/FinanceContext'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const { loading, getFinancialSummary, getBudgetStatus, transactions } = useFinance()

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  const summary = getFinancialSummary()
  const budgetStatus = getBudgetStatus()

  // Dados para gráficos
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleDateString('pt-BR', { month: 'short' })
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear()
    })

    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    last6Months.push({
      month,
      receitas: income,
      despesas: expenses,
      saldo: income - expenses
    })
  }

  // Despesas por categoria
  const expensesByCategory = {}
  summary.transactions.filter(t => t.type === 'expense').forEach(t => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
  })

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <p className="text-gray-600 mt-1">Visão geral do desempenho da empresa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(summary.income)}
          change="+12.5% vs mês anterior"
          trend="up"
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(summary.expenses)}
          change="+5.2% vs mês anterior"
          trend="up"
          icon={TrendingDown}
          color="danger"
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(summary.balance)}
          change={summary.balance > 0 ? 'Positivo' : 'Negativo'}
          trend={summary.balance > 0 ? 'up' : 'down'}
          icon={DollarSign}
          color={summary.balance > 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Transações"
          value={summary.transactions.length}
          change={`${summary.transactions.filter(t => !t.reconciled).length} pendentes`}
          icon={AlertCircle}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas vs Despesas */}
        <Card title="Receitas vs Despesas (6 meses)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Despesas por Categoria */}
        <Card title="Despesas por Categoria">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tendência de Saldo */}
      <Card title="Tendência de Saldo">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={last6Months}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Status dos Orçamentos */}
      <Card title="Status dos Orçamentos">
        <div className="space-y-4">
          {budgetStatus.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum orçamento configurado</p>
          ) : (
            budgetStatus.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{budget.category}</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      budget.status === 'exceeded' ? 'bg-red-600' :
                      budget.status === 'warning' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${
                    budget.status === 'exceeded' ? 'text-red-600' :
                    budget.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {budget.percentage.toFixed(1)}% utilizado
                  </span>
                  <span className="text-gray-600">
                    {formatCurrency(budget.remaining)} restante
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Transações Recentes */}
      <Card title="Transações Recentes">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              {summary.transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.category}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
