-- ============================================
-- DESABILITAR RLS PARA DESENVOLVIMENTO
-- ============================================
-- ⚠️ APENAS PARA DESENVOLVIMENTO!
-- Em produção, configure as políticas corretamente
-- ============================================

-- Desabilitar RLS em todas as tabelas
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'companies', 'users', 'bank_accounts', 'credit_cards', 
    'suppliers', 'categories', 'transactions', 'budgets', 'bank_statements'
)
ORDER BY tablename;

-- ============================================
-- RESULTADO ESPERADO:
-- Todas as tabelas devem mostrar rls_enabled = false
-- ============================================
