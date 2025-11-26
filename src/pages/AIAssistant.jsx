import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { aiService } from '../utils/aiService'
import { Bot, Send, Sparkles } from 'lucide-react'

const AIAssistant = () => {
  const { getFinancialSummary, loading } = useFinance()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente financeiro com IA. Posso ajudá-lo com análise de receitas e despesas, conciliação bancária, criação de orçamentos e geração de relatórios. Como posso ajudar hoje?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const summary = getFinancialSummary()

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const context = {
        avgIncome: summary.income,
        avgExpenses: summary.expenses,
        trend: summary.balance > 0 ? 'positive' : 'negative',
      }

      const response = await aiService.chat(input, context)
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assistente IA</h1>
        <p className="text-gray-600 mt-1">Converse com seu assistente financeiro inteligente</p>
      </div>

      {/* Chat Container */}
      <Card className="h-[calc(100vh-250px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Assistente IA</span>
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-500">Sugestões:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-3 py-1.5 bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                rows="3"
                className="input resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="btn btn-primary h-[88px] px-6"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Ações Rápidas">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSuggestionClick('Analisar minhas receitas do mês')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Analisar Receitas</div>
            <div className="text-xs text-gray-600 mt-1">Veja insights sobre suas receitas</div>
          </button>

          <button
            onClick={() => handleSuggestionClick('Revisar minhas despesas')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Revisar Despesas</div>
            <div className="text-xs text-gray-600 mt-1">Identifique oportunidades de economia</div>
          </button>

          <button
            onClick={() => handleSuggestionClick('Como está meu orçamento?')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Status do Orçamento</div>
            <div className="text-xs text-gray-600 mt-1">Verifique seus limites de gastos</div>
          </button>

          <button
            onClick={() => handleSuggestionClick('Gerar relatório financeiro')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-sm font-medium text-gray-900">Gerar Relatório</div>
            <div className="text-xs text-gray-600 mt-1">Crie um relatório completo</div>
          </button>
        </div>
      </Card>
    </div>
  )
}

export default AIAssistant
