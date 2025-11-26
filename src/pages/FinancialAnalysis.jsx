import { useState, useEffect } from 'react'
import { useFinance } from '../context/FinanceContext'
import { useRegisters } from '../context/RegistersContext'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { aiService } from '../utils/aiService'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Calendar
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const FinancialAnalysis = () => {
  const { transactions, getFinancialSummary, getBudgetStatus } = useFinance()
  const { getTotalBalance, getTotalCreditLimit, getAvailableCredit } = useRegisters()
  const [analysis, setAnalysis] = useState(null)
  const [cashFlowPrediction, setCashFlowPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6months')

  useEffect(() => {
    loadAnalysis()
  }, [selectedPeriod])

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      // Gera análise com IA
      const report = await aiService.generateReport(transactions, [], selectedPeriod)
      setAnalysis(report)

      // Gera previsão de fluxo de caixa
      const prediction = await aiService.predictCashFlow(transactions, 3)
      setCashFlowPrediction(prediction)
    } catch (error) {
      console.error('Erro ao carregar análise:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Analisando dados financeiros com IA...</p>
      </div>
    )
  }

  const summary = getFinancialSummary()
  const budgetStatus = getBudgetStatus()
  const totalBalance = getTotalBalance()
  const totalCreditLimit = getTotalCreditLimit()
  const availableCredit = getAvailableCredit()

  // Dados para gráficos
  const last12Months = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleDateString('pt-BR', { month: 'short' })
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date)
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear()
    })

    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    last12Months.push({
      month,
      receitas: income,
      despesas: expenses,
      saldo: income - expenses
    })
  }

  // Indicadores financeiros
  const liquidityRatio = totalBalance / summary.expenses || 0
  const debtRatio = (totalCreditLimit - availableCredit) / totalBalance || 0
  const profitMargin = summary.income > 0 ? (summary.balance / summary.income) * 100 : 0

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise Financeira Aprofundada</h1>
          <p className="text-gray-600 mt-1">Análise completa com insights de IA</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input"
          >
            <option value="3months">Últimos 3 meses</option>
            <option value="6months">Últimos 6 meses</option>
            <option value="12months">Últimos 12 meses</option>
            <option value="year">Ano atual</option>
          </select>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Margem de Lucro</div>
              <div className="text-2xl font-bold text-primary-600 mt-1">
                {profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {profitMargin > 20 ? 'Excelente' : profitMargin > 10 ? 'Bom' : 'Atenção'}
              </div>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Índice de Liquidez</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {liquidityRatio.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {liquidityRatio > 2 ? 'Saudável' : liquidityRatio > 1 ? 'Adequado' : 'Crítico'}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Endividamento</div>
              <div className="text-2xl font-bold text-orange-600 mt-1">
                {(debtRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {debtRatio < 0.3 ? 'Baixo' : debtRatio < 0.6 ? 'Moderado' : 'Alto'}
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Saldo em Caixa</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(totalBalance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Contas bancárias
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Insights da IA */}
      {analysis && (
        <Card title="Insights Inteligentes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.insights.map((insight, index) => {
              const Icon = insight.icon === 'TrendingUp' ? TrendingUp :
                         insight.icon === 'AlertTriangle' ? AlertTriangle :
                         insight.icon === 'CheckCircle' ? CheckCircle :
                         PieChart

              const colorClasses = {
                success: 'bg-green-50 border-green-200 text-green-700',
                warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                danger: 'bg-red-50 border-red-200 text-red-700',
                info: 'bg-blue-50 border-blue-200 text-blue-700',
              }

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${colorClasses[insight.type]}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Evolução Financeira */}
      <Card title="Evolução Financeira (12 meses)">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={last12Months}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="receitas" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorReceitas)"
              name="Receitas"
            />
            <Area 
              type="monotone" 
              dataKey="despesas" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorDespesas)"
              name="Despesas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Previsão de Fluxo de Caixa */}
      {cashFlowPrediction && (
        <Card title="Previsão de Fluxo de Caixa (IA)">
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-medium">Análise Preditiva com IA</p>
              <p className="mt-1">
                Tendência: <span className="font-semibold">
                  {cashFlowPrediction.trend === 'positive' ? 'Positiva ↗' : 'Negativa ↘'}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cashFlowPrediction.predictions.map((pred, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{pred.month}</h4>
                  <span className="text-xs text-gray-500">
                    Confiança: {(pred.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Receitas Previstas</span>
                    <p className="font-semibold text-green-600 mt-1">
                      {formatCurrency(pred.predictedIncome)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Despesas Previstas</span>
                    <p className="font-semibold text-red-600 mt-1">
                      {formatCurrency(pred.predictedExpenses)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Saldo Previsto</span>
                    <p className={`font-semibold mt-1 ${
                      pred.predictedIncome - pred.predictedExpenses > 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(pred.predictedIncome - pred.predictedExpenses)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Análise de Orçamentos */}
      <Card title="Performance de Orçamentos">
        <div className="space-y-4">
          {budgetStatus.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum orçamento configurado
            </p>
          ) : (
            budgetStatus.map((budget) => (
              <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{budget.category}</h4>
                  <span className={`badge ${
                    budget.status === 'exceeded' ? 'badge-danger' :
                    budget.status === 'warning' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {budget.status === 'exceeded' ? 'Excedido' :
                     budget.status === 'warning' ? 'Atenção' : 'Normal'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                    </span>
                    <span className={`font-medium ${
                      budget.status === 'exceeded' ? 'text-red-600' :
                      budget.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {budget.percentage.toFixed(1)}%
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
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recomendações */}
      {analysis && analysis.recommendations && (
        <Card title="Recomendações Estratégicas">
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-900">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default FinancialAnalysis
