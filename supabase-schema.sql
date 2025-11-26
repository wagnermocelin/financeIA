-- ============================================
-- FINANCEIA - Schema do Banco de Dados Supabase
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: nfe_invoices (Notas Fiscais)
-- ============================================
CREATE TABLE IF NOT EXISTS nfe_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    access_key VARCHAR(44) UNIQUE NOT NULL,
    number VARCHAR(20) NOT NULL,
    series VARCHAR(10),
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'authorized', -- authorized, cancelled, denied
    issuer_cnpj VARCHAR(18),
    issuer_name VARCHAR(255),
    recipient_cnpj VARCHAR(18),
    recipient_name VARCHAR(255),
    xml_content TEXT,
    imported BOOLEAN DEFAULT FALSE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para Performance
-- ============================================

-- Índices para companies
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_status ON companies(status);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

-- Índices para categories
CREATE INDEX idx_categories_company_id ON categories(company_id);
CREATE INDEX idx_categories_type ON categories(type);

-- Índices para transactions
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_reconciled ON transactions(reconciled);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Índices para budgets
CREATE INDEX idx_budgets_company_id ON budgets(company_id);
CREATE INDEX idx_budgets_category ON budgets(category);

-- Índices para bank_statements
CREATE INDEX idx_bank_statements_company_id ON bank_statements(company_id);
CREATE INDEX idx_bank_statements_date ON bank_statements(date);
CREATE INDEX idx_bank_statements_reconciled ON bank_statements(reconciled);
CREATE INDEX idx_bank_statements_transaction_id ON bank_statements(transaction_id);

-- Índices para nfe_invoices
CREATE INDEX idx_nfe_invoices_company_id ON nfe_invoices(company_id);
CREATE INDEX idx_nfe_invoices_access_key ON nfe_invoices(access_key);
CREATE INDEX idx_nfe_invoices_issue_date ON nfe_invoices(issue_date);
CREATE INDEX idx_nfe_invoices_imported ON nfe_invoices(imported);

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

-- Triggers para cada tabela
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

CREATE TRIGGER update_nfe_invoices_updated_at BEFORE UPDATE ON nfe_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (exemplo básico - ajustar conforme necessário)
-- Usuários podem ver apenas dados da própria empresa

CREATE POLICY "Users can view own company data" ON companies
    FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE company_id = companies.id));

CREATE POLICY "Users can view own company transactions" ON transactions
    FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company transactions" ON transactions
    FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update own company transactions" ON transactions
    FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- DADOS INICIAIS (Seed Data)
-- ============================================

-- Inserir empresa de exemplo
INSERT INTO companies (id, name, cnpj, email, plan, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Empresa Exemplo Ltda', '12.345.678/0001-90', 'contato@exemplo.com', 'premium', 'active')
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir usuário admin de exemplo (senha: admin123 - hash bcrypt)
INSERT INTO users (id, company_id, name, email, password_hash, role, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@financeia.com', '$2a$10$rOZxQKZhKKZhKKZhKKZhKe', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (company_id, name, type, icon, color) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Vendas', 'income', 'TrendingUp', '#10b981'),
    ('00000000-0000-0000-0000-000000000001', 'Serviços', 'income', 'Briefcase', '#3b82f6'),
    ('00000000-0000-0000-0000-000000000001', 'Salários', 'expense', 'Users', '#ef4444'),
    ('00000000-0000-0000-0000-000000000001', 'Aluguel', 'expense', 'Home', '#f59e0b'),
    ('00000000-0000-0000-0000-000000000001', 'Fornecedores', 'expense', 'Package', '#8b5cf6'),
    ('00000000-0000-0000-0000-000000000001', 'Marketing', 'expense', 'Megaphone', '#ec4899'),
    ('00000000-0000-0000-0000-000000000001', 'Utilidades', 'expense', 'Zap', '#14b8a6'),
    ('00000000-0000-0000-0000-000000000001', 'Impostos', 'expense', 'FileText', '#f97316')
ON CONFLICT (company_id, name, type) DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Resumo financeiro por empresa
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    t.company_id,
    DATE_TRUNC('month', t.date) as month,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END) as balance
FROM transactions t
WHERE t.status = 'completed'
GROUP BY t.company_id, DATE_TRUNC('month', t.date);

-- View: Status de orçamentos
CREATE OR REPLACE VIEW budget_status AS
SELECT 
    b.id,
    b.company_id,
    b.category,
    b.limit_amount,
    COALESCE(SUM(t.amount), 0) as spent,
    b.limit_amount - COALESCE(SUM(t.amount), 0) as remaining,
    ROUND((COALESCE(SUM(t.amount), 0) / b.limit_amount * 100)::numeric, 2) as percentage
FROM budgets b
LEFT JOIN transactions t ON 
    t.company_id = b.company_id AND 
    t.category = b.category AND 
    t.type = 'expense' AND
    t.status = 'completed' AND
    DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY b.id, b.company_id, b.category, b.limit_amount;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE companies IS 'Empresas cadastradas no sistema';
COMMENT ON TABLE users IS 'Usuários do sistema vinculados a empresas';
COMMENT ON TABLE categories IS 'Categorias de receitas e despesas';
COMMENT ON TABLE transactions IS 'Transações financeiras (receitas e despesas)';
COMMENT ON TABLE budgets IS 'Orçamentos por categoria';
COMMENT ON TABLE bank_statements IS 'Extratos bancários importados';
COMMENT ON TABLE nfe_invoices IS 'Notas fiscais eletrônicas';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
