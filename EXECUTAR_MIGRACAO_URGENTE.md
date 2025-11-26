# 🚨 MIGRAÇÃO URGENTE - Adicionar Coluna 'imported'

## ❌ Problema Encontrado:

A tabela `bank_statements` não tem a coluna `imported`, causando erro ao importar extratos:

```
Could not find the 'imported' column of 'bank_statements' in the schema cache
```

---

## ✅ Solução Rápida:

### Execute este SQL no Supabase:

1. **Acesse:** https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn/sql
2. **Clique em:** "+ New query"
3. **Cole este código:**

```sql
-- Adicionar coluna imported
ALTER TABLE bank_statements 
ADD COLUMN IF NOT EXISTS imported BOOLEAN DEFAULT TRUE;

-- Comentário na coluna
COMMENT ON COLUMN bank_statements.imported IS 'Indica se o extrato foi importado de arquivo';

-- Atualizar registros existentes
UPDATE bank_statements 
SET imported = TRUE 
WHERE imported IS NULL;
```

4. **Clique em:** Run ▶️
5. **Aguarde:** "Success. No rows returned"

---

## 🔍 Verificar:

1. Vá em **Table Editor**
2. Clique em **bank_statements**
3. Verifique se a coluna **imported** aparece
4. Tipo: `boolean`
5. Default: `true`

---

## 🚀 Após Executar:

1. **Recarregue a página** do sistema (Ctrl+F5)
2. **Tente importar o extrato novamente**
3. **Deve funcionar!** ✅

---

## 📋 Arquivo de Migração:

O arquivo `supabase-migration-add-imported.sql` contém o mesmo código acima.

---

## ⏱️ Tempo Estimado:

- **1 minuto** para executar a migração
- **Sem downtime** - sistema continua funcionando

---

**🎯 Execute agora e depois tente importar o extrato novamente!**
