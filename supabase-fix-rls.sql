-- ============================================
-- CORREÇÃO TEMPORÁRIA: Desabilitar RLS para testes
-- ============================================
-- ATENÇÃO: Isso permite acesso total aos dados
-- Use apenas em desenvolvimento/testes
-- Em produção, configure Supabase Auth corretamente
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own company data" ON companies;
DROP POLICY IF EXISTS "Users can insert own company data" ON companies;
DROP POLICY IF EXISTS "Users can update own company data" ON companies;

-- Desabilitar RLS temporariamente
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements DISABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_invoices DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVA: Políticas permissivas (mais seguro)
-- ============================================
-- Se preferir manter RLS ativo mas permitir acesso:

-- ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all for bank_statements" ON bank_statements
--     FOR ALL USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow all for transactions" ON transactions
--     FOR ALL USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow all for budgets" ON budgets
--     FOR ALL USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow all for categories" ON categories
--     FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FIM DA CORREÇÃO
-- ============================================
