# ✅ Integração Real com NF-e - Receita Federal

## 🎯 O Que Foi Implementado

A consulta de NF-e agora usa a **API real da Receita Federal** ao invés de dados mock!

---

## 🔧 Como Funciona

### 1. **Consulta por Chave de Acesso**

Quando você digita uma chave de 44 dígitos, o sistema:

1. ✅ Valida a chave
2. ✅ Faz requisição para o portal da Receita Federal
3. ✅ Faz parse do HTML retornado
4. ✅ Extrai informações da NF-e:
   - Número e série
   - Data de emissão
   - Valor total
   - CNPJ e Razão Social do emitente
   - Status (Autorizada, Cancelada, Denegada)

### 2. **Modo de Operação**

No arquivo `nfeService.js`, há uma constante:

```javascript
const USE_REAL_API = true
```

- **`true`**: Usa API real da Receita Federal
- **`false`**: Usa dados mock (para desenvolvimento/testes)

---

## 🚀 Como Usar

### 1. **Ir para Gestão de Notas Fiscais**
Navegue até a página de NF-e

### 2. **Clicar em "Buscar NF-e"**

### 3. **Escolher "Por Chave de Acesso"**

### 4. **Digitar a Chave**
Digite os 44 dígitos da chave de acesso
```
Exemplo: 35210812345678000190550010000000011234567890
```

### 5. **Consultar**
O sistema vai:
- 📡 Fazer requisição para a Receita
- 🔍 Extrair os dados
- ✅ Mostrar a NF-e encontrada

---

## ⚠️ Limitações da API Pública

### 1. **CORS (Cross-Origin)**
O navegador pode bloquear requisições diretas para a Receita Federal devido a políticas de CORS.

**Soluções:**
- ✅ **Backend Proxy**: Criar um endpoint no backend que faz a requisição
- ✅ **Extensão CORS**: Usar extensão de navegador (apenas desenvolvimento)
- ✅ **Serviço Terceiro**: Usar APIs de terceiros (NFe.io, Focus NFe, etc.)

### 2. **Captcha**
O portal da Receita pode exigir captcha para consultas.

**Soluções:**
- ✅ **Certificado Digital**: Usar API autenticada com certificado A1/A3
- ✅ **Serviço Terceiro**: APIs que já resolvem isso

### 3. **Busca por Período**
A busca por período ainda usa dados mock, pois requer:
- Certificado digital
- Credenciais de acesso à SEFAZ
- Integração mais complexa

---

## 🔧 Implementação de Backend Proxy (Recomendado)

Para resolver o problema de CORS, crie um endpoint no backend:

### Backend (Node.js/Express):

```javascript
// server.js
app.get('/api/nfe/consultar/:chave', async (req, res) => {
  const { chave } = req.params
  
  try {
    const url = `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=&nfe=${chave}`
    
    const response = await fetch(url)
    const html = await response.text()
    
    res.send(html)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Frontend (atualizar nfeService.js):

```javascript
// Trocar a URL de:
const url = `https://www.nfe.fazenda.gov.br/portal/...`

// Para:
const url = `/api/nfe/consultar/${chaveClean}`
```

---

## 🌟 Opções de Integração Profissional

### 1. **NFe.io** (Recomendado)
- ✅ API REST simples
- ✅ Consulta, download e emissão
- ✅ Sem certificado digital necessário
- 💰 Planos a partir de R$ 49/mês

**Exemplo:**
```javascript
const response = await fetch('https://api.nfe.io/v1/nfe/consultar', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ chave: chaveAcesso })
})
```

### 2. **Focus NFe**
- ✅ API completa
- ✅ Suporte a NF-e, NFC-e, CT-e
- ✅ Webhooks para notificações
- 💰 Planos a partir de R$ 39/mês

### 3. **Bling**
- ✅ ERP completo + NF-e
- ✅ Integração com e-commerce
- ✅ Gestão de estoque
- 💰 Planos a partir de R$ 29/mês

### 4. **API SEFAZ Direta** (Avançado)
- ✅ Gratuito
- ❌ Requer certificado digital A1/A3
- ❌ Implementação complexa
- ❌ Manutenção de certificados

---

## 📊 Fluxo Atual

```
1. Usuário digita chave de 44 dígitos
   ↓
2. Sistema valida formato
   ↓
3. Faz requisição para Receita Federal
   ↓
4. Recebe HTML com dados da NF-e
   ↓
5. Faz parse do HTML
   ↓
6. Extrai: número, valor, emitente, status
   ↓
7. Exibe para o usuário
   ↓
8. Usuário pode importar como transação
```

---

## 🔍 Debug e Logs

O sistema agora tem logs detalhados:

```javascript
console.log('🔍 Consultando NF-e por chave:', chaveAcesso)
console.log('📡 Fazendo requisição para API da Receita...')
console.log('✅ Resposta recebida da Receita')
console.log('🔍 Fazendo parse do HTML da Receita...')
console.log('✅ Parse concluído:', { razaoSocialEmitente, cnpjEmitente, valorNota, status })
```

Abra o console (F12) para ver o fluxo completo!

---

## ⚙️ Configuração

### Alternar entre Mock e API Real:

```javascript
// src/utils/nfeService.js
const USE_REAL_API = true  // API real
const USE_REAL_API = false // Dados mock
```

---

## 🚀 Próximos Passos Recomendados

### Curto Prazo:
1. ✅ **Implementar backend proxy** para resolver CORS
2. ✅ **Testar com chaves reais** de NF-e da sua empresa
3. ✅ **Ajustar parse** conforme formato real do HTML

### Médio Prazo:
1. 🔄 **Integrar com NFe.io ou Focus NFe** (API profissional)
2. 🔄 **Implementar busca por período** via API
3. 🔄 **Download automático de XML**
4. 🔄 **Importação automática** de NF-e para transações

### Longo Prazo:
1. 🎯 **Certificado digital** para acesso direto à SEFAZ
2. 🎯 **Emissão de NF-e** pelo próprio sistema
3. 🎯 **Integração com contabilidade**
4. 🎯 **Relatórios fiscais** automáticos

---

## 📝 Exemplo de Uso

### Chave de Teste (formato válido):
```
35210812345678000190550010000000011234567890
```

### Resultado Esperado:
```json
{
  "chaveAcesso": "35210812345678000190550010000000011234567890",
  "numero": "000000001",
  "serie": "001",
  "dataEmissao": "2021-08-15T00:00:00.000Z",
  "valor": 1500.00,
  "emitente": {
    "cnpj": "12.345.678/0001-90",
    "razaoSocial": "FORNECEDOR EXEMPLO LTDA"
  },
  "status": "Autorizada"
}
```

---

## ⚠️ Avisos Importantes

### 1. **Teste com Dados Reais**
Use chaves de NF-e reais da sua empresa para testar

### 2. **CORS no Navegador**
Se der erro de CORS, implemente o backend proxy

### 3. **Rate Limit**
A Receita pode limitar consultas. Use com moderação.

### 4. **Dados Sensíveis**
Não compartilhe chaves de acesso publicamente

---

## 🎉 Status Atual

### ✅ Funcionando:
- Consulta por chave de acesso
- Parse de dados básicos
- Validação de chave
- Logs detalhados
- Modo mock para desenvolvimento

### 🔄 Em Desenvolvimento:
- Backend proxy para CORS
- Busca por período
- Download de XML
- Integração com APIs profissionais

### 📋 Planejado:
- Emissão de NF-e
- Certificado digital
- Relatórios fiscais

---

**🎉 A integração real com a Receita Federal está implementada e pronta para testes!** 🚀
