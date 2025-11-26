# 🚀 Guia Completo de Configuração do Supabase

## 📋 Passo a Passo

### 1️⃣ Obter Credenciais do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto: **mfkmvtobcdajqbveytfn**
4. No menu lateral, clique em **Settings** (⚙️)
5. Clique em **API**
6. Copie as seguintes informações:
   - **Project URL** (ex: `https://mfkmvtobcdajqbveytfn.supabase.co`)
   - **anon public** key (chave longa começando com `eyJ...`)

### 2️⃣ Criar Arquivo .env

1. Na raiz do projeto, crie um arquivo chamado `.env`
2. Adicione as credenciais:

```env
VITE_SUPABASE_URL=https://mfkmvtobcdajqbveytfn.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**⚠️ IMPORTANTE:** Substitua `sua_chave_anon_aqui` pela chave real copiada do dashboard!

### 3️⃣ Executar o SQL no Supabase

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de banco de dados)
2. Clique em **+ New query**
3. Abra o arquivo `supabase-schema.sql` deste projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (▶️)
7. Aguarde a execução (pode levar alguns segundos)
8. Verifique se não há erros

### 4️⃣ Verificar Tabelas Criadas

1. No dashboard, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ companies
   - ✅ users
   - ✅ categories
   - ✅ transactions
   - ✅ budgets
   - ✅ bank_statements
   - ✅ nfe_invoices

### 5️⃣ Reiniciar o Servidor

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
```bash
npm run dev
```

3. O sistema agora está conectado ao Supabase!

---

## 🔐 Estrutura do Banco de Dados

### Tabelas Principais:

#### 📊 **companies** (Empresas)
- Armazena dados das empresas clientes do BPO
- Campos: nome, CNPJ, email, plano, status

#### 👥 **users** (Usuários)
- Usuários do sistema vinculados a empresas
- Campos: nome, email, senha, role (admin/owner/user)

#### 🏷️ **categories** (Categorias)
- Categorias de receitas e despesas
- Campos: nome, tipo, ícone, cor

#### 💰 **transactions** (Transações)
- Todas as receitas e despesas
- Campos: descrição, valor, tipo, data, status

#### 📈 **budgets** (Orçamentos)
- Limites de gastos por categoria
- Campos: categoria, limite, período, alertas

#### 🏦 **bank_statements** (Extratos)
- Extratos bancários importados
- Campos: data, descrição, valor, conciliado

#### 📄 **nfe_invoices** (Notas Fiscais)
- Notas fiscais eletrônicas
- Campos: chave de acesso, número, valor, XML

---

## 🔄 Migrando Dados do localStorage

Se você já tem dados no localStorage e quer migrar para o Supabase:

### Opção 1: Exportar e Importar Manualmente
1. Abra o DevTools (F12)
2. Vá em Console
3. Execute:
```javascript
// Exportar dados
const dados = {
  transactions: JSON.parse(localStorage.getItem('financeia_transactions') || '[]'),
  budgets: JSON.parse(localStorage.getItem('financeia_budgets') || '[]'),
  statements: JSON.parse(localStorage.getItem('financeia_bankStatements') || '[]')
}
console.log(JSON.stringify(dados, null, 2))
```
4. Copie o JSON
5. Use o SQL Editor para inserir os dados

### Opção 2: Começar do Zero
1. Limpe o localStorage:
```javascript
localStorage.clear()
location.reload()
```
2. Comece a usar o sistema com Supabase

---

## 🧪 Testando a Conexão

Após configurar tudo:

1. Abra o console do navegador (F12)
2. Você deve ver: `✅ Supabase conectado com sucesso!`
3. Se ver erro, verifique:
   - ✅ Arquivo .env está na raiz do projeto
   - ✅ Credenciais estão corretas
   - ✅ SQL foi executado sem erros
   - ✅ Servidor foi reiniciado

---

## 🔒 Segurança (Row Level Security)

O schema já inclui políticas de segurança (RLS):
- ✅ Usuários veem apenas dados da própria empresa
- ✅ Isolamento completo entre empresas
- ✅ Proteção contra acesso não autorizado

---

## 📊 Views Criadas

### financial_summary
Resumo financeiro mensal por empresa

### budget_status
Status atual dos orçamentos com gastos

---

## 🚨 Troubleshooting

### Erro: "Supabase não configurado"
**Solução:** Crie o arquivo .env com as credenciais

### Erro: "relation does not exist"
**Solução:** Execute o SQL completo no SQL Editor

### Erro: "Invalid API key"
**Solução:** Verifique se copiou a chave **anon** correta

### Dados não aparecem
**Solução:** 
1. Verifique se há dados nas tabelas (Table Editor)
2. Verifique o company_id do usuário logado
3. Veja o console para erros

---

## 📁 Arquivos Criados

- ✅ `supabase-schema.sql` - Schema completo do banco
- ✅ `src/lib/supabase.js` - Configuração do cliente
- ✅ `src/services/supabaseService.js` - Serviços de API
- ✅ `.env.example` - Exemplo de configuração
- ✅ Este guia de configuração

---

## 🎯 Próximos Passos

Após configurar:

1. ✅ Teste o login
2. ✅ Crie uma transação
3. ✅ Verifique no Table Editor do Supabase
4. ✅ Configure orçamentos
5. ✅ Importe extratos

---

## 💡 Dicas

- 🔄 Use o Table Editor para ver dados em tempo real
- 📊 Use o SQL Editor para queries personalizadas
- 🔍 Ative os logs no console para debug
- 💾 Faça backup regular do banco

---

## 📞 Suporte

Problemas?
1. Verifique este guia primeiro
2. Veja o console do navegador (F12)
3. Verifique os logs do Supabase
4. Revise as credenciais no .env

---

**🎉 Tudo pronto! Seu sistema agora usa Supabase como banco de dados!**
