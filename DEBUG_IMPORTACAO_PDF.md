# 🔍 Debug: Importação de PDF não encontra transações

## ❌ Problema:
Fatura do Bradesco extraiu valor total (R$ 8.919,23) e vencimento (10/11/2025), mas **0 transações**.

---

## 🔧 Como Debugar:

### 1. Recarregar Aplicação
```
Ctrl+F5
```

### 2. Importar PDF Novamente
1. **Cartões de Crédito** → **"Importar Fatura"**
2. Selecione o PDF do Bradesco
3. **Abra o Console** (F12)

### 3. Analisar Logs

Você verá algo assim:

```
📄 Extraindo texto do PDF...
✅ Texto extraído com sucesso
🏦 Operadora identificada: Bradesco

🔍 Analisando 150 linhas do PDF...

📋 Primeiras 20 linhas do PDF:
  1: "FATURA BRADESCO"
  2: "Vencimento: 10/11/2025"
  3: "Total: R$ 8.919,23"
  4: "10/10 MERCADO EXTRA 150,00"      ← EXEMPLO DE TRANSAÇÃO
  5: "12/10 POSTO SHELL 200,00"        ← EXEMPLO DE TRANSAÇÃO
  ...

📊 Estatísticas de Extração:
   📄 Linhas processadas: 120
   ✅ Linhas com matches: 0
   💳 Transações extraídas: 0
   ❌ Duplicatas removidas: 0

⚠️ NENHUMA TRANSAÇÃO ENCONTRADA!
```

---

## 📋 Identifique o Padrão:

### Olhe para as linhas 4, 5, 6... (transações)

**Exemplo 1:** `10/10 MERCADO EXTRA 150,00`
- Formato: `DD/MM DESCRIÇÃO VALOR`

**Exemplo 2:** `MERCADO EXTRA 10/10/2024 150,00`
- Formato: `DESCRIÇÃO DD/MM/YYYY VALOR`

**Exemplo 3:** `10 OUT MERCADO EXTRA R$ 150,00`
- Formato: `DD MÊS DESCRIÇÃO R$ VALOR`

---

## 💬 Me Envie:

### Copie 3-5 linhas de transações do console

Exemplo:
```
  15: "10/10 MERCADO EXTRA 150,00"
  16: "12/10 POSTO SHELL 200,00"
  17: "15/10 RESTAURANTE 85,50"
```

**Com essas linhas, posso criar o regex específico para o Bradesco!**

---

## 🎯 Formatos Já Suportados:

1. ✅ `10/11 LOJA NOME R$ 123,45`
2. ✅ `10 NOV LOJA NOME R$ 123,45`
3. ✅ `LOJA NOME 10/11 R$ 123,45`
4. ✅ `10 NOV LOJA NOME 123,45`
5. ✅ `LOJA NOME 123,45` (sem data)
6. ✅ `10/11 LOJA NOME 123,45`
7. ✅ `LOJA NOME 10/11/2024 123,45`
8. ✅ `123,45 LOJA NOME 10/11`

---

## 🔧 Solução Rápida:

Se você me enviar o formato exato das linhas, eu crio o regex em segundos!

**Exemplo de resposta:**
```
As linhas são assim:
  "10/10/2024 MERCADO EXTRA 150,00"
  "12/10/2024 POSTO SHELL 200,00"
```

**Eu respondo:**
```javascript
// Padrão 9: Bradesco - "DD/MM/YYYY DESCRIÇÃO VALOR"
/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/gi
```

---

## 📊 Checklist de Debug:

- [ ] Recarreguei a aplicação (Ctrl+F5)
- [ ] Importei o PDF novamente
- [ ] Abri o Console (F12)
- [ ] Vi as "Primeiras 20 linhas"
- [ ] Identifiquei o padrão das transações
- [ ] Copiei 3-5 linhas de exemplo
- [ ] Enviei para análise

---

## 💡 Dica:

O parser já mostra as primeiras 20 linhas do PDF no console.
**Procure por linhas que parecem transações** (têm data e valor).

---

**🔍 Importe o PDF novamente e me envie as linhas de exemplo!** 📋
