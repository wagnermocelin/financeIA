# 🤖 Recategorização Inteligente com IA

## ✅ Funcionalidade Implementada!

A IA agora consegue **analisar e recategorizar automaticamente** todas as transações cadastradas!

---

## 🎯 Como Funciona:

### 1. Análise Inteligente
A IA analisa a **descrição** de cada transação e identifica palavras-chave para sugerir a categoria mais adequada.

### 2. Regras de Categorização
O sistema usa um conjunto de regras baseadas em palavras-chave:

#### 📈 RECEITAS:
- **Vendas**: ifood, uber eats, rappi, delivery, venda, pedido, recebimento
- **Serviços**: serviço, prestação, consultoria, manutenção

#### 📉 DESPESAS:
- **Fornecedores**: atacadão, distribuidora, ltda, s.a., oesa, tozzo, lange
- **Salários**: salário, folha, pagamento funcionário, pix des
- **Utilidades**: água, luz, energia, internet, sanepar, copel, fibra
- **Aluguel**: aluguel, locação, condomínio
- **Marketing**: marketing, publicidade, propaganda, anúncio
- **Impostos**: imposto, taxa, inss, fgts, iof, encargo
- **Transporte**: combustível, gasolina, estacionamento, uber
- **Alimentação**: restaurante, mercado, supermercado, padaria
- **Equipamentos**: equipamento, máquina, computador, notebook
- **Financeiras**: juros, tarifa, empréstimo, financiamento

### 3. Nível de Confiança
Cada sugestão tem um **nível de confiança** (0-100%):
- **Alta (80-100%)**: Muitas palavras-chave encontradas
- **Média (50-79%)**: Algumas palavras-chave encontradas
- **Baixa (0-49%)**: Poucas ou nenhuma palavra-chave

### 4. Aplicação Automática
Apenas transações com **confiança >= 70%** são atualizadas automaticamente.

---

## 🚀 Como Usar:

### 1. Acessar Transações
1. Faça login no sistema
2. Vá em **Transações**
3. Você verá o botão **"Recategorizar com IA"** ✨

### 2. Executar Recategorização
1. Clique em **"Recategorizar com IA"**
2. Confirme a ação
3. Aguarde o processamento
4. Veja o resultado!

### 3. Verificar Resultados
- Console mostra logs detalhados
- Alert mostra resumo
- Transações são atualizadas automaticamente

---

## 📊 Exemplo de Uso:

### Transações Antes:
```
PIX QRS                    → Sem Categoria
TED RECEBIDA IFOOD         → Sem Categoria
CONTA DE AGUA SANEPAR      → Sem Categoria
TRANSFERENCIA PIX DES      → Sem Categoria
PAGTO ATACADAO             → Sem Categoria
```

### Após Recategorização:
```
PIX QRS                    → Salários (75% confiança)
TED RECEBIDA IFOOD         → Vendas (90% confiança)
CONTA DE AGUA SANEPAR      → Utilidades (95% confiança)
TRANSFERENCIA PIX DES      → Salários (80% confiança)
PAGTO ATACADAO             → Fornecedores (85% confiança)
```

---

## 📝 Logs no Console:

### Início:
```
🤖 Iniciando recategorização com IA...
📊 Analisando 56 transações...
```

### Estatísticas:
```
📈 Estatísticas: {
  total: 56,
  toUpdate: 42,
  highConfidence: 35,
  mediumConfidence: 7,
  lowConfidence: 14
}
```

### Processamento:
```
✅ Atualizada: TED RECEBIDA IFOOD → Vendas (90%)
✅ Atualizada: CONTA DE AGUA SANEPAR → Utilidades (95%)
✅ Atualizada: PAGTO ATACADAO → Fornecedores (85%)
...
```

### Resultado Final:
```
==================================================
✅ Recategorização concluída!
   📊 Analisadas: 56
   ✅ Atualizadas: 42
   ⚠️  Ignoradas: 14
   ❌ Erros: 0
==================================================
```

---

## 🎯 Critérios de Atualização:

### ✅ Será Atualizada:
- Categoria atual = "Sem Categoria"
- Confiança >= 70%
- Categoria sugerida existe no sistema

### ⚠️ Será Ignorada:
- Já tem categoria definida
- Confiança < 70%
- Categoria sugerida não existe

---

## 🔧 Personalização:

### Adicionar Novas Regras:
Edite o arquivo `src/services/aiCategorizationService.js`:

```javascript
const categorizationRules = {
  'Sua Nova Categoria': [
    'palavra-chave-1',
    'palavra-chave-2',
    'palavra-chave-3'
  ]
}
```

### Ajustar Nível de Confiança:
Altere o threshold na linha 60:

```javascript
if (suggestion.shouldUpdate && suggestion.confidence >= 70) {
  // Mude 70 para o valor desejado (0-100)
}
```

---

## 📈 Estatísticas Disponíveis:

A IA fornece estatísticas detalhadas:

```javascript
{
  total: 56,              // Total analisado
  toUpdate: 42,           // Recomendadas para atualização
  highConfidence: 35,     // Confiança >= 80%
  mediumConfidence: 7,    // Confiança 50-79%
  lowConfidence: 14,      // Confiança < 50%
  updatePercentage: 75    // Percentual de atualização
}
```

---

## 🎨 Interface:

### Botão "Recategorizar com IA"
- Ícone: ✨ Sparkles
- Cor: Secundária (roxo/azul)
- Estado: Desabilitado durante processamento
- Texto: "Recategorizando..." quando ativo

### Confirmação
Antes de executar, mostra:
```
Deseja recategorizar automaticamente as transações usando IA?

A IA irá analisar a descrição de cada transação e sugerir 
a categoria mais adequada.

Apenas transações com "Sem Categoria" ou baixa confiança 
serão atualizadas.
```

### Resultado
Após executar, mostra:
```
Recategorização concluída!

✅ 42 transações atualizadas
⚠️ 14 ignoradas (baixa confiança)
```

---

## 🚀 Benefícios:

### ⏱️ Economia de Tempo
- Categoriza dezenas de transações em segundos
- Elimina trabalho manual repetitivo

### 🎯 Precisão
- Baseado em palavras-chave específicas
- Nível de confiança para cada sugestão

### 🔄 Automação
- Processa em lote
- Atualiza automaticamente

### 📊 Transparência
- Logs detalhados
- Estatísticas completas
- Rastreabilidade

---

## 🔮 Melhorias Futuras:

### 1. Aprendizado de Máquina
- Aprender com escolhas do usuário
- Melhorar sugestões ao longo do tempo

### 2. Sugestões Manuais
- Mostrar sugestões antes de aplicar
- Usuário aprova/rejeita individualmente

### 3. Histórico
- Registrar todas as recategorizações
- Permitir desfazer

### 4. Regras Personalizadas
- Usuário cria suas próprias regras
- Interface para gerenciar palavras-chave

---

## 📁 Arquivos Criados:

1. ✅ `src/services/aiCategorizationService.js` - Serviço de IA
2. ✅ `src/pages/Transactions.jsx` - Botão e função adicionados
3. ✅ `RECATEGORIZACAO_IA.md` - Esta documentação

---

## 🎯 Teste Agora:

1. **Recarregue** (Ctrl+F5)
2. **Vá em Transações**
3. **Clique em "Recategorizar com IA"**
4. **Confirme**
5. **Veja a mágica acontecer!** ✨

---

## 💡 Dica:

Para melhores resultados:
1. Crie as categorias necessárias primeiro
2. Execute a recategorização
3. Revise as transações com baixa confiança
4. Ajuste manualmente se necessário

---

**🤖 A IA está pronta para organizar suas finanças!** 🚀
