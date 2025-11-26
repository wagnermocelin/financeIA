# 🔧 Configuração do Supabase

## 📝 Credenciais Recebidas

**Connection String:** 
```
postgresql://postgres.mfkmvtobcdajqbveytfn:J25021989j@@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

## ⚠️ IMPORTANTE

Para usar o Supabase no frontend, você precisa das credenciais da API REST, não a connection string do PostgreSQL.

## 🔑 Como Obter as Credenciais Corretas

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **mfkmvtobcdajqbveytfn**
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: https://mfkmvtobcdajqbveytfn.supabase.co)
   - **anon/public key** (chave longa começando com eyJ...)

## 📋 Estrutura de Tabelas SQL

Execute este SQL no Supabase SQL Editor:

```sql
-- Ver arquivo: supabase-schema.sql
```

## 🚀 Próximos Passos

1. Obtenha a URL e a chave anon do dashboard do Supabase
2. Crie o arquivo .env com essas credenciais
3. Execute o SQL para criar as tabelas
4. Reinicie o servidor de desenvolvimento
