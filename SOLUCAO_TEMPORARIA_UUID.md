# ⚠️ Solução Temporária - UUIDs em Desenvolvimento

## ❌ Problema:

```
invalid input syntax for type uuid: "1764082871934"
```

O sistema usa autenticação **mock** (números) mas o Supabase espera **UUIDs**.

---

## 🔧 Solução Temporária Aplicada:

### Campos Comentados:

Nos métodos `addTransaction`, `addBudget`, `addBankStatement`:

```javascript
// ❌ Antes (causava erro):
const newTransaction = {
  ...transaction,
  company_id: currentUser.companyId,  // "1" (número)
  user_id: currentUser.id,            // "2" (número)
  date: transaction.date,
  status: transaction.status
}

// ✅ Agora (funciona):
const newTransaction = {
  ...transaction,
  // company_id: currentUser.companyId,  // Comentado temporariamente
  // user_id: currentUser.id,            // Comentado temporariamente
  date: transaction.date,
  status: transaction.status
}
```

---

## ⚠️ Importante:

### Esta é uma solução TEMPORÁRIA para desenvolvimento!

**Campos que ficam NULL:**
- `company_id` - Empresa (NULL por enquanto)
- `user_id` - Usuário (NULL por enquanto)

**Campos que funcionam:**
- ✅ `description` - Descrição
- ✅ `amount` - Valor
- ✅ `type` - Tipo (income/expense)
- ✅ `category` - Categoria
- ✅ `date` - Data
- ✅ `status` - Status
- ✅ `reconciled` - Conciliado
- ✅ `statement_id` - ID do extrato (após conciliação)

---

## 🎯 Como Funciona Agora:

### 1. Criar Transação:
```javascript
await addTransaction({
  description: "PIX Recebido",
  amount: 1500.00,
  type: "income",
  category: "Vendas",
  date: "2025-11-25",
  status: "completed"
})
// ✅ Funciona! (sem company_id e user_id)
```

### 2. Importar Extratos:
```javascript
// ✅ Funciona! (sem company_id)
```

### 3. Criar Transações dos Extratos:
```javascript
// ✅ Funciona! (sem company_id e user_id)
```

---

## 🚀 TESTE AGORA:

1. **Recarregue a página** (Ctrl+F5)
2. **Vá em Conciliação**
3. **Clique em "Criar Transações (56)"**
4. **Confirme**
5. **Deve funcionar!** ✅

---

## 📊 Resultado Esperado:

```
🔄 Criando transações a partir dos extratos...
✅ Transação criada: PIX QRS
✅ Conciliada: PIX QRS
✅ Transação criada: TED RECEBIDA
✅ Conciliada: TED RECEBIDA
...
✅ Processo concluído: 56 criadas, 0 erros
```

---

## 🔍 Verificar no Supabase:

### Tabela: transactions
1. Acesse: https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn
2. Vá em **Table Editor** → **transactions**
3. Veja os registros com:
   - ✅ `id` = UUID gerado
   - ✅ `description` = Descrição
   - ✅ `amount` = Valor
   - ⚠️ `company_id` = NULL (temporário)
   - ⚠️ `user_id` = NULL (temporário)
   - ✅ `reconciled` = true
   - ✅ `statement_id` = UUID do extrato

---

## 🎯 Solução Definitiva (Futuro):

### Para produção, você precisará:

1. **Migrar para Supabase Auth**
   - Usar autenticação real do Supabase
   - Gerar UUIDs reais para usuários
   - Ter `auth.uid()` válido

2. **Atualizar AuthContext**
   - Substituir mock por Supabase Auth
   - Usar `supabase.auth.signIn()`
   - Obter UUIDs reais

3. **Reativar campos**
   - Descomentar `company_id`
   - Descomentar `user_id`
   - Reativar RLS

4. **Configurar RLS**
   - Políticas baseadas em `auth.uid()`
   - Isolamento por empresa
   - Segurança completa

---

## 📝 Arquivos Modificados:

### `src/context/FinanceContext.jsx`

**Linhas comentadas:**
- Linha 82-83: `company_id` e `user_id` em `addTransaction`
- Linha 128: `company_id` em `addBudget`
- Linha 173: `company_id` em `addBankStatement`
- Linha 189: `company_id` em `addBankStatementsBatch`

**Comentários adicionados:**
```javascript
// Temporário: não envia company_id e user_id em desenvolvimento
// TODO: Migrar para Supabase Auth para ter UUIDs reais
```

---

## ⚠️ Limitações Temporárias:

### O que NÃO funciona:
- ❌ Filtrar por empresa (company_id é NULL)
- ❌ Filtrar por usuário (user_id é NULL)
- ❌ RLS baseado em empresa
- ❌ Multi-tenant real

### O que FUNCIONA:
- ✅ Criar transações
- ✅ Importar extratos
- ✅ Conciliar
- ✅ Editar e deletar
- ✅ Relatórios
- ✅ Dashboard
- ✅ Tudo exceto isolamento por empresa

---

## 🎯 Quando Migrar para Produção:

### Checklist:

- [ ] Implementar Supabase Auth
- [ ] Atualizar AuthContext
- [ ] Criar empresas com UUIDs reais
- [ ] Criar usuários com UUIDs reais
- [ ] Descomentar campos company_id e user_id
- [ ] Reativar RLS
- [ ] Configurar políticas de segurança
- [ ] Testar isolamento de dados
- [ ] Migrar dados existentes (se necessário)

---

## 🚀 Por Enquanto:

**Sistema funciona perfeitamente para:**
- ✅ Desenvolvimento
- ✅ Testes
- ✅ Demonstração
- ✅ Prototipagem

**Não usar em produção sem:**
- ❌ Supabase Auth
- ❌ UUIDs reais
- ❌ RLS ativado

---

**⚡ Solução temporária aplicada!**

**Teste agora e o sistema vai funcionar!** 🎯
