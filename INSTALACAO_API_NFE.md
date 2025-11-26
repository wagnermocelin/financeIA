# 🚀 Instalação da API NF-e com Certificado Digital

Guia completo para configurar a integração com a Receita Federal usando certificado digital.

---

## 📋 Pré-requisitos

### 1. Certificado Digital A1

Você precisa de um **certificado digital A1** (arquivo .pfx ou .p12).

**Onde obter:**
- Serasa Experian
- Certisign
- Valid
- Soluti

**Tipo:** A1 (arquivo) - mais fácil de usar em servidor
**Validade:** 1 ano
**Custo:** R$ 150 - R$ 300/ano

### 2. Node.js

- **Versão:** 18 ou superior
- **Download:** https://nodejs.org

### 3. Informações Necessárias

- ✅ Arquivo do certificado (.pfx ou .p12)
- ✅ Senha do certificado
- ✅ CNPJ da empresa
- ✅ UF (estado) da empresa

---

## 🔧 Instalação Passo a Passo

### 1️⃣ Instalar Dependências do Backend

```bash
# Navegar para a pasta do servidor
cd server

# Instalar dependências
npm install
```

**Pacotes instalados:**
- `express` - Servidor HTTP
- `cors` - Permitir requisições do frontend
- `axios` - Cliente HTTP
- `node-forge` - Manipulação de certificados
- `fast-xml-parser` - Parse de XML
- `dotenv` - Variáveis de ambiente

---

### 2️⃣ Configurar Certificado Digital

#### Opção A: Arquivo PFX (Recomendado)

```bash
# Criar pasta para certificados
mkdir certificados

# Copiar seu certificado para a pasta
# Windows:
copy "C:\caminho\do\certificado.pfx" certificados\

# Linux/Mac:
cp /caminho/do/certificado.pfx certificados/
```

#### Opção B: Base64 (Alternativa)

Se preferir não deixar o arquivo no servidor:

```bash
# Windows (PowerShell):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificado.pfx")) > certificado.txt

# Linux/Mac:
base64 certificado.pfx > certificado.txt
```

Copie o conteúdo do arquivo `certificado.txt` para usar no `.env`

---

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Porta do servidor
PORT=3001
NODE_ENV=development

# ===== CERTIFICADO DIGITAL =====
# Opção 1: Arquivo PFX
CERT_PATH=./certificados/certificado.pfx
CERT_PASSWORD=SuaSenhaAqui123

# Opção 2: Base64 (comente a opção 1 se usar esta)
# CERT_BASE64=MIIKpAIBAzCCCm4GCSqGSIb3DQEHAaCCCl8EggpbMIIKVzCCBf8GCSqGSIb3...
# CERT_PASSWORD=SuaSenhaAqui123

# ===== EMPRESA =====
COMPANY_CNPJ=12.345.678/0001-90

# ===== SEFAZ =====
# Ambiente: homologacao (testes) ou producao (real)
SEFAZ_ENVIRONMENT=homologacao

# UF (código IBGE):
# 35=SP, 33=RJ, 31=MG, 43=RS, 41=PR, 29=BA, 53=DF
UF_CODE=35

# ===== CORS =====
CORS_ORIGIN=http://localhost:5173

# ===== LOGS =====
LOG_LEVEL=debug
```

**⚠️ IMPORTANTE:**
- Use `homologacao` para testes (não gera obrigações fiscais)
- Use `producao` apenas quando estiver pronto (gera obrigações fiscais reais)

---

### 4️⃣ Configurar Frontend

Edite o arquivo `.env` na raiz do projeto (não na pasta `server`):

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# URL da API Backend
VITE_API_URL=http://localhost:3001
```

---

### 5️⃣ Iniciar os Servidores

#### Terminal 1: Backend (API)

```bash
cd server
npm run dev
```

**Você deve ver:**
```
🔐 Verificando certificado digital...
✅ Certificado carregado com sucesso!
   CNPJ: 12345678000190
   Válido até: 2025-12-31

🚀 Servidor rodando na porta 3001
📡 Ambiente: homologacao
🌐 CORS: http://localhost:5173

📋 Endpoints disponíveis:
   GET  /health
   POST /api/nfe/consultar-chave
   POST /api/nfe/buscar-periodo
   POST /api/nfe/download-xml
   POST /api/nfe/distribuicao

✅ Pronto para receber requisições!
```

#### Terminal 2: Frontend (React)

```bash
# Na raiz do projeto
npm run dev
```

**Você deve ver:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Testar a Integração

### 1. Verificar Status da API

Abra no navegador:
```
http://localhost:3001/api/nfe/status
```

**Resposta esperada:**
```json
{
  "success": true,
  "certificate": {
    "configured": true,
    "valid": true,
    "cnpj": "12345678000190",
    "validTo": "2025-12-31",
    "daysUntilExpiration": 365,
    "warning": null
  },
  "sefaz": {
    "success": true,
    "status": "online",
    "message": "Serviço em operação"
  },
  "environment": "homologacao",
  "uf": "35"
}
```

### 2. Testar Consulta por Chave

No sistema, vá em:
1. **Gestão de NF-e**
2. **Buscar NF-e**
3. **Aba "Buscar por Chave"**
4. Digite uma chave de 44 dígitos
5. **Consultar**

**Chave de teste (homologação):**
```
35210812345678000190550010000000011234567890
```

### 3. Testar Busca por Período

1. **Gestão de NF-e**
2. **Buscar NF-e**
3. **Aba "Buscar por Período"**
4. Preencha:
   - CNPJ: seu CNPJ
   - Data início: 01/01/2024
   - Data fim: 31/01/2024
5. **Buscar NF-e**

---

## 🎯 Códigos de UF (Estados)

| Código | Estado | Sigla |
|--------|--------|-------|
| 11 | Rondônia | RO |
| 12 | Acre | AC |
| 13 | Amazonas | AM |
| 14 | Roraima | RR |
| 15 | Pará | PA |
| 16 | Amapá | AP |
| 17 | Tocantins | TO |
| 21 | Maranhão | MA |
| 22 | Piauí | PI |
| 23 | Ceará | CE |
| 24 | Rio Grande do Norte | RN |
| 25 | Paraíba | PB |
| 26 | Pernambuco | PE |
| 27 | Alagoas | AL |
| 28 | Sergipe | SE |
| 29 | Bahia | BA |
| 31 | Minas Gerais | MG |
| 32 | Espírito Santo | ES |
| 33 | Rio de Janeiro | RJ |
| 35 | São Paulo | SP |
| 41 | Paraná | PR |
| 42 | Santa Catarina | SC |
| 43 | Rio Grande do Sul | RS |
| 50 | Mato Grosso do Sul | MS |
| 51 | Mato Grosso | MT |
| 52 | Goiás | GO |
| 53 | Distrito Federal | DF |

---

## 🐛 Solução de Problemas

### Erro: "Certificado não configurado"

**Causa:** Arquivo não encontrado ou senha incorreta

**Solução:**
1. Verifique se o arquivo .pfx existe na pasta `certificados/`
2. Confirme a senha do certificado
3. Verifique permissões do arquivo

```bash
# Windows
icacls certificados\certificado.pfx

# Linux/Mac
ls -la certificados/certificado.pfx
```

---

### Erro: "ECONNREFUSED"

**Causa:** Backend não está rodando

**Solução:**
```bash
cd server
npm run dev
```

---

### Erro: "Certificado expirado"

**Causa:** Certificado vencido

**Solução:**
1. Verifique validade: `http://localhost:3001/api/nfe/status`
2. Renove o certificado com a Autoridade Certificadora
3. Atualize o arquivo .pfx

---

### Erro: "CNPJ não autorizado"

**Causa:** CNPJ do certificado diferente do configurado

**Solução:**
1. Verifique o CNPJ do certificado:
```bash
curl http://localhost:3001/api/nfe/status
```
2. Atualize `COMPANY_CNPJ` no `.env` com o CNPJ correto

---

### Erro: "Serviço SEFAZ offline"

**Causa:** SEFAZ em manutenção ou problema de rede

**Solução:**
1. Verifique status: https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx
2. Aguarde retorno do serviço
3. Verifique sua conexão com internet

---

### Erro: "CORS blocked"

**Causa:** Frontend não consegue acessar backend

**Solução:**
1. Verifique se `CORS_ORIGIN` no backend está correto
2. Confirme se `VITE_API_URL` no frontend está correto
3. Reinicie ambos os servidores

---

## 🔒 Segurança

### ⚠️ NUNCA faça:

- ❌ Commitar certificado no Git
- ❌ Compartilhar senha do certificado
- ❌ Expor API sem autenticação
- ❌ Usar certificado de produção em testes

### ✅ SEMPRE faça:

- ✅ Use `.gitignore` para certificados
- ✅ Use variáveis de ambiente para senhas
- ✅ Teste em homologação primeiro
- ✅ Monitore logs de acesso
- ✅ Renove certificado antes do vencimento

### .gitignore

Adicione ao `.gitignore`:

```
# Certificados
server/certificados/
*.pfx
*.p12
*.pem

# Ambiente
.env
.env.local
server/.env
```

---

## 📊 Monitoramento

### Verificar Status do Certificado

```bash
curl http://localhost:3001/api/nfe/status
```

### Ver Logs do Servidor

Os logs aparecem no terminal onde você rodou `npm run dev`

### Alertas Importantes

O sistema avisa quando:
- ✅ Certificado próximo do vencimento (< 30 dias)
- ✅ SEFAZ offline
- ✅ Erros de autenticação

---

## 🚀 Deploy em Produção

### 1. Configurar Ambiente de Produção

```env
NODE_ENV=production
SEFAZ_ENVIRONMENT=producao
PORT=3001
```

### 2. Usar HTTPS

Configure um proxy reverso (Nginx, Apache) com SSL

### 3. Monitoramento

Use ferramentas como:
- PM2 (gerenciador de processos)
- Winston (logs)
- Sentry (erros)

### 4. Backup do Certificado

- Mantenha backup seguro do certificado
- Configure alertas de vencimento
- Documente processo de renovação

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Portal NF-e](https://www.nfe.fazenda.gov.br/)
- [Manual de Integração](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=tW+YMyk/50s=)
- [Web Services](https://www.nfe.fazenda.gov.br/portal/webServices.aspx)

### Ferramentas Úteis

- [Validador de NF-e](https://www.nfe.fazenda.gov.br/portal/consulta.aspx)
- [Status dos Serviços](https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx)

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Certificado digital A1 obtido
- [ ] Dependências instaladas (`npm install`)
- [ ] Certificado copiado para `server/certificados/`
- [ ] Arquivo `.env` configurado no backend
- [ ] Arquivo `.env` configurado no frontend
- [ ] Backend iniciado (`cd server && npm run dev`)
- [ ] Frontend iniciado (`npm run dev`)
- [ ] Status da API verificado (`/api/nfe/status`)
- [ ] Teste de consulta por chave realizado
- [ ] Teste de busca por período realizado

---

## 🎉 Pronto!

Sua integração com a Receita Federal está configurada e funcionando!

**Próximos passos:**
1. Teste com dados reais em homologação
2. Valide todas as funcionalidades
3. Configure monitoramento
4. Documente processos internos
5. Quando estiver seguro, mude para produção

---

**Dúvidas?** Consulte o arquivo `server/README.md` ou abra uma issue no GitHub!
