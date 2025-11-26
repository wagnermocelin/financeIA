-- ============================================
-- ADICIONAR COLUNA hash_key PARA EVITAR DUPLICATAS
-- ============================================

-- Adicionar coluna hash_key na tabela bank_statements
ALTER TABLE bank_statements
ADD COLUMN IF NOT EXISTS hash_key VARCHAR(255) UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_bank_statements_hash ON bank_statements(hash_key);

-- Comentário
COMMENT ON COLUMN bank_statements.hash_key IS 'Hash único para evitar duplicação (data+descrição+valor+tipo)';

-- Verificar se foi criada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bank_statements' 
AND column_name = 'hash_key';

-- ============================================
-- RESULTADO ESPERADO:
-- column_name | data_type      | is_nullable
-- hash_key    | character varying | YES
-- ============================================
