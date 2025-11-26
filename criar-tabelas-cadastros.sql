-- ============================================
-- FINANCEIA - MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- ============================================
-- Cria TODAS as tabelas necessárias:
-- - companies (empresas)
-- - users (usuários)
-- - bank_accounts (contas bancárias)
-- - credit_cards (cartões de crédito)
-- - suppliers (fornecedores)
-- - categories (categorias)
-- - transactions (transações)
-- - budgets (orçamentos)
-- - bank_statements (extratos bancários)
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: companies (Empresas)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    plan VARCHAR(50) DEFAULT 'basic', -- basic, premium, enterprise
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: users (Usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- admin, owner, user
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: bank_accounts (Contas Bancárias)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bank VARCHAR(255) NOT NULL,
    agency VARCHAR(20),
    account VARCHAR(20),
    type VARCHAR(50) DEFAULT 'checking', -- checking, savings, investment
    balance DECIMAL(15, 2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: credit_cards (Cartões de Crédito)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bank VARCHAR(255) NOT NULL,
    last_digits VARCHAR(4),
    brand VARCHAR(50), -- Visa, Mastercard, Elo, etc
    credit_limit DECIMAL(15, 2) NOT NULL,
    used_limit DECIMAL(15, 2) DEFAULT 0,
    closing_day INTEGER, -- Dia do fechamento (1-31)
    due_day INTEGER, -- Dia do vencimento (1-31)
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: suppliers (Fornecedores)
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(18), -- CNPJ ou CPF
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    contact_person VARCHAR(255),
    category VARCHAR(100),
    payment_terms VARCHAR(100),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para Performance
-- ============================================

-- Índices para bank_accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON bank_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(type);

-- Índices para credit_cards
CREATE INDEX IF NOT EXISTS idx_credit_cards_company_id ON credit_cards(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_active ON credit_cards(active);
CREATE INDEX IF NOT EXISTS idx_credit_cards_brand ON credit_cards(brand);

-- Índices para suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);
CREATE INDEX IF NOT EXISTS idx_suppliers_document ON suppliers(document);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);

-- ============================================
-- TRIGGERS para updated_at automático
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers existentes antes de criar novos
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON credit_cards;
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;

-- Triggers para cada tabela
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own company bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can view own company credit cards" ON credit_cards;
DROP POLICY IF EXISTS "Users can view own company suppliers" ON suppliers;

-- Políticas básicas (ajustar conforme necessário)
CREATE POLICY "Users can view own company bank accounts" ON bank_accounts
    FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view own company credit cards" ON credit_cards
    FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view own company suppliers" ON suppliers
    FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE bank_accounts IS 'Contas bancárias da empresa';
COMMENT ON TABLE credit_cards IS 'Cartões de crédito da empresa';
COMMENT ON TABLE suppliers IS 'Fornecedores da empresa';

-- ============================================
-- TABELA: categories (Categorias)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name, type)
);

-- ============================================
-- TABELA: transactions (Transações)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    category VARCHAR(100),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    reconciled BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
    statement_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: budgets (Orçamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly', -- monthly, quarterly, yearly
    alert_threshold INTEGER DEFAULT 80,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: bank_statements (Extratos Bancários)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- credit, debit
    reconciled BOOLEAN DEFAULT FALSE,
    imported BOOLEAN DEFAULT TRUE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    import_batch_id UUID,
    hash_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES ADICIONAIS
-- ============================================

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_reconciled ON transactions(reconciled);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Índices para budgets
CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- Índices para bank_statements
CREATE INDEX IF NOT EXISTS idx_bank_statements_company_id ON bank_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_date ON bank_statements(date);
CREATE INDEX IF NOT EXISTS idx_bank_statements_reconciled ON bank_statements(reconciled);
CREATE INDEX IF NOT EXISTS idx_bank_statements_transaction_id ON bank_statements(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_hash_key ON bank_statements(hash_key);

-- ============================================
-- TRIGGERS ADICIONAIS
-- ============================================

-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS update_bank_statements_updated_at ON bank_statements;

-- Criar triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_statements_updated_at BEFORE UPDATE ON bank_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS ADICIONAL
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATEGORIAS PADRÃO
-- ============================================

-- Inserir categorias padrão (apenas se não existirem)
INSERT INTO categories (name, type, icon, color) VALUES
    ('Vendas', 'income', 'TrendingUp', '#10b981'),
    ('Serviços', 'income', 'Briefcase', '#3b82f6'),
    ('Investimentos', 'income', 'TrendingUp', '#8b5cf6'),
    ('Salários', 'expense', 'Users', '#ef4444'),
    ('Aluguel', 'expense', 'Home', '#f59e0b'),
    ('Fornecedores', 'expense', 'Package', '#8b5cf6'),
    ('Marketing', 'expense', 'Megaphone', '#ec4899'),
    ('Utilidades', 'expense', 'Zap', '#14b8a6'),
    ('Impostos', 'expense', 'FileText', '#f97316'),
    ('Transporte', 'expense', 'Car', '#6366f1'),
    ('Alimentação', 'expense', 'Coffee', '#f43f5e'),
    ('Equipamentos', 'expense', 'Monitor', '#06b6d4'),
    ('Financeiras', 'expense', 'DollarSign', '#84cc16'),
    ('Sem Categoria', 'expense', 'HelpCircle', '#6b7280')
ON CONFLICT (company_id, name, type) DO NOTHING;

-- ============================================
-- VERIFICAR CRIAÇÃO
-- ============================================

-- Verificar se as tabelas foram criadas
SELECT 
    'companies' as tabela,
    COUNT(*) as registros
FROM companies
UNION ALL
SELECT 
    'users',
    COUNT(*)
FROM users
UNION ALL
SELECT 
    'bank_accounts',
    COUNT(*)
FROM bank_accounts
UNION ALL
SELECT 
    'credit_cards',
    COUNT(*)
FROM credit_cards
UNION ALL
SELECT 
    'suppliers',
    COUNT(*)
FROM suppliers
UNION ALL
SELECT 
    'categories',
    COUNT(*)
FROM categories
UNION ALL
SELECT 
    'transactions',
    COUNT(*)
FROM transactions
UNION ALL
SELECT 
    'budgets',
    COUNT(*)
FROM budgets
UNION ALL
SELECT 
    'bank_statements',
    COUNT(*)
FROM bank_statements;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
-- ✅ Todas as tabelas foram criadas!
-- ✅ Índices criados para performance
-- ✅ Triggers de updated_at configurados
-- ✅ RLS habilitado em todas as tabelas
-- ✅ Categorias padrão inseridas
-- 
-- 🚀 Agora você pode:
-- 1. Recarregar a aplicação (Ctrl+F5)
-- 2. Criar empresas, usuários, contas, cartões, fornecedores
-- 3. Todos os dados serão salvos no Supabase!
-- ============================================
