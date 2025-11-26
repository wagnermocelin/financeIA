# ⚡ AÇÃO URGENTE - Executar SQL no Supabase

## ✅ Progresso Atual:

- ✅ Supabase instalado
- ✅ Arquivo .env criado com credenciais
- ✅ Serviços de API prontos
- ✅ FinanceContext com Supabase criado

## 🚨 PRÓXIMO PASSO OBRIGATÓRIO:

### Executar o SQL para criar as tabelas no Supabase

**ANTES de reiniciar o servidor, você PRECISA executar o SQL!**

---

## 📋 Como Executar o SQL:

### 1️⃣ Acesse o Dashboard do Supabase
```
https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn
```

### 2️⃣ Vá no SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados 🗄️)
- Ou acesse direto: https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn/sql

### 3️⃣ Criar Nova Query
- Clique no botão **+ New query**

### 4️⃣ Copiar o SQL
- Abra o arquivo: `supabase-schema.sql` (está na raiz do projeto)
- Selecione TODO o conteúdo (Ctrl+A)
- Copie (Ctrl+C)

### 5️⃣ Colar e Executar
- Cole no SQL Editor do Supabase (Ctrl+V)
- Clique em **Run** (▶️) ou pressione Ctrl+Enter
- Aguarde a execução (pode levar 10-20 segundos)

### 6️⃣ Verificar Sucesso
Você deve ver mensagens de sucesso como:
```
Success. No rows returned
CREATE TABLE
CREATE INDEX
CREATE TRIGGER
...
```

---

## ✅ Verificar se as Tabelas Foram Criadas:

1. No menu lateral, clique em **Table Editor** (ícone de tabela 📊)
2. Você deve ver estas 7 tabelas:
   - ✅ companies
   - ✅ users  
   - ✅ categories
   - ✅ transactions
   - ✅ budgets
   - ✅ bank_statements
   - ✅ nfe_invoices

3. Clique em cada tabela para ver a estrutura

---

## 🎯 O que o SQL vai criar:

### Tabelas:
- **companies** - Empresas clientes do BPO
- **users** - Usuários do sistema
- **categories** - Categorias de receitas/despesas
- **transactions** - Transações financeiras
- **budgets** - Orçamentos
- **bank_statements** - Extratos bancários
- **nfe_invoices** - Notas fiscais

### Recursos Avançados:
- ✅ Índices para performance
- ✅ Triggers para updated_at automático
- ✅ Row Level Security (RLS)
- ✅ Views para relatórios
- ✅ Dados iniciais (seed data)

### Dados Iniciais Inclusos:
- 1 empresa de exemplo
- 1 usuário admin
- 8 categorias padrão

---

## ⚠️ Problemas Comuns:

### "Permission denied"
**Solução:** Você precisa ser o owner do projeto

### "Relation already exists"
**Solução:** As tabelas já existem. Tudo certo!

### "Syntax error"
**Solução:** Certifique-se de copiar TODO o conteúdo do arquivo SQL

---

## 🚀 Após Executar o SQL:

### Me avise que executou e eu vou:
1. ✅ Reiniciar o servidor
2. ✅ Ativar o FinanceContext com Supabase
3. ✅ Testar a conexão
4. ✅ Verificar se os dados estão sendo salvos

---

## 📸 Captura de Tela (Opcional):

Se quiser, tire um print da tela do Table Editor mostrando as 7 tabelas criadas!

---

## 🎯 Resumo Rápido:

```
1. Acesse: https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn/sql
2. Clique em "+ New query"
3. Abra o arquivo supabase-schema.sql
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em "Run" ▶️
7. Aguarde a execução
8. Verifique as tabelas no Table Editor
9. Me avise que concluiu!
```

---

**⏳ Aguardando você executar o SQL para continuar!**

**✅ Depois me diga: "SQL executado" ou "Tabelas criadas"**
