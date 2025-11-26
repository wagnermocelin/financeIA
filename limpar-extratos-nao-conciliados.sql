-- ============================================
-- LIMPAR APENAS EXTRATOS NÃO CONCILIADOS
-- ============================================
-- Mantém: extratos conciliados, transações
-- Deleta: apenas extratos com reconciled = false
-- ============================================

-- Ver quantos extratos não conciliados existem
SELECT 
    'Extratos não conciliados' as tipo,
    COUNT(*) as quantidade
FROM bank_statements
WHERE reconciled = false;

-- Deletar apenas extratos não conciliados
DELETE FROM bank_statements
WHERE reconciled = false;

-- Verificar resultado
SELECT 
    'Total de extratos' as tipo,
    COUNT(*) as quantidade
FROM bank_statements
UNION ALL
SELECT 
    'Extratos conciliados',
    COUNT(*)
FROM bank_statements
WHERE reconciled = true
UNION ALL
SELECT 
    'Extratos não conciliados',
    COUNT(*)
FROM bank_statements
WHERE reconciled = false;

-- ============================================
-- RESULTADO ESPERADO:
-- Total de extratos: X (apenas os conciliados)
-- Extratos conciliados: X
-- Extratos não conciliados: 0
-- ============================================

-- Verificar transações (devem permanecer intactas)
SELECT 
    'Transações' as tipo,
    COUNT(*) as quantidade
FROM transactions;
