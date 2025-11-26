-- ============================================
-- MIGRAÇÃO: Adicionar coluna 'imported' na tabela bank_statements
-- ============================================

-- Adicionar coluna imported
ALTER TABLE bank_statements 
ADD COLUMN IF NOT EXISTS imported BOOLEAN DEFAULT TRUE;

-- Comentário na coluna
COMMENT ON COLUMN bank_statements.imported IS 'Indica se o extrato foi importado de arquivo';

-- Atualizar registros existentes
UPDATE bank_statements 
SET imported = TRUE 
WHERE imported IS NULL;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
