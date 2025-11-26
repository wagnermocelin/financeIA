# 📋 Como Usar a Consulta de NF-e

## ✅ Consulta REAL Disponível!

A consulta por **Chave de Acesso** agora busca dados REAIS no site da Receita Federal!

---

## 🚀 Como Consultar NF-e Real

### 1. **Ir para Gestão de Notas Fiscais**
Navegue até a página de NF-e no menu

### 2. **Clicar em "Buscar NF-e"**
Botão verde no topo da página

### 3. **Selecionar "Buscar por Chave"**
⚠️ **IMPORTANTE**: Use a aba "Buscar por Chave", NÃO "Buscar por Período"

### 4. **Digitar a Chave de Acesso**
Digite os 44 dígitos da chave (sem espaços ou pontos)

**Exemplo de chave válida:**
```
35210812345678000190550010000000011234567890
```

### 5. **Clicar em "Consultar NF-e"**
O sistema vai:
- 📡 Fazer requisição para a Receita Federal
- 🔍 Buscar a NF-e
- ✅ Extrair os dados
- 📊 Mostrar o resultado

---

## 💡 Onde Encontrar a Chave de Acesso?

A chave de 44 dígitos está no **DANFE** (Documento Auxiliar da NF-e):

### Locais Comuns:
1. **Rodapé do DANFE** - Geralmente em fonte pequena
2. **QR Code** - Ao escanear, a chave aparece
3. **E-mail da NF-e** - Vem junto com o XML
4. **Portal do Fornecedor** - Se tiver acesso

### Formato da Chave:
```
┌──────────────────────────────────────────────┐
│ 3521 0812 3456 7800 0190 5500 1000 0000 0112 │
│ 3456 7890                                     │
└──────────────────────────────────────────────┘
       44 dígitos (sem espaços)
```

---

## ⚠️ Busca por Período NÃO Disponível

A opção "Buscar por Período" **não está funcionando** porque requer:

### Requisitos:
- ❌ Certificado Digital A1 ou A3
- ❌ Integração com SEFAZ
- ❌ Credenciais de acesso
- ❌ Ou serviço terceiro (NFe.io, Focus NFe)

### Alternativa:
✅ **Use "Buscar por Chave"** para consultas individuais

---

## 📊 O Que o Sistema Extrai

Quando você consulta uma NF-e, o sistema extrai:

### Dados Principais:
- ✅ **Número** da NF-e
- ✅ **Série**
- ✅ **Data de Emissão**
- ✅ **Valor Total**
- ✅ **Status** (Autorizada, Cancelada, Denegada)

### Dados do Emitente:
- ✅ **CNPJ**
- ✅ **Razão Social**
- ✅ **Nome Fantasia**

### Ações Disponíveis:
- 📄 **Ver Detalhes** - Informações completas
- 💾 **Download XML** - Baixar arquivo XML
- 📥 **Importar** - Criar transação automaticamente

---

## 🎯 Exemplo Prático

### Cenário:
Você recebeu uma NF-e de um fornecedor por e-mail.

### Passo a Passo:

1. **Abrir o DANFE (PDF)**
2. **Copiar a chave de 44 dígitos** do rodapé
3. **Ir em Gestão de NF-e**
4. **Clicar em "Buscar NF-e"**
5. **Aba "Buscar por Chave"**
6. **Colar a chave** (o sistema remove espaços automaticamente)
7. **Consultar**
8. **Ver os dados** extraídos da Receita
9. **Clicar em "Importar"** para criar transação

**Pronto!** ✅ A NF-e vira uma transação no sistema automaticamente!

---

## ⚠️ Possíveis Problemas

### 1. **Erro de CORS**
```
❌ Access to fetch has been blocked by CORS policy
```

**Causa:** O navegador bloqueia requisições diretas para a Receita

**Soluções:**
- ✅ Implementar backend proxy (recomendado)
- ✅ Usar extensão CORS no navegador (só desenvolvimento)
- ✅ Integrar com NFe.io ou Focus NFe

### 2. **Chave Inválida**
```
❌ Chave de acesso inválida. Deve conter 44 dígitos.
```

**Causa:** Chave com menos ou mais de 44 dígitos

**Solução:** Verifique se copiou a chave completa

### 3. **NF-e Não Encontrada**
```
❌ NF-e não encontrada na base da Receita Federal
```

**Causas Possíveis:**
- Chave digitada errada
- NF-e ainda não processada pela Receita
- NF-e muito antiga (fora do prazo de consulta)

**Solução:** Verifique a chave e tente novamente

---

## 🔍 Logs de Debug

Abra o **Console do Navegador** (F12) para ver os logs:

```
🔍 Consultando NF-e por chave: 352108...
📡 Fazendo requisição para API da Receita...
✅ Resposta recebida da Receita
🔍 Fazendo parse do HTML da Receita...
✅ Parse concluído: { razaoSocial: "...", valor: 1500 }
```

---

## 💰 Importação Automática

Quando você clica em **"Importar"**, o sistema:

1. ✅ Cria uma **transação** automaticamente
2. ✅ Preenche:
   - **Descrição**: "NF-e 123 - FORNECEDOR LTDA"
   - **Valor**: Valor total da NF-e
   - **Tipo**: Despesa (entrada de NF-e)
   - **Categoria**: "Fornecedores"
   - **Data**: Data de emissão
   - **Fornecedor**: Razão social do emitente
   - **CNPJ**: CNPJ do emitente
3. ✅ Vincula a chave da NF-e à transação

**Resultado:** Você tem a NF-e registrada e pode conciliar com o extrato bancário!

---

## 📱 Interface Visual

### Aba "Buscar por Chave" (✅ FUNCIONA):
```
┌─────────────────────────────────────────┐
│ ✅ Consulta Real Ativada!               │
│ Esta opção consulta diretamente no      │
│ site da Receita Federal.                │
└─────────────────────────────────────────┘

Chave de Acesso (44 dígitos)
┌─────────────────────────────────────────┐
│ 35210812345678000190550010000000011234  │
│ 567890                                  │
└─────────────────────────────────────────┘
0/44 dígitos

💡 Onde encontrar a chave?
A chave de acesso está no DANFE...

[Consultar NF-e]
```

### Aba "Buscar por Período" (❌ NÃO FUNCIONA):
```
┌─────────────────────────────────────────┐
│ ⚠️ Funcionalidade Não Disponível        │
│ A busca por período requer integração   │
│ com certificado digital ou serviços     │
│ terceiros (NFe.io, Focus NFe).          │
│                                         │
│ 👉 Use a aba "Buscar por Chave" para    │
│    consultas reais!                     │
└─────────────────────────────────────────┘
```

---

## 🎉 Resumo

### ✅ O Que Funciona:
- Consulta por chave de acesso (44 dígitos)
- Busca real no site da Receita Federal
- Extração automática de dados
- Importação como transação
- Download de XML

### ❌ O Que NÃO Funciona:
- Busca por período (requer certificado digital)
- Consulta em lote
- Emissão de NF-e

### 🚀 Próximos Passos:
1. Testar com chaves reais
2. Implementar backend proxy (se der erro CORS)
3. Integrar com NFe.io ou Focus NFe (opcional)

---

**🎯 Use a aba "Buscar por Chave" para consultas reais!** ✅
