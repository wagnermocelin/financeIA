-- ============================================
-- ADICIONAR TABELA DE CONTAS BANCÁRIAS
-- ============================================

-- Tabela de contas bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    agency VARCHAR(20),
    account_type VARCHAR(20) DEFAULT 'checking', -- checking, savings, investment
    initial_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company ON bank_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(active);

-- Trigger para updated_at
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar coluna bank_account_id nas tabelas relacionadas
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;

ALTER TABLE bank_statements 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_bank_account ON bank_statements(bank_account_id);

-- Adicionar campo para identificar duplicatas
ALTER TABLE bank_statements
ADD COLUMN IF NOT EXISTS hash_key VARCHAR(255) UNIQUE;

-- Índice para busca rápida de duplicatas
CREATE INDEX IF NOT EXISTS idx_bank_statements_hash ON bank_statements(hash_key);

-- Comentários
COMMENT ON TABLE bank_accounts IS 'Contas bancárias da empresa';
COMMENT ON COLUMN bank_accounts.current_balance IS 'Saldo atual atualizado automaticamente';
COMMENT ON COLUMN bank_statements.hash_key IS 'Hash único para evitar duplicação (data+descrição+valor+tipo)';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
