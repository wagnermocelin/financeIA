# 🚀 FinanceIA API - Backend NF-e

API Backend para integração com a Receita Federal (SEFAZ) usando certificado digital A1.

---

## 📋 Funcionalidades

- ✅ **Consulta NF-e por chave de acesso** (44 dígitos)
- ✅ **Busca NF-e por período** (até 90 dias)
- ✅ **Download de XML** oficial da SEFAZ
- ✅ **Distribuição DFe** (método eficiente para busca)
- ✅ **Autenticação com certificado digital** A1
- ✅ **Suporte a múltiplas UFs**
- ✅ **Ambiente de homologação e produção**

---

## 🛠️ Instalação

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Certificado Digital

Você precisa de um **certificado digital A1** (arquivo .pfx ou .p12).

#### Opção 1: Arquivo PFX

```bash
# Criar pasta para certificados
mkdir certificados

# Copiar seu certificado para a pasta
cp /caminho/do/certificado.pfx ./certificados/
```

#### Opção 2: Base64

```bash
# Converter certificado para base64
base64 certificado.pfx > certificado.txt
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Porta do servidor
PORT=3001

# Certificado (escolha uma opção)
CERT_PATH=./certificados/certificado.pfx
CERT_PASSWORD=sua_senha_do_certificado

# Ou use base64
# CERT_BASE64=MIIKpAIBAzCCCm...
# CERT_PASSWORD=sua_senha

# CNPJ da empresa
COMPANY_CNPJ=00.000.000/0000-00

# Ambiente (homologacao ou producao)
SEFAZ_ENVIRONMENT=homologacao

# UF (código IBGE)
# 35=SP, 33=RJ, 31=MG, 43=RS, 41=PR, 29=BA, 53=DF
UF_CODE=35

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Executar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

O servidor estará rodando em: `http://localhost:3001`

---

## 📡 Endpoints da API

### 1. Status do Serviço

**GET** `/api/nfe/status`

Verifica status do certificado e conexão com SEFAZ.

**Resposta:**
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

---

### 2. Consultar NF-e por Chave

**POST** `/api/nfe/consultar-chave`

Consulta uma NF-e específica pela chave de acesso.

**Body:**
```json
{
  "chaveAcesso": "35210812345678000190550010000000011234567890"
}
```

**Resposta:**
```json
{
  "success": true,
  "chaveAcesso": "35210812345678000190550010000000011234567890",
  "status": "Autorizado o uso da NF-e",
  "protocolo": "135210000000001",
  "dataAutorizacao": "2021-08-15T10:30:00-03:00",
  "nfe": {
    "numero": "000000001",
    "serie": "001",
    "dataEmissao": "2021-08-15T10:00:00-03:00",
    "valor": 1500.00,
    "emitente": {
      "cnpj": "12.345.678/0001-90",
      "razaoSocial": "FORNECEDOR LTDA",
      "nomeFantasia": "Fornecedor"
    },
    "destinatario": {
      "cnpj": "98.765.432/0001-10",
      "razaoSocial": "SUA EMPRESA LTDA"
    },
    "totais": {
      "valorProdutos": 1500.00,
      "valorNota": 1500.00,
      "valorICMS": 270.00,
      "valorIPI": 0
    }
  },
  "xml": "<?xml version=\"1.0\"?>..."
}
```

---

### 3. Buscar NF-e por Período

**POST** `/api/nfe/buscar-periodo`

Busca todas as NF-e em um período (máximo 90 dias).

**Body:**
```json
{
  "cnpj": "12.345.678/0001-90",
  "dataInicio": "2024-01-01",
  "dataFim": "2024-01-31"
}
```

**Resposta:**
```json
{
  "success": true,
  "nfes": [
    {
      "numero": "000000001",
      "serie": "001",
      "dataEmissao": "2024-01-15T10:00:00-03:00",
      "valor": 1500.00,
      "emitente": {
        "cnpj": "12.345.678/0001-90",
        "razaoSocial": "FORNECEDOR LTDA"
      }
    }
  ],
  "total": 1,
  "ultimoNSU": "000000000000123"
}
```

---

### 4. Download de XML

**POST** `/api/nfe/download-xml`

Baixa o XML oficial da NF-e.

**Body:**
```json
{
  "chaveAcesso": "35210812345678000190550010000000011234567890"
}
```

**Resposta:**
Arquivo XML para download.

---

### 5. Distribuição DFe

**POST** `/api/nfe/distribuicao`

Busca documentos fiscais via Distribuição DFe (método mais eficiente).

**Body:**
```json
{
  "cnpj": "12.345.678/0001-90",
  "ultNSU": "000000000000000"
}
```

**Resposta:**
```json
{
  "success": true,
  "nfes": [...],
  "total": 10,
  "ultimoNSU": "000000000000123"
}
```

---

## 🔐 Certificado Digital

### Onde Obter

1. **Autoridades Certificadoras:**
   - Serasa Experian
   - Certisign
   - Valid
   - Soluti

2. **Tipo:** A1 (arquivo .pfx) ou A3 (token/cartão)
   - **Recomendado:** A1 (mais fácil de usar em servidor)

3. **Validade:** 1 ano (A1) ou 3 anos (A3)

### Como Converter A3 para A1

Se você tem um certificado A3 (token/cartão):

```bash
# Exportar do token para arquivo
openssl pkcs12 -export -in certificado.crt -inkey chave.key -out certificado.pfx
```

---

## 🌍 Ambientes

### Homologação (Testes)

- ✅ Não gera obrigações fiscais
- ✅ Dados fictícios
- ✅ Gratuito
- ✅ Ideal para desenvolvimento

```env
SEFAZ_ENVIRONMENT=homologacao
```

### Produção

- ⚠️ Gera obrigações fiscais reais
- ⚠️ Requer certificado válido
- ⚠️ Dados reais

```env
SEFAZ_ENVIRONMENT=producao
```

---

## 🗺️ Códigos de UF

| UF | Código | Estado |
|----|--------|--------|
| SP | 35 | São Paulo |
| RJ | 33 | Rio de Janeiro |
| MG | 31 | Minas Gerais |
| RS | 43 | Rio Grande do Sul |
| PR | 41 | Paraná |
| BA | 29 | Bahia |
| DF | 53 | Distrito Federal |

---

## 🧪 Testar a API

### Usando cURL

```bash
# Status
curl http://localhost:3001/api/nfe/status

# Consultar chave
curl -X POST http://localhost:3001/api/nfe/consultar-chave \
  -H "Content-Type: application/json" \
  -d '{"chaveAcesso":"35210812345678000190550010000000011234567890"}'

# Buscar período
curl -X POST http://localhost:3001/api/nfe/buscar-periodo \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj":"12.345.678/0001-90",
    "dataInicio":"2024-01-01",
    "dataFim":"2024-01-31"
  }'
```

### Usando Postman

Importe a collection: `postman_collection.json`

---

## 🐛 Troubleshooting

### Erro: "Certificado não configurado"

**Solução:**
1. Verifique se o arquivo .pfx existe
2. Confirme a senha do certificado
3. Verifique permissões do arquivo

### Erro: "ECONNREFUSED"

**Solução:**
1. Verifique sua conexão com internet
2. Confirme se está usando o ambiente correto (homologação/produção)
3. Verifique firewall

### Erro: "Certificado inválido"

**Solução:**
1. Verifique a validade do certificado
2. Confirme se o certificado é A1
3. Tente converter novamente

### Erro: "CNPJ não autorizado"

**Solução:**
1. Confirme se o CNPJ do certificado corresponde ao configurado
2. Verifique se o certificado tem permissão para NF-e

---

## 📊 Logs

Os logs são exibidos no console:

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

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite o certificado** no Git
2. **Use variáveis de ambiente** para senhas
3. **Restrinja CORS** em produção
4. **Use HTTPS** em produção
5. **Monitore logs** de acesso
6. **Renove certificado** antes do vencimento

### .gitignore

```
# Certificados
certificados/
*.pfx
*.p12
*.pem

# Ambiente
.env
.env.local
```

---

## 📚 Documentação Oficial

- [Portal NF-e](https://www.nfe.fazenda.gov.br/)
- [Manual de Integração](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=tW+YMyk/50s=)
- [Web Services](https://www.nfe.fazenda.gov.br/portal/webServices.aspx)

---

## 🆘 Suporte

- **Issues:** [GitHub Issues](https://github.com/wagnermocelin/financeIA/issues)
- **Email:** seu-email@exemplo.com
- **Documentação:** [Wiki do Projeto](https://github.com/wagnermocelin/financeIA/wiki)

---

**Desenvolvido com ❤️ para facilitar a integração com NF-e**
