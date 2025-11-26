-- ============================================
-- LIMPAR TODOS OS DADOS DO SUPABASE
-- ============================================
-- ATENÇÃO: Isso vai deletar TODOS os dados!
-- Use apenas em desenvolvimento/testes
-- ============================================

-- Deletar na ordem correta (por causa das foreign keys)
DELETE FROM nfe_invoices;
DELETE FROM bank_statements;
DELETE FROM budgets;
DELETE FROM transactions;
DELETE FROM categories WHERE company_id IS NOT NULL; -- Mantém categorias padrão (sem company_id)
DELETE FROM users;
DELETE FROM companies;

-- Verificar se está vazio
SELECT 'companies' as tabela, COUNT(*) as registros FROM companies
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories WHERE company_id IS NOT NULL
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'budgets', COUNT(*) FROM budgets
UNION ALL
SELECT 'bank_statements', COUNT(*) FROM bank_statements
UNION ALL
SELECT 'nfe_invoices', COUNT(*) FROM nfe_invoices;

-- ============================================
-- RESULTADO ESPERADO:
-- Todas as tabelas com 0 registros
-- (exceto categories padrão que ficam)
-- ============================================
