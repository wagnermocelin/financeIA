# 🔧 Corrigir Cadastros no Supabase

## ⚠️ Problema:

Contas bancárias, cartões de crédito e fornecedores estão usando **dados mock** que desaparecem ao recarregar.

---

## ✅ Solução Implementada:

### 1. Criar Tabelas no Supabase
SQL para criar as tabelas necessárias

### 2. Serviços Criados (`registersService.js`)
- CRUD de Contas Bancárias
- CRUD de Cartões de Crédito
- CRUD de Fornecedores

### 3. Novo Contexto (`RegistersContext_NEW.jsx`)
- Usa Supabase em vez de dados mock
- Persiste dados no banco
- Carrega dados do banco

---

## 🚀 Passo a Passo:

### PASSO 1: Criar Tabelas no Supabase

1. Abra o Supabase: https://mfkmvtobcdajqbveytfn.supabase.co
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo de `criar-tabelas-cadastros.sql`
5. Cole no editor
6. Clique em **Run** (F5)
7. ✅ Aguarde: "Success. No rows returned"

### PASSO 2: Aplicar Novo Contexto

Execute no terminal:

```powershell
# Fazer backup
Copy-Item src/context/RegistersContext.jsx src/context/RegistersContext_OLD.jsx

# Aplicar novo
Copy-Item src/context/RegistersContext_NEW.jsx src/context/RegistersContext.jsx -Force
```

### PASSO 3: Recarregar

```
Ctrl+F5 (recarregar completo)
```

---

## 📊 Estrutura das Tabelas:

### bank_accounts (Contas Bancárias)
```sql
- id (UUID)
- company_id (UUID)
- name (VARCHAR)
- bank (VARCHAR)
- agency (VARCHAR)
- account (VARCHAR)
- type (VARCHAR) -- checking, savings, investment
- balance (DECIMAL)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### credit_cards (Cartões de Crédito)
```sql
- id (UUID)
- company_id (UUID)
- name (VARCHAR)
- bank (VARCHAR)
- last_digits (VARCHAR)
- brand (VARCHAR) -- Visa, Mastercard, Elo
- credit_limit (DECIMAL)
- used_limit (DECIMAL)
- closing_day (INTEGER)
- due_day (INTEGER)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### suppliers (Fornecedores)
```sql
- id (UUID)
- company_id (UUID)
- name (VARCHAR)
- document (VARCHAR) -- CNPJ/CPF
- email (VARCHAR)
- phone (VARCHAR)
- address (TEXT)
- city (VARCHAR)
- state (VARCHAR)
- zip_code (VARCHAR)
- contact_person (VARCHAR)
- category (VARCHAR)
- payment_terms (VARCHAR)
- notes (TEXT)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🎯 Teste Após Aplicar:

### Teste 1: Conta Bancária
1. Vá em **Contas Bancárias**
2. Clique em **"Nova Conta"**
3. Preencha:
   - Nome: Conta Teste
   - Banco: Banco do Brasil
   - Agência: 1234-5
   - Conta: 12345-6
   - Tipo: Corrente
   - Saldo: 10000
4. Salve
5. **Recarregue (F5)**
6. ✅ **A conta deve continuar lá!**

### Teste 2: Cartão de Crédito
1. Vá em **Cartões de Crédito**
2. Clique em **"Novo Cartão"**
3. Preencha:
   - Nome: Cartão Teste
   - Banco: Itaú
   - Últimos Dígitos: 1234
   - Bandeira: Visa
   - Limite: 50000
   - Dia Fechamento: 10
   - Dia Vencimento: 20
4. Salve
5. **Recarregue (F5)**
6. ✅ **O cartão deve continuar lá!**

### Teste 3: Fornecedor
1. Vá em **Fornecedores**
2. Clique em **"Novo Fornecedor"**
3. Preencha:
   - Nome: Fornecedor Teste
   - CNPJ: 12.345.678/0001-90
   - Email: teste@teste.com
   - Telefone: (41) 3333-4444
4. Salve
5. **Recarregue (F5)**
6. ✅ **O fornecedor deve continuar lá!**

### Teste 4: Verificar no Supabase
1. Abra o Supabase
2. Vá em **Table Editor**
3. Abra as tabelas:
   - `bank_accounts`
   - `credit_cards`
   - `suppliers`
4. ✅ **Os dados devem estar lá!**

---

## 🔍 Logs Esperados:

### Ao Carregar Página:
```
🔄 Carregando cadastros...
🏦 Contas bancárias carregadas: 0
💳 Cartões carregados: 0
📦 Fornecedores carregados: 0
✅ Cadastros carregados: { accounts: 0, cards: 0, suppliers: 0 }
```

### Ao Criar Conta:
```
➕ Adicionando conta bancária...
➕ Criando conta bancária: Conta Teste
✅ Conta criada: Conta Teste
🏦 Contas bancárias carregadas: 1
```

### Ao Criar Cartão:
```
➕ Adicionando cartão...
➕ Criando cartão: Cartão Teste
✅ Cartão criado: Cartão Teste
💳 Cartões carregados: 1
```

### Ao Criar Fornecedor:
```
➕ Adicionando fornecedor...
➕ Criando fornecedor: Fornecedor Teste
✅ Fornecedor criado: Fornecedor Teste
📦 Fornecedores carregados: 1
```

---

## 📁 Arquivos Criados:

1. ✅ `criar-tabelas-cadastros.sql` - SQL para criar tabelas
2. ✅ `src/services/registersService.js` - Serviços Supabase
3. ✅ `src/context/RegistersContext_NEW.jsx` - Novo contexto
4. ✅ `CORRIGIR_CADASTROS_SUPABASE.md` - Este guia

---

## ⚠️ Importante:

### Mapeamento de Campos:

Alguns campos têm nomes diferentes no banco:

**Cartões de Crédito:**
- Frontend: `limit` → Banco: `credit_limit`
- Frontend: `usedLimit` → Banco: `used_limit`
- Frontend: `lastDigits` → Banco: `last_digits`
- Frontend: `closingDay` → Banco: `closing_day`
- Frontend: `dueDay` → Banco: `due_day`

**Fornecedores:**
- Frontend: `cnpj` → Banco: `document`
- Frontend: `paymentTerms` → Banco: `payment_terms`
- Frontend: `contactPerson` → Banco: `contact_person`
- Frontend: `zipCode` → Banco: `zip_code`

---

## ✅ Checklist:

- [ ] Executar SQL no Supabase
- [ ] Verificar tabelas criadas
- [ ] Fazer backup do RegistersContext antigo
- [ ] Copiar RegistersContext_NEW
- [ ] Colar no RegistersContext original
- [ ] Salvar arquivo
- [ ] Recarregar página (Ctrl+F5)
- [ ] Testar criar conta bancária
- [ ] Testar criar cartão
- [ ] Testar criar fornecedor
- [ ] Recarregar e verificar persistência
- [ ] Verificar no Supabase Table Editor

---

## 🎉 Resultado Esperado:

Após aplicar a correção:

✅ Contas bancárias salvas no Supabase
✅ Cartões de crédito salvos no Supabase
✅ Fornecedores salvos no Supabase
✅ Dados persistem após recarregar
✅ Dados aparecem no Table Editor
✅ Sistema funciona normalmente
✅ Importação de Excel funciona

---

**🔧 Execute o SQL e aplique a correção agora!** 🚀
