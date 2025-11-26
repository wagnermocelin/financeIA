import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { aiService } from '../utils/aiService'
import { FileText, Download, Sparkles, TrendingUp, AlertTriangle, CheckCircle, PieChart } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const Reports = () => {
  const { transactions, budgets, loading } = useFinance()
  const [report, setReport] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [period, setPeriod] = useState('current-month')

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const filteredTransactions = getFilteredTransactions()
      const generatedReport = await aiService.generateReport(filteredTransactions, budgets, period)
      setReport(generatedReport)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getFilteredTransactions = () => {
    const now = new Date()
    
    switch (period) {
      case 'current-month':
        return transactions.filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return transactions.filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()
        })
      case 'last-3-months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        return transactions.filter(t => new Date(t.date) >= threeMonthsAgo)
      case 'current-year':
        return transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear())
      default:
        return transactions
    }
  }

  const getPeriodLabel = () => {
    const labels = {
      'current-month': 'Mês Atual',
      'last-month': 'Mês Anterior',
      'last-3-months': 'Últimos 3 Meses',
      'current-year': 'Ano Atual',
    }
    return labels[period]
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-600 mt-1">Análises e insights gerados por IA</p>
        </div>
      </div>

      {/* Report Generator */}
      <Card title="Gerador de Relatórios">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input"
              >
                <option value="current-month">Mês Atual</option>
                <option value="last-month">Mês Anterior</option>
                <option value="last-3-months">Últimos 3 Meses</option>
                <option value="current-year">Ano Atual</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="btn btn-primary flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Gerando relatório...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gerar Relatório com IA</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Generated Report */}
      {report && (
        <>
          {/* Summary */}
          <Card title={`Resumo Financeiro - ${getPeriodLabel()}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Receitas</div>
                <div className="text-2xl font-bold text-green-700 mt-1">
                  {formatCurrency(report.summary.income)}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">Despesas</div>
                <div className="text-2xl font-bold text-red-700 mt-1">
                  {formatCurrency(report.summary.expenses)}
                </div>
              </div>
              <div className={`rounded-lg p-4 ${
                report.summary.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              }`}>
                <div className={`text-sm font-medium ${
                  report.summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  Saldo
                </div>
                <div className={`text-2xl font-bold mt-1 ${
                  report.summary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {formatCurrency(report.summary.balance)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Margem de Lucro</div>
                <div className="text-2xl font-bold text-purple-700 mt-1">
                  {report.summary.profitMargin}%
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Total de {report.summary.transactionCount} transações analisadas
            </div>
          </Card>

          {/* Top Expenses */}
          <Card title="Principais Categorias de Despesa">
            <div className="space-y-3">
              {report.categoryAnalysis.map(([category, amount], index) => {
                const percentage = (amount / report.summary.expenses) * 100
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}. {category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* AI Insights */}
          <Card title="Insights da IA">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.insights.map((insight, index) => {
                const Icon = insight.icon === 'TrendingUp' ? TrendingUp :
                           insight.icon === 'AlertTriangle' ? AlertTriangle :
                           insight.icon === 'CheckCircle' ? CheckCircle :
                           PieChart

                const colorClasses = {
                  success: 'bg-green-50 border-green-200',
                  warning: 'bg-yellow-50 border-yellow-200',
                  danger: 'bg-red-50 border-red-200',
                  info: 'bg-blue-50 border-blue-200',
                }

                const iconColors = {
                  success: 'text-green-600',
                  warning: 'text-yellow-600',
                  danger: 'text-red-600',
                  info: 'text-blue-600',
                }

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${colorClasses[insight.type]}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-6 h-6 ${iconColors[insight.type]} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recommendations */}
          <Card title="Recomendações">
            <div className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-900">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Export Options */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Exportar Relatório</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gerado em {formatDate(report.generatedAt)}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="btn btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button className="btn btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!report && !isGenerating && (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum relatório gerado
            </h3>
            <p className="text-gray-600 mb-4">
              Selecione um período e clique em "Gerar Relatório com IA" para começar
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Reports
