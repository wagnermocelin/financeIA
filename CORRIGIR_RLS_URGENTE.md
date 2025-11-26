# 🚨 ERRO DE PERMISSÃO - Row Level Security (RLS)

## ❌ Problema:

```
new row violates row-level security policy for table "bank_statements"
401 Unauthorized
```

---

## 🔍 Causa:

O **Row Level Security (RLS)** do Supabase está **bloqueando** as inserções porque:

1. ❌ O sistema usa autenticação **mock** (localStorage)
2. ❌ O Supabase espera autenticação **real** (Supabase Auth)
3. ❌ Não há `auth.uid()` válido
4. ❌ RLS bloqueia acesso sem autenticação

---

## ✅ SOLUÇÃO RÁPIDA (Desenvolvimento):

### Desabilitar RLS temporariamente:

1. **Acesse:** https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn/sql

2. **Clique em:** "+ New query"

3. **Cole e execute:**

```sql
-- Desabilitar RLS em todas as tabelas
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements DISABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_invoices DISABLE ROW LEVEL SECURITY;
```

4. **Clique em:** Run ▶️

5. **Aguarde:** "Success"

---

## 🚀 Após Executar:

1. **Recarregue a página** (Ctrl+F5)
2. **Tente importar o extrato novamente**
3. **Deve funcionar!** ✅

---

## ⚠️ IMPORTANTE:

### Esta solução é para DESENVOLVIMENTO/TESTES!

**Em produção você deve:**
1. Migrar para Supabase Auth (real)
2. Configurar políticas RLS corretas
3. Usar `auth.uid()` para isolamento de dados

**Por enquanto, para testar:**
- ✅ RLS desabilitado = acesso total
- ✅ Funciona para desenvolvimento
- ❌ NÃO usar em produção

---

## 🔐 Alternativa Mais Segura:

Se quiser manter RLS ativo mas permitir acesso:

```sql
-- Manter RLS ativo
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva
CREATE POLICY "Allow all for development" ON bank_statements
    FOR ALL USING (true) WITH CHECK (true);
```

Repita para cada tabela que precisar.

---

## 📋 Arquivo Criado:

`supabase-fix-rls.sql` contém o script completo.

---

## 🎯 Resumo Rápido:

```
1. Acesse: https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn/sql
2. Cole: ALTER TABLE bank_statements DISABLE ROW LEVEL SECURITY;
3. Execute para todas as tabelas
4. Recarregue: Ctrl+F5
5. Importe: Tente novamente
6. Sucesso! ✅
```

---

## 📊 Próximos Passos (Futuro):

Para produção, você precisará:

1. **Migrar AuthContext** para Supabase Auth
2. **Configurar políticas RLS** corretas
3. **Usar JWT tokens** do Supabase
4. **Isolar dados** por empresa

Mas por enquanto, desabilitar RLS resolve para testes!

---

**🚨 Execute o SQL agora e me avise quando terminar!**

**Depois tente importar o extrato novamente!** 🎉
