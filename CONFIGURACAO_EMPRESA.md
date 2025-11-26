# 🏢 Tela de Configurações da Empresa

Tela completa para gerenciar dados da empresa e certificado digital com upload via interface.

---

## ✨ Funcionalidades Implementadas

### 1. **Dados da Empresa**
- ✅ CNPJ (formatação automática)
- ✅ Razão Social
- ✅ Nome Fantasia
- ✅ Inscrição Estadual
- ✅ Endereço completo (logradouro, número, complemento, bairro, cidade, UF, CEP)
- ✅ Salvamento em localStorage (pronto para integrar com Supabase)

### 2. **Gerenciamento de Certificado Digital**
- ✅ **Upload de certificado** (.pfx ou .p12)
- ✅ **Validação automática** do certificado
- ✅ **Preview de informações** (CNPJ, validade, dias restantes)
- ✅ **Status em tempo real** (online/offline)
- ✅ **Seleção de ambiente** (Homologação/Produção)
- ✅ **Remoção de certificado**
- ✅ **Alertas de vencimento** (< 30 dias)

### 3. **Backend API**
- ✅ **POST /api/certificate/upload** - Upload e instalação
- ✅ **DELETE /api/certificate/remove** - Remoção
- ✅ **GET /api/certificate/info** - Informações
- ✅ Salvamento automático no servidor
- ✅ Atualização de .env automática

---

## 🎨 Interface

### Seção: Dados da Empresa

```
┌─────────────────────────────────────────────┐
│ 🏢 Dados da Empresa                         │
├─────────────────────────────────────────────┤
│                                             │
│ CNPJ *              Inscrição Estadual      │
│ [00.000.000/0000-00] [000.000.000.000]     │
│                                             │
│ Razão Social *                              │
│ [EMPRESA EXEMPLO LTDA                    ]  │
│                                             │
│ Nome Fantasia                               │
│ [Empresa Exemplo                         ]  │
│                                             │
│ ─── Endereço ───                            │
│                                             │
│ Logradouro                    Número        │
│ [Rua Exemplo                ] [123]         │
│                                             │
│ Complemento  Bairro    Cidade    UF   CEP  │
│ [Sala 1]     [Centro]  [SP]      [SP] [000]│
│                                             │
│                    [💾 Salvar Dados]        │
└─────────────────────────────────────────────┘
```

### Seção: Certificado Digital

**Quando NÃO instalado:**
```
┌─────────────────────────────────────────────┐
│ 🔐 Certificado Digital                      │
├─────────────────────────────────────────────┤
│                                             │
│ ⭕ Nenhum Certificado Instalado             │
│                                             │
│ ─── Instalar Certificado ───                │
│                                             │
│ Ambiente SEFAZ:                             │
│ ○ Homologação (Testes)                      │
│ ○ Produção (Real)                           │
│                                             │
│ Arquivo do Certificado:                     │
│ ┌─────────────────────────────────────┐    │
│ │     📤 Upload                        │    │
│ │  Clique para selecionar arquivo     │    │
│ │  Formatos: .pfx, .p12                │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Senha do Certificado:                       │
│ [••••••••••••••] 👁                         │
│                                             │
│                  [🔐 Instalar Certificado]  │
│                                             │
│ ℹ️ Como obter um certificado digital:      │
│ • Adquira certificado A1 em AC             │
│ • Autoridades: Serasa, Certisign, Valid    │
│ • Custo: R$ 150-300/ano                    │
│ • Use homologação para testes              │
└─────────────────────────────────────────────┘
```

**Quando instalado:**
```
┌─────────────────────────────────────────────┐
│ 🔐 Certificado Digital                      │
├─────────────────────────────────────────────┤
│                                             │
│ ✅ Certificado Instalado                    │
│                                             │
│ CNPJ: 12.345.678/0001-90                    │
│ Válido até: 31/12/2025 (365 dias)          │
│ Ambiente: Homologação                       │
│ SEFAZ: 🟢 Online                            │
│                                             │
│                         [🔄] [🗑️ Remover]   │
│                                             │
│ ⚠️ Certificado próximo do vencimento!      │
│    (quando < 30 dias)                       │
└─────────────────────────────────────────────┘
```

---

## 🚀 Como Usar

### 1. Acessar Configurações

No menu lateral:
```
Cadastros
  └─ ⚙️ Configurações
```

### 2. Preencher Dados da Empresa

1. Digite o CNPJ (formatação automática)
2. Preencha Razão Social e Nome Fantasia
3. Complete o endereço
4. Clique em **"Salvar Dados da Empresa"**

### 3. Instalar Certificado Digital

#### Passo 1: Selecionar Ambiente
- **Homologação**: Para testes (não gera obrigações fiscais)
- **Produção**: Para uso real (gera obrigações fiscais)

#### Passo 2: Upload do Arquivo
1. Clique na área de upload
2. Selecione seu arquivo .pfx ou .p12
3. O nome do arquivo aparecerá

#### Passo 3: Digitar Senha
1. Digite a senha do certificado
2. Use o ícone 👁 para mostrar/ocultar

#### Passo 4: Instalar
1. Clique em **"Instalar Certificado"**
2. Aguarde validação (2-5 segundos)
3. Certificado instalado! ✅

### 4. Verificar Status

Após instalação, você verá:
- ✅ CNPJ do certificado
- ✅ Data de validade
- ✅ Dias até expiração
- ✅ Status da SEFAZ (online/offline)
- ✅ Ambiente configurado

### 5. Atualizar ou Remover

**Atualizar:**
- Faça upload de um novo certificado
- O anterior será substituído

**Remover:**
- Clique em **"Remover"**
- Confirme a ação
- Certificado removido do servidor

---

## 🔧 Fluxo Técnico

### Upload de Certificado

```
Frontend                Backend                 Filesystem
   |                       |                         |
   |-- POST /upload ------>|                         |
   |   (FormData)          |                         |
   |                       |-- Salvar arquivo ------>|
   |                       |   certificado.pfx       |
   |                       |                         |
   |                       |-- Validar cert ---------|
   |                       |   (node-forge)          |
   |                       |                         |
   |                       |-- Atualizar .env ------>|
   |                       |   CERT_PATH             |
   |                       |   CERT_PASSWORD         |
   |                       |   SEFAZ_ENVIRONMENT     |
   |                       |                         |
   |<-- Sucesso + Info ----|                         |
   |   {cnpj, validTo}     |                         |
   |                       |                         |
   |-- GET /status ------->|                         |
   |<-- Status completo ---|                         |
```

### Validação do Certificado

```javascript
1. Receber arquivo .pfx
2. Decodificar com senha
3. Extrair certificado e chave privada
4. Validar:
   ✓ Formato correto
   ✓ Senha válida
   ✓ Certificado não expirado
   ✓ CNPJ presente
5. Criar agente HTTPS
6. Retornar informações
```

---

## 📁 Arquivos Criados/Modificados

### Frontend

**Novo:**
- `src/pages/CompanySettings.jsx` - Página completa de configurações

**Modificados:**
- `src/App.jsx` - Adicionada rota `/company-settings`
- `src/components/Layout.jsx` - Adicionado link no menu

### Backend

**Novos:**
- `server/routes/certificate.js` - Rotas de gerenciamento
- `server/certificados/` - Pasta para armazenar certificados

**Modificados:**
- `server/server.js` - Integrada rota de certificados
- `server/package.json` - Adicionado `multer`

---

## 🔒 Segurança

### Boas Práticas Implementadas

✅ **Validação de arquivo**
- Apenas .pfx e .p12 aceitos
- Limite de 5MB

✅ **Senha protegida**
- Campo password com toggle show/hide
- Senha salva em .env (não no código)

✅ **Certificado no servidor**
- Armazenado em pasta `certificados/`
- Não commitado no Git (.gitignore)

✅ **Validação antes de salvar**
- Certificado testado antes de persistir
- Arquivo removido se inválido

✅ **Ambiente separado**
- Homologação para testes
- Produção apenas quando pronto

### ⚠️ Avisos de Segurança

**NUNCA:**
- ❌ Commitar certificado no Git
- ❌ Compartilhar senha
- ❌ Usar produção sem testar
- ❌ Expor API sem autenticação

**SEMPRE:**
- ✅ Adicionar `certificados/` ao .gitignore
- ✅ Usar HTTPS em produção
- ✅ Monitorar vencimento
- ✅ Fazer backup do certificado

---

## 📊 Status e Alertas

### Cores de Status

| Dias Restantes | Cor | Mensagem |
|----------------|-----|----------|
| > 90 dias | 🟢 Verde | Certificado válido |
| 30-90 dias | 🟡 Amarelo | Atenção ao vencimento |
| < 30 dias | 🔴 Vermelho | ⚠️ Próximo do vencimento! |
| Expirado | 🔴 Vermelho | ❌ Certificado expirado |

### Alertas Automáticos

**Vencimento Próximo (< 30 dias):**
```
⚠️ Certificado próximo do vencimento!
   Renove seu certificado em breve.
```

**SEFAZ Offline:**
```
🔴 SEFAZ: Offline
   Serviço temporariamente indisponível
```

**Certificado Inválido:**
```
❌ Certificado inválido: [motivo]
   Verifique o arquivo e senha
```

---

## 🧪 Testar a Funcionalidade

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Iniciar Backend

```bash
cd server
npm run dev
```

**Saída esperada:**
```
🔐 Verificando certificado digital...
⚠️  Certificado não configurado - modo de desenvolvimento

🚀 Servidor rodando na porta 3001
📡 Ambiente: homologacao
🌐 CORS: http://localhost:5173

📋 Endpoints disponíveis:
   ...
   POST /api/certificate/upload
   DELETE /api/certificate/remove
   GET  /api/certificate/info

✅ Pronto para receber requisições!
```

### 3. Iniciar Frontend

```bash
npm run dev
```

### 4. Acessar Configurações

1. Abra: http://localhost:5173
2. Faça login
3. Menu: **Cadastros** → **Configurações**

### 5. Testar Upload

1. Selecione ambiente: **Homologação**
2. Faça upload de um certificado .pfx
3. Digite a senha
4. Clique em **"Instalar Certificado"**
5. Verifique o status

### 6. Verificar no Backend

```bash
# Ver certificado instalado
ls server/certificados/

# Ver configuração
cat server/.env
```

---

## 🐛 Troubleshooting

### Erro: "Arquivo não enviado"

**Causa:** Upload falhou

**Solução:**
- Verifique se o arquivo é .pfx ou .p12
- Confirme que o tamanho é < 5MB
- Tente novamente

---

### Erro: "Senha incorreta"

**Causa:** Senha do certificado inválida

**Solução:**
- Verifique a senha com a AC
- Tente novamente
- Confirme se não há espaços extras

---

### Erro: "Certificado expirado"

**Causa:** Certificado vencido

**Solução:**
- Renove o certificado com a AC
- Use um certificado válido
- Verifique a data de validade

---

### Erro: "CORS blocked"

**Causa:** Frontend não consegue acessar backend

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Verificar CORS no .env
CORS_ORIGIN=http://localhost:5173
```

---

### Certificado não aparece após upload

**Causa:** Erro na validação

**Solução:**
1. Verifique logs do backend
2. Confirme formato do arquivo
3. Teste senha manualmente
4. Verifique permissões da pasta

---

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Integrar com Supabase (salvar dados da empresa)
- [ ] Histórico de certificados
- [ ] Notificações de vencimento por email

### Médio Prazo
- [ ] Suporte a certificado A3 (token/cartão)
- [ ] Múltiplos certificados (por filial)
- [ ] Renovação automática

### Longo Prazo
- [ ] Integração com AC para renovação
- [ ] Dashboard de certificados
- [ ] Auditoria de uso

---

## 📚 Recursos

### Documentação
- [Node-Forge](https://github.com/digitalbazaar/forge) - Manipulação de certificados
- [Multer](https://github.com/expressjs/multer) - Upload de arquivos
- [Receita Federal](https://www.nfe.fazenda.gov.br/) - Portal NF-e

### Autoridades Certificadoras
- [Serasa Experian](https://serasa.certificadodigital.com.br/)
- [Certisign](https://www.certisign.com.br/)
- [Valid](https://www.valid.com.br/)
- [Soluti](https://www.soluti.com.br/)

---

## ✅ Checklist de Implementação

- [x] Página de configurações criada
- [x] Upload de certificado implementado
- [x] Validação de certificado funcionando
- [x] Preview de informações
- [x] Status em tempo real
- [x] Remoção de certificado
- [x] Alertas de vencimento
- [x] Integração com menu
- [x] Backend API completo
- [x] Documentação criada

---

## 🎉 Resultado Final

**Tela completa e funcional para:**
- ✅ Gerenciar dados da empresa
- ✅ Fazer upload de certificado digital
- ✅ Validar e instalar automaticamente
- ✅ Monitorar status e vencimento
- ✅ Remover quando necessário
- ✅ Alternar entre homologação e produção

**Tudo via interface web, sem precisar editar arquivos manualmente!** 🚀

---

**Desenvolvido com ❤️ para facilitar a gestão de certificados digitais**
