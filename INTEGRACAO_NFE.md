# 📄 Integração com Notas Fiscais Eletrônicas (NF-e)

## 🎯 Visão Geral

O FinanceIA permite buscar e importar Notas Fiscais Eletrônicas (NF-e) diretamente da Receita Federal/SEFAZ, facilitando o controle de despesas e conciliação contábil.

## 🔍 Funcionalidades Implementadas

### 1. Busca de NF-e

**Duas formas de busca:**

#### 📌 Por Chave de Acesso
- Digite a chave de 44 dígitos
- Consulta instantânea de uma NF-e específica
- Ideal quando você tem o DANFE em mãos

#### 📅 Por Período
- Informe CNPJ + Data Início + Data Fim
- Busca todas as NF-e do período
- Ideal para importação em lote

### 2. Visualização de NF-e

**Informações Exibidas:**
- ✅ Número e série da nota
- ✅ Data de emissão
- ✅ Status (Autorizada/Cancelada)
- ✅ Dados do emitente (fornecedor)
- ✅ Dados do destinatário (sua empresa)
- ✅ Valor total
- ✅ Chave de acesso

### 3. Ações Disponíveis

- 📄 **Ver Detalhes** - Visualiza informações completas
- 📥 **Download XML** - Baixa o arquivo XML da NF-e
- 📊 **Importar** - Converte NF-e em transação no sistema

## 🔧 Como Usar

### Passo 1: Acesse Notas Fiscais
1. Faça login no FinanceIA
2. Vá em **"Cadastros"** > **"Notas Fiscais"**

### Passo 2: Buscar NF-e

**Opção A - Por Chave:**
1. Clique em **"Buscar NF-e"**
2. Selecione aba **"Buscar por Chave"**
3. Digite a chave de 44 dígitos
4. Clique em **"Consultar NF-e"**

**Opção B - Por Período:**
1. Clique em **"Buscar NF-e"**
2. Selecione aba **"Buscar por Período"**
3. Informe o CNPJ da empresa
4. Selecione data início e fim
5. Clique em **"Buscar NF-e"**

### Passo 3: Visualizar e Importar
1. Revise as NF-e encontradas
2. Clique em **"Detalhes"** para ver mais informações
3. Clique em **"Importar"** para adicionar ao sistema
4. A NF-e será convertida em transação automaticamente

## 🔐 Integração com APIs Reais

### Atualmente Implementado (Simulação)
O sistema atual usa **dados simulados** para demonstração. Para integrar com dados reais:

### Opção 1: API SEFAZ (Oficial)

**Requisitos:**
- ✅ Certificado Digital A1 ou A3 da empresa
- ✅ CNPJ ativo
- ✅ Credenciais de acesso à SEFAZ

**Endpoints Principais:**
```
Consulta por Chave:
https://nfe.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx

Download XML:
https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx
```

**Implementação:**
```javascript
// Exemplo de integração
import https from 'https'
import fs from 'fs'

const consultarNFe = async (chaveAcesso, certificado) => {
  const options = {
    hostname: 'nfe.fazenda.gov.br',
    port: 443,
    path: '/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
    method: 'POST',
    pfx: fs.readFileSync(certificado.path),
    passphrase: certificado.senha,
  }
  
  // Implementar requisição SOAP
}
```

### Opção 2: Serviços Terceiros (Recomendado)

**Vantagens:**
- ✅ Mais fácil de integrar
- ✅ Não precisa lidar com certificados
- ✅ APIs REST modernas
- ✅ Suporte técnico

**Serviços Disponíveis:**

#### 1. **NFe.io**
- Site: https://nfe.io
- API REST completa
- Planos a partir de R$ 49/mês
```javascript
const nfeio = require('nfe.io')
nfeio.configure({ apiKey: 'sua-chave' })
const nfe = await nfeio.consultar(chaveAcesso)
```

#### 2. **Focus NFe**
- Site: https://focusnfe.com.br
- Especializado em NF-e
- Planos a partir de R$ 39/mês
```javascript
const focusnfe = require('focusnfe')
const nfe = await focusnfe.consultar({
  chave: chaveAcesso,
  token: 'seu-token'
})
```

#### 3. **Bling**
- Site: https://bling.com.br
- ERP completo com NF-e
- Planos a partir de R$ 29/mês

#### 4. **Omie**
- Site: https://omie.com.br
- Sistema de gestão com NF-e
- Planos variados

### Opção 3: Portal da Nota Fiscal (Manual)

**Para Consultas Pontuais:**
1. Acesse: https://www.nfe.fazenda.gov.br/portal/consulta.aspx
2. Digite a chave de acesso
3. Resolva o captcha
4. Visualize e baixe o XML

## 📝 Estrutura da Chave de Acesso

A chave de acesso tem **44 dígitos** divididos assim:

```
35 24 01 12345678000190 55 001 000123456 1 12345678 9
│  │  │  │              │  │   │         │ │        │
│  │  │  │              │  │   │         │ │        └─ Dígito Verificador
│  │  │  │              │  │   │         │ └────────── Código Numérico
│  │  │  │              │  │   │         └──────────── Tipo de Emissão
│  │  │  │              │  │   └────────────────────── Número da NF-e
│  │  │  │              │  └────────────────────────── Série
│  │  │  │              └───────────────────────────── Modelo (55=NF-e)
│  │  │  └──────────────────────────────────────────── CNPJ do Emitente
│  │  └─────────────────────────────────────────────── Mês/Ano de Emissão
│  └────────────────────────────────────────────────── Ano/Mês de Emissão
└───────────────────────────────────────────────────── Código UF
```

## 🔄 Fluxo de Importação

### 1. Busca
```
Usuário → Sistema → API SEFAZ/Serviço → Retorna NF-e
```

### 2. Processamento
```
NF-e → Parser → Extrai Dados → Valida → Exibe para Usuário
```

### 3. Importação
```
Usuário Confirma → Converte para Transação → Salva no Sistema
```

### 4. Integração
```
Transação → Vincula com Fornecedor → Disponível para Conciliação
```

## 💡 Casos de Uso

### ✅ Controle de Despesas
- Importa NF-e de fornecedores automaticamente
- Registra despesas sem digitação manual
- Mantém histórico completo

### ✅ Conciliação Contábil
- Compara NF-e com pagamentos
- Identifica divergências
- Facilita fechamento mensal

### ✅ Gestão de Fornecedores
- Cadastra fornecedores automaticamente
- Rastreia compras por fornecedor
- Analisa gastos por categoria

### ✅ Compliance Fiscal
- Mantém XMLs organizados
- Facilita auditorias
- Comprova despesas

## ⚠️ Limitações Atuais (Modo Simulação)

O sistema atual **simula** a busca de NF-e para demonstração:

- ❌ Não consulta SEFAZ real
- ❌ Não requer certificado digital
- ❌ Gera dados fictícios
- ✅ Demonstra fluxo completo
- ✅ Interface pronta para integração real

## 🚀 Próximos Passos para Produção

### 1. Escolher Método de Integração
- [ ] API SEFAZ direta (mais complexo)
- [ ] Serviço terceiro (recomendado)
- [ ] Híbrido (terceiro + SEFAZ)

### 2. Configurar Credenciais
- [ ] Obter certificado digital
- [ ] Cadastrar na SEFAZ ou serviço
- [ ] Configurar variáveis de ambiente

### 3. Implementar Autenticação
```javascript
// .env
NFE_API_URL=https://api.nfe.io
NFE_API_KEY=sua-chave-aqui
NFE_CERTIFICATE_PATH=/path/to/cert.pfx
NFE_CERTIFICATE_PASSWORD=senha-cert
```

### 4. Atualizar nfeService.js
```javascript
// Substituir funções simuladas por chamadas reais
const consultarPorChave = async (chave) => {
  const response = await fetch(`${process.env.NFE_API_URL}/consultar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NFE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chave })
  })
  return response.json()
}
```

### 5. Testar em Homologação
- [ ] Usar ambiente de testes da SEFAZ
- [ ] Validar todas as operações
- [ ] Corrigir erros

### 6. Deploy em Produção
- [ ] Configurar certificados
- [ ] Ativar em produção
- [ ] Monitorar logs

## 📚 Documentação Oficial

- **Portal NF-e**: https://www.nfe.fazenda.gov.br
- **Manual de Integração**: http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=tW+YMyk/50s=
- **Schemas XML**: http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/fwLvLUSmU8=

## 🆘 Suporte

### Problemas Comuns

**"Chave de acesso inválida"**
- Verifique se tem 44 dígitos
- Não use espaços ou caracteres especiais

**"Certificado digital não encontrado"**
- Instale o certificado A1/A3
- Verifique validade do certificado

**"Erro ao consultar SEFAZ"**
- Verifique conexão com internet
- Confirme se SEFAZ está online
- Valide credenciais

### Contato
- Documentação: Este arquivo
- Suporte Técnico: suporte@financeia.com
- Issues: GitHub do projeto

---

**FinanceIA** - Integração inteligente com NF-e 🚀
