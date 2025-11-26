import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import Card from '../components/Card'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import BankStatementImport from '../components/BankStatementImport'
import { aiService } from '../utils/aiService'
import { Sparkles, CheckCircle, XCircle, AlertCircle, RefreshCw, Upload, Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const BankReconciliation = () => {
  const { transactions, bankStatements, reconcileTransaction, loading, addBankStatement, addTransaction, categories } = useFinance()
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importedStatements, setImportedStatements] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [selectedStatement, setSelectedStatement] = useState(null)

  const unreconciledTransactions = transactions.filter(t => !t.reconciled)
  const unreconciledStatements = bankStatements.filter(s => !s.reconciled)

  const handleAIReconciliation = async () => {
    setIsAnalyzing(true)
    try {
      const suggestions = await aiService.suggestReconciliation(
        unreconciledTransactions,
        unreconciledStatements
      )
      setAiSuggestions(suggestions)
    } catch (error) {
      console.error('Erro ao analisar:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReconcile = async (transactionId, statementId) => {
    try {
      console.log('🔄 Conciliando via IA...', { transactionId, statementId })
      await reconcileTransaction(transactionId, statementId)
      // Remove a sugestão da lista
      setAiSuggestions(aiSuggestions.filter(s => 
        s.transaction.id !== transactionId || s.statement.id !== statementId
      ))
      console.log('✅ Conciliação via IA concluída!')
    } catch (error) {
      console.error('❌ Erro na conciliação via IA:', error)
    }
  }

  const handleImportStatements = async (statements) => {
    try {
      console.log('📥 Importando extratos...', statements.length)
      
      // Adiciona os extratos ao contexto global
      for (const statement of statements) {
        if (addBankStatement) {
          await addBankStatement(statement)
        }
      }
      
      setImportedStatements([...importedStatements, ...statements])
      console.log('✅ Extratos importados com sucesso:', statements.length)
      alert(`${statements.length} extrato(s) importado(s) com sucesso!`)
    } catch (error) {
      console.error('❌ Erro ao importar extratos:', error)
      alert(`Erro ao importar extratos: ${error.message}`)
    }
  }

  const handleManualReconcile = async () => {
    if (selectedTransaction && selectedStatement) {
      try {
        console.log('🔄 Conciliando manualmente...', {
          transaction: selectedTransaction.description,
          statement: selectedStatement.description
        })
        await reconcileTransaction(selectedTransaction.id, selectedStatement.id)
        setSelectedTransaction(null)
        setSelectedStatement(null)
        console.log('✅ Conciliação manual realizada com sucesso!')
        alert('Conciliação realizada com sucesso!')
      } catch (error) {
        console.error('❌ Erro na conciliação manual:', error)
      }
    } else {
      alert('Selecione uma transação e um extrato para conciliar')
    }
  }

  const toggleTransactionSelection = (transaction) => {
    if (selectedTransaction?.id === transaction.id) {
      setSelectedTransaction(null)
    } else {
      setSelectedTransaction(transaction)
      console.log('Transação selecionada:', transaction.description)
    }
  }

  const toggleStatementSelection = (statement) => {
    if (selectedStatement?.id === statement.id) {
      setSelectedStatement(null)
    } else {
      setSelectedStatement(statement)
      console.log('Extrato selecionado:', statement.description)
    }
  }

  const handleCreateTransactionsFromStatements = async () => {
    if (unreconciledStatements.length === 0) {
      alert('Não há extratos pendentes para criar transações')
      return
    }

    const confirm = window.confirm(
      `Deseja criar ${unreconciledStatements.length} transação(ões) automaticamente a partir dos extratos não conciliados?\n\n` +
      `As transações serão criadas com:\n` +
      `- Descrição do extrato\n` +
      `- Valor e data do extrato\n` +
      `- Categoria: "Sem Categoria" (você pode editar depois)\n` +
      `- Status: Conciliada automaticamente`
    )

    if (!confirm) return

    try {
      console.log('🔄 Criando transações a partir dos extratos...')
      console.log(`📊 Total de extratos não conciliados: ${unreconciledStatements.length}`)
      let created = 0
      let errors = 0
      let errorDetails = []

      for (let i = 0; i < unreconciledStatements.length; i++) {
        const statement = unreconciledStatements[i]
        console.log(`\n📝 [${i + 1}/${unreconciledStatements.length}] Processando: ${statement.description}`)
        
        try {
          // Cria a transação (sem statement_id ainda)
          console.log(`   ⏳ Criando transação...`)
          const newTransaction = await addTransaction({
            description: statement.description,
            amount: statement.amount,
            type: statement.type === 'credit' ? 'income' : 'expense',
            category: 'Sem Categoria',
            date: statement.date,
            status: 'completed'
          })

          console.log(`   ✅ Transação criada! ID: ${newTransaction.id}`)

          // Agora concilia (vincula transação com extrato)
          console.log(`   ⏳ Conciliando...`)
          await reconcileTransaction(newTransaction.id, statement.id)
          console.log(`   ✅ Conciliada com sucesso!`)
          
          created++
        } catch (error) {
          console.error(`   ❌ ERRO:`, error)
          errorDetails.push({
            description: statement.description,
            error: error.message
          })
          errors++
          // Continua mesmo com erro
        }
      }

      console.log('\n' + '='.repeat(50))
      console.log(`✅ Processo concluído!`)
      console.log(`   ✅ Criadas: ${created}`)
      console.log(`   ❌ Erros: ${errors}`)
      if (errorDetails.length > 0) {
        console.log(`\n❌ Detalhes dos erros:`)
        errorDetails.forEach((err, idx) => {
          console.log(`   ${idx + 1}. ${err.description}: ${err.error}`)
        })
      }
      console.log('='.repeat(50))

      console.log(`✅ Processo concluído: ${created} criadas, ${errors} erros`)
      alert(
        `Transações criadas com sucesso!\n\n` +
        `✅ Criadas: ${created}\n` +
        `${errors > 0 ? `❌ Erros: ${errors}\n` : ''}` +
        `\nAs transações foram automaticamente conciliadas com os extratos.`
      )
    } catch (error) {
      console.error('❌ Erro ao criar transações:', error)
      alert(`Erro ao criar transações: ${error.message}`)
    }
  }

  const reconciledCount = transactions.filter(t => t.reconciled).length
  const totalTransactions = transactions.length
  const reconciliationRate = totalTransactions > 0 
    ? ((reconciledCount / totalTransactions) * 100).toFixed(1) 
    : 0

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conciliação Bancária</h1>
          <p className="text-gray-600 mt-1">Concilie transações com extratos bancários usando IA</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Importar Extrato</span>
          </button>
          <button
            onClick={handleCreateTransactionsFromStatements}
            disabled={unreconciledStatements.length === 0}
            className="btn btn-success flex items-center space-x-2"
            title="Criar transações automaticamente a partir dos extratos não conciliados"
          >
            <Zap className="w-5 h-5" />
            <span>Criar Transações ({unreconciledStatements.length})</span>
          </button>
          <button
            onClick={handleAIReconciliation}
            disabled={isAnalyzing || unreconciledTransactions.length === 0}
            className="btn btn-primary flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Conciliar com IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Taxa de Conciliação</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {reconciliationRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {reconciledCount} de {totalTransactions} transações
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Transações Pendentes</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {unreconciledTransactions.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Extratos Pendentes</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {unreconciledStatements.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Sugestões da IA</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {aiSuggestions.length}
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card title="Sugestões de Conciliação (IA)">
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">
                      Confiança: {(suggestion.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-sm text-purple-600">{suggestion.reason}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transaction */}
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">TRANSAÇÃO</div>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {suggestion.transaction.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(suggestion.transaction.date)}
                      </div>
                      <div className={`text-sm font-medium ${
                        suggestion.transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(suggestion.transaction.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Bank Statement */}
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">EXTRATO BANCÁRIO</div>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {suggestion.statement.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(suggestion.statement.date)}
                      </div>
                      <div className={`text-sm font-medium ${
                        suggestion.statement.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(suggestion.statement.amount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setAiSuggestions(aiSuggestions.filter((_, i) => i !== index))}
                    className="btn btn-secondary text-sm"
                  >
                    Ignorar
                  </button>
                  <button
                    onClick={() => handleReconcile(suggestion.transaction.id, suggestion.statement.id)}
                    className="btn btn-success text-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Conciliar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Manual Reconciliation Button */}
      {selectedTransaction && selectedStatement && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleManualReconcile}
            className="btn btn-success shadow-lg flex items-center space-x-2 text-lg px-6 py-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span>Conciliar Selecionados</span>
          </button>
        </div>
      )}

      {/* Manual Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unreconciled Transactions */}
        <Card title="Transações Não Conciliadas">
          {selectedTransaction && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
              ✓ Selecionada: <strong>{selectedTransaction.description}</strong>
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unreconciledTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Todas as transações conciliadas!</p>
              </div>
            ) : (
              unreconciledTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  onClick={() => toggleTransactionSelection(transaction)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTransaction?.id === transaction.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDate(transaction.date)} • {transaction.category}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Unreconciled Bank Statements */}
        <Card title="Extratos Bancários Não Conciliados">
          {selectedStatement && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-900">
              ✓ Selecionado: <strong>{selectedStatement.description}</strong>
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unreconciledStatements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Todos os extratos conciliados!</p>
              </div>
            ) : (
              unreconciledStatements.map((statement) => (
                <div 
                  key={statement.id} 
                  onClick={() => toggleStatementSelection(statement)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedStatement?.id === statement.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {statement.description}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDate(statement.date)}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      statement.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(statement.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Reconciled Items */}
      <Card title="Itens Conciliados Recentemente">
        <div className="space-y-2">
          {transactions
            .filter(t => t.reconciled)
            .slice(0, 5)
            .map((transaction) => {
              const statement = bankStatements.find(s => s.id === transaction.statementId)
              return (
                <div key={transaction.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(transaction.date)} • {transaction.category}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  {statement && (
                    <div className="mt-2 pl-8 text-sm text-gray-600">
                      Conciliado com: {statement.description}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </Card>

      {/* Imported Statements */}
      {importedStatements.length > 0 && (
        <Card title={`Extratos Importados (${importedStatements.length})`}>
          <div className="space-y-2">
            {importedStatements.map((statement, index) => (
              <div key={statement.id || `imported-${index}`} className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {statement.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(statement.date)}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    statement.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(statement.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar Extrato Bancário"
        size="lg"
      >
        <BankStatementImport
          onImport={handleImportStatements}
          onClose={() => setIsImportModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default BankReconciliation
