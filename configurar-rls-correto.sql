-- ============================================
-- CONFIGURAR RLS CORRETAMENTE
-- ============================================
-- Políticas RLS para desenvolvimento e produção
-- ============================================

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS
-- ============================================

-- Companies
DROP POLICY IF EXISTS "Users can view own company bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can view own company credit cards" ON credit_cards;
DROP POLICY IF EXISTS "Users can view own company suppliers" ON suppliers;

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA COMPANIES (Empresas)
-- ============================================

-- Permitir SELECT para todos (desenvolvimento)
CREATE POLICY "Allow all to view companies" ON companies
    FOR SELECT USING (true);

-- Permitir INSERT para todos (desenvolvimento)
CREATE POLICY "Allow all to insert companies" ON companies
    FOR INSERT WITH CHECK (true);

-- Permitir UPDATE para todos (desenvolvimento)
CREATE POLICY "Allow all to update companies" ON companies
    FOR UPDATE USING (true);

-- Permitir DELETE para todos (desenvolvimento)
CREATE POLICY "Allow all to delete companies" ON companies
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA USERS (Usuários)
-- ============================================

CREATE POLICY "Allow all to view users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update users" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete users" ON users
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA BANK_ACCOUNTS (Contas Bancárias)
-- ============================================

CREATE POLICY "Allow all to view bank accounts" ON bank_accounts
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert bank accounts" ON bank_accounts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update bank accounts" ON bank_accounts
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete bank accounts" ON bank_accounts
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA CREDIT_CARDS (Cartões de Crédito)
-- ============================================

CREATE POLICY "Allow all to view credit cards" ON credit_cards
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert credit cards" ON credit_cards
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update credit cards" ON credit_cards
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete credit cards" ON credit_cards
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA SUPPLIERS (Fornecedores)
-- ============================================

CREATE POLICY "Allow all to view suppliers" ON suppliers
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert suppliers" ON suppliers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update suppliers" ON suppliers
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete suppliers" ON suppliers
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA CATEGORIES (Categorias)
-- ============================================

CREATE POLICY "Allow all to view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert categories" ON categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update categories" ON categories
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete categories" ON categories
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA TRANSACTIONS (Transações)
-- ============================================

CREATE POLICY "Allow all to view transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update transactions" ON transactions
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete transactions" ON transactions
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA BUDGETS (Orçamentos)
-- ============================================

CREATE POLICY "Allow all to view budgets" ON budgets
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert budgets" ON budgets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update budgets" ON budgets
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete budgets" ON budgets
    FOR DELETE USING (true);

-- ============================================
-- POLÍTICAS PARA BANK_STATEMENTS (Extratos Bancários)
-- ============================================

CREATE POLICY "Allow all to view bank statements" ON bank_statements
    FOR SELECT USING (true);

CREATE POLICY "Allow all to insert bank statements" ON bank_statements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update bank statements" ON bank_statements
    FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete bank statements" ON bank_statements
    FOR DELETE USING (true);

-- ============================================
-- VERIFICAR POLÍTICAS CRIADAS
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- VERIFICAR STATUS DO RLS
-- ============================================

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
-- ✅ RLS habilitado em todas as tabelas (true)
-- ✅ 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Total: 36 políticas criadas
-- ============================================

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 
-- 🔓 DESENVOLVIMENTO:
-- Estas políticas permitem acesso total (USING true)
-- Ideal para desenvolvimento sem autenticação
--
-- 🔒 PRODUÇÃO (Implementar depois):
-- Substituir por políticas baseadas em:
-- - auth.uid() = user_id
-- - company_id = (SELECT company_id FROM users WHERE id = auth.uid())
-- - role = 'admin' OR role = 'owner'
--
-- 📝 EXEMPLO DE POLÍTICA RESTRITIVA (Produção):
-- CREATE POLICY "Users view own company data" ON transactions
--     FOR SELECT USING (
--         company_id IN (
--             SELECT company_id FROM users WHERE id = auth.uid()
--         )
--     );
--
-- ============================================
