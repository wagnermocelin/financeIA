# 📥 Guia de Importação de Extratos Bancários

## 🎯 Visão Geral

O FinanceIA permite importar extratos bancários em formato **CSV** ou **OFX** para facilitar a conciliação bancária automática.

## 📋 Formatos Suportados

### 1. CSV (Comma-Separated Values)

**Formato mais comum e flexível**

#### Requisitos Mínimos:
- ✅ Coluna de **Data** (DD/MM/YYYY ou YYYY-MM-DD)
- ✅ Coluna de **Descrição/Histórico**
- ✅ Coluna de **Valor**
- ⚠️ Coluna de **Tipo** (Crédito/Débito) - opcional

#### Exemplo de CSV:
```csv
Data,Descrição,Valor,Tipo
01/11/2024,TED RECEBIDA - CLIENTE A,15000.00,Crédito
05/11/2024,PAGAMENTO FOLHA,-25000.00,Débito
10/11/2024,PIX RECEBIDO - VENDA,8500.00,Crédito
15/11/2024,BOLETO FORNECEDOR,-6800.00,Débito
```

#### Separadores Aceitos:
- Vírgula (`,`)
- Ponto-e-vírgula (`;`)

#### Formatos de Valor:
- `15000.00` (ponto decimal)
- `15000,00` (vírgula decimal - formato brasileiro)
- `-15000.00` (valores negativos para débitos)

### 2. OFX (Open Financial Exchange)

**Formato padrão dos bancos brasileiros**

#### Como Obter:
1. Acesse o internet banking do seu banco
2. Vá em "Extratos" ou "Movimentações"
3. Selecione o período desejado
4. Escolha "Exportar" ou "Baixar"
5. Selecione formato **OFX**

#### Bancos que Suportam OFX:
- ✅ Banco do Brasil
- ✅ Itaú
- ✅ Bradesco
- ✅ Santander
- ✅ Caixa Econômica
- ✅ Nubank
- ✅ Inter
- ✅ C6 Bank

## 🚀 Como Importar

### Passo 1: Acesse a Conciliação
1. Faça login no FinanceIA
2. Vá em **"Conciliação"** no menu lateral
3. Clique em **"Importar Extrato"**

### Passo 2: Selecione o Arquivo
- **Arraste e solte** o arquivo na área de upload, ou
- **Clique** para selecionar do seu computador

### Passo 3: Processamento Automático
O sistema irá:
1. 🔍 Detectar automaticamente o formato (CSV ou OFX)
2. 📊 Identificar as colunas necessárias
3. ✅ Validar os dados
4. 📋 Mostrar prévia das transações

### Passo 4: Confirme a Importação
- Revise a prévia das transações
- Verifique se os valores estão corretos
- Clique em **"Importar X Transações"**

## 🎨 Recursos Inteligentes

### Detecção Automática de Colunas
O sistema identifica automaticamente:
- 📅 Colunas de data (data, date, dt)
- 📝 Colunas de descrição (descrição, histórico, description, memo)
- 💰 Colunas de valor (valor, amount, value)
- 🔄 Colunas de tipo (tipo, type, crédito, débito)

### Conversão de Formatos
- Converte datas brasileiras (DD/MM/YYYY) automaticamente
- Aceita valores com vírgula ou ponto decimal
- Identifica débitos por sinal negativo ou coluna de tipo

### Validação de Dados
- ❌ Ignora linhas vazias ou inválidas
- ⚠️ Alerta sobre problemas de formatação
- ✅ Valida datas e valores antes de importar

## 📝 Template CSV

Baixe um template de exemplo clicando em **"Baixar template CSV"** no modal de importação.

### Estrutura do Template:
```csv
Data,Descrição,Valor,Tipo
01/11/2024,TED RECEBIDA - CLIENTE A,15000.00,Crédito
05/11/2024,PAGAMENTO FOLHA,25000.00,Débito
10/11/2024,PIX RECEBIDO - VENDA,8500.00,Crédito
```

## 🔧 Preparando seu Extrato

### Para CSV:

1. **Exporte do Excel/Google Sheets:**
   - Abra seu extrato
   - Vá em "Arquivo" > "Salvar como"
   - Escolha formato **CSV**

2. **Organize as Colunas:**
   - Primeira linha deve ser o cabeçalho
   - Mantenha apenas as colunas necessárias
   - Use nomes claros (Data, Descrição, Valor)

3. **Formate os Dados:**
   - Datas no formato DD/MM/YYYY
   - Valores numéricos (sem símbolos de moeda)
   - Use vírgula ou ponto para decimais

### Para OFX:

1. **Baixe direto do banco:**
   - Não é necessário editar
   - O formato já está padronizado
   - Basta fazer upload

## ⚠️ Problemas Comuns

### "Não foi possível identificar as colunas"
**Solução:** Verifique se a primeira linha contém os nomes das colunas (Data, Descrição, Valor)

### "Arquivo CSV vazio ou inválido"
**Solução:** 
- Certifique-se que o arquivo tem pelo menos 2 linhas (cabeçalho + dados)
- Verifique se está usando vírgula ou ponto-e-vírgula como separador

### "Formato de arquivo não suportado"
**Solução:** Use apenas arquivos CSV (.csv) ou OFX (.ofx)

### Valores não aparecem corretamente
**Solução:**
- Remova símbolos de moeda (R$, $)
- Use ponto ou vírgula para decimais
- Valores negativos devem ter sinal `-` ou coluna de tipo

## 🎯 Após a Importação

### O que acontece:
1. ✅ Transações são adicionadas à lista de "Extratos Importados"
2. 🤖 Sistema sugere conciliações automáticas com IA
3. 📊 Você pode revisar e confirmar as conciliações

### Próximos Passos:
1. Revise os extratos importados
2. Use o botão **"Conciliar com IA"** para sugestões automáticas
3. Confirme as conciliações sugeridas
4. Concilie manualmente itens restantes se necessário

## 💡 Dicas Pro

### Para Melhor Precisão:
- ✅ Importe extratos mensalmente
- ✅ Use descrições claras e consistentes
- ✅ Mantenha o formato padrão do seu banco
- ✅ Revise os dados antes de importar

### Para Economizar Tempo:
- 🚀 Configure um template CSV padrão
- 🚀 Salve o formato do seu banco
- 🚀 Use a conciliação automática com IA
- 🚀 Importe múltiplos meses de uma vez

## 📞 Suporte

Problemas com importação?
- Verifique este guia primeiro
- Baixe e teste o template CSV de exemplo
- Entre em contato com o suporte técnico

---

**FinanceIA** - Importação inteligente de extratos bancários 🚀
