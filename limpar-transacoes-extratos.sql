-- ============================================
-- LIMPAR APENAS TRANSAÇÕES E EXTRATOS
-- ============================================
-- Mantém: empresas, usuários, categorias, orçamentos
-- Deleta: transações e extratos bancários
-- ============================================

-- Deletar transações e extratos
DELETE FROM transactions;
DELETE FROM bank_statements;

-- Verificar se foi deletado
SELECT 'transactions' as tabela, COUNT(*) as registros FROM transactions
UNION ALL
SELECT 'bank_statements', COUNT(*) FROM bank_statements;

-- ============================================
-- RESULTADO ESPERADO:
-- transactions: 0 registros
-- bank_statements: 0 registros
-- ============================================

-- Verificar o que sobrou (opcional)
SELECT 'categories' as tabela, COUNT(*) as registros FROM categories
UNION ALL
SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'users', COUNT(*) FROM users;
