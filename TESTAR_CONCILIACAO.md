# 🔄 Guia de Teste - Conciliação Bancária

## 🎯 Como Testar a Conciliação

### Passo 1: Preparar Dados

#### 1.1 Criar Transações
1. Acesse: http://localhost:3000
2. Faça login
3. Vá em **Transações**
4. Crie algumas transações de teste:
   - **Receita**: "Pagamento Cliente A" - R$ 5.000,00
   - **Despesa**: "Fornecedor B" - R$ 1.500,00
   - **Receita**: "Venda Produto X" - R$ 3.200,00

#### 1.2 Importar Extratos
1. Vá em **Conciliação**
2. Clique em **Importar Extrato**
3. Use o arquivo `test-extrato.csv` ou crie um novo:

```csv
Data,Descrição,Valor,Tipo
25/11/2024,Pagamento Cliente A,5000.00,Crédito
24/11/2024,Fornecedor B,1500.00,Débito
23/11/2024,Venda Produto X,3200.00,Crédito
```

---

## 🧪 Teste 1: Conciliação Manual

### Passos:
1. Vá em **Conciliação**
2. Na coluna esquerda, clique em uma **transação** (ex: "Pagamento Cliente A")
3. Na coluna direita, clique no **extrato** correspondente
4. Clique no botão verde **"Conciliar Selecionados"** (canto inferior direito)
5. Aguarde a mensagem de sucesso

### O que verificar:
- ✅ Console mostra: `🔄 Iniciando conciliação...`
- ✅ Console mostra: `✅ Transação atualizada`
- ✅ Console mostra: `✅ Extrato atualizado`
- ✅ Console mostra: `✅ Conciliação concluída com sucesso!`
- ✅ Alert: "Conciliação realizada com sucesso!"
- ✅ Itens somem das listas de pendentes
- ✅ Aparecem na seção "Itens Conciliados Recentemente"

### Se der erro:
- ❌ Veja o console (F12) para detalhes
- ❌ Verifique se o usuário está logado
- ❌ Verifique se as credenciais do Supabase estão corretas

---

## 🤖 Teste 2: Conciliação com IA

### Passos:
1. Vá em **Conciliação**
2. Clique em **"Conciliar com IA"** (botão roxo)
3. Aguarde a análise (alguns segundos)
4. Veja as sugestões da IA
5. Clique em **"Conciliar"** em uma sugestão
6. Aguarde a confirmação

### O que verificar:
- ✅ Sugestões aparecem com % de confiança
- ✅ Sugestões mostram transação e extrato lado a lado
- ✅ Ao clicar em "Conciliar", item é processado
- ✅ Console mostra logs de sucesso
- ✅ Sugestão some da lista
- ✅ Item aparece em "Conciliados Recentemente"

---

## 🔍 Verificar no Supabase

### Após conciliar:

1. Acesse: https://supabase.com/dashboard/project/mfkmvtobcdajqbveytfn
2. Vá em **Table Editor**
3. Clique na tabela **transactions**
4. Verifique:
   - ✅ Campo `reconciled` = `true`
   - ✅ Campo `statement_id` = ID do extrato

5. Clique na tabela **bank_statements**
6. Verifique:
   - ✅ Campo `reconciled` = `true`
   - ✅ Campo `transaction_id` = ID da transação

---

## 📊 Verificar Estatísticas

Na página de Conciliação, verifique os cards:

### Card 1: Taxa de Conciliação
- Deve aumentar após cada conciliação
- Exemplo: "66.7%" (2 de 3 transações)

### Card 2: Transações Pendentes
- Deve diminuir após conciliar
- Exemplo: "1" (se tinha 3 e conciliou 2)

### Card 3: Extratos Pendentes
- Deve diminuir após conciliar

### Card 4: Sugestões da IA
- Mostra quantas sugestões a IA encontrou

---

## 🐛 Troubleshooting

### Problema: "Erro ao conciliar"

**Possíveis causas:**
1. Usuário não está logado
2. Transação ou extrato não existe
3. Erro de permissão no Supabase
4. Credenciais incorretas

**Solução:**
1. Abra o console (F12)
2. Veja o erro detalhado
3. Verifique se está logado
4. Verifique o arquivo .env

### Problema: Conciliação não aparece

**Solução:**
1. Recarregue a página (F5)
2. Verifique no Supabase se foi salvo
3. Veja o console para erros

### Problema: Botão "Conciliar Selecionados" não aparece

**Solução:**
- Você precisa selecionar UMA transação E UM extrato
- Clique em cada item para selecioná-lo
- O botão aparece no canto inferior direito

---

## 📝 Logs Esperados no Console

### Conciliação Manual:
```
🔄 Conciliando manualmente... {transaction: "...", statement: "..."}
🔄 Iniciando conciliação... {transactionId: "...", statementId: "..."}
✅ Transação atualizada: {...}
✅ Extrato atualizado: {...}
✅ Conciliação concluída com sucesso!
✅ Conciliação manual realizada com sucesso!
```

### Conciliação com IA:
```
🔄 Conciliando via IA... {transactionId: "...", statementId: "..."}
🔄 Iniciando conciliação... {transactionId: "...", statementId: "..."}
✅ Transação atualizada: {...}
✅ Extrato atualizado: {...}
✅ Conciliação concluída com sucesso!
✅ Conciliação via IA concluída!
```

---

## ✅ Checklist de Teste

- [ ] Criar transações de teste
- [ ] Importar extratos de teste
- [ ] Testar conciliação manual
- [ ] Verificar logs no console
- [ ] Verificar dados no Supabase
- [ ] Testar conciliação com IA
- [ ] Verificar estatísticas atualizadas
- [ ] Verificar itens conciliados aparecem
- [ ] Testar com múltiplas conciliações
- [ ] Verificar que itens somem das pendências

---

## 🎯 Resultado Esperado

Após conciliar com sucesso:

1. ✅ Transação marcada como `reconciled: true`
2. ✅ Extrato marcado como `reconciled: true`
3. ✅ Vínculo criado entre transação e extrato
4. ✅ Dados salvos no Supabase
5. ✅ Interface atualizada automaticamente
6. ✅ Estatísticas atualizadas
7. ✅ Item aparece em "Conciliados Recentemente"

---

## 📞 Se precisar de ajuda:

1. Abra o console (F12)
2. Copie os logs de erro
3. Verifique o Supabase Dashboard
4. Me mostre os erros para eu ajudar

---

**🚀 Teste agora e me diga se funcionou!**
