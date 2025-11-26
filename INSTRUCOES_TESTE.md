# 🧪 Instruções para Testes com Dados Reais

## ✅ Sistema Limpo e Pronto

O banco de dados foi limpo e o sistema está configurado para trabalhar com dados reais!

## 🔧 O que foi feito:

1. ✅ **Dados mockados removidos** - Todas as transações, orçamentos e extratos de exemplo foram removidos
2. ✅ **Persistência ativada** - Dados agora são salvos no localStorage do navegador
3. ✅ **Categorias mantidas** - As 8 categorias padrão foram mantidas para facilitar o uso
4. ✅ **Sistema resetável** - Função para limpar dados quando necessário

## 📋 Como Começar os Testes

### 1. Acesse o Sistema
- O servidor já está rodando em: http://localhost:3000
- Faça login com as credenciais existentes

### 2. Lance Transações Reais

#### Receitas:
1. Vá em **"Transações"** no menu
2. Clique em **"Nova Transação"**
3. Preencha:
   - **Tipo**: Receita
   - **Descrição**: Ex: "Pagamento Cliente XYZ"
   - **Valor**: Ex: 5000.00
   - **Categoria**: Vendas ou Serviços
   - **Data**: Selecione a data real
4. Clique em **"Salvar"**

#### Despesas:
1. Mesmo processo, mas selecione **Tipo: Despesa**
2. Use categorias como:
   - Salários
   - Aluguel
   - Fornecedores
   - Marketing
   - Utilidades
   - Impostos

### 3. Configure Orçamentos

1. Vá em **"Orçamentos"**
2. Clique em **"Novo Orçamento"**
3. Defina limites mensais por categoria
4. Configure alertas (padrão: 80%)

### 4. Importe Extratos Bancários

1. Vá em **"Conciliação"**
2. Clique em **"Importar Extrato"**
3. Arraste um arquivo CSV ou OFX
4. Revise e confirme a importação

**Formato CSV esperado:**
```csv
Data,Descrição,Valor,Tipo
25/11/2024,Pagamento Cliente A,5000.00,Crédito
24/11/2024,Fornecedor B,1500.00,Débito
```

### 5. Use a Conciliação com IA

1. Após importar extratos, clique em **"Conciliar com IA"**
2. Revise as sugestões automáticas
3. Confirme ou ajuste manualmente

## 🗑️ Como Limpar os Dados (Se Necessário)

### Opção 1: Via Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Digite e execute:
```javascript
localStorage.removeItem('financeia_transactions')
localStorage.removeItem('financeia_budgets')
localStorage.removeItem('financeia_bankStatements')
location.reload()
```

### Opção 2: Via Aplicação
Abra o console e execute:
```javascript
// Acesse o contexto e limpe os dados
// (Função clearAllData disponível no FinanceContext)
```

### Opção 3: Limpar Todo o localStorage
```javascript
localStorage.clear()
location.reload()
```

## 📊 Dados que Serão Persistidos

- ✅ **Transações** - Todas as receitas e despesas lançadas
- ✅ **Orçamentos** - Limites configurados por categoria
- ✅ **Extratos Bancários** - Arquivos importados
- ✅ **Categorias** - Personalizações (se houver)

## 🎯 Cenários de Teste Sugeridos

### Teste 1: Fluxo Completo de Receita
1. Lance uma receita
2. Importe extrato com essa receita
3. Use a conciliação automática
4. Verifique no Dashboard

### Teste 2: Controle de Orçamento
1. Configure orçamento de R$ 5.000 para Marketing
2. Lance despesas de Marketing
3. Observe os alertas quando atingir 80%
4. Veja o status no Dashboard

### Teste 3: Gestão Mensal
1. Lance todas as transações de um mês real
2. Importe extratos do mesmo período
3. Faça a conciliação completa
4. Gere relatórios

### Teste 4: Múltiplas Empresas
1. Faça login como Admin
2. Cadastre uma nova empresa
3. Crie usuário para essa empresa
4. Lance transações específicas

## 📝 Categorias Disponíveis

### Receitas:
- 💰 **Vendas** - Venda de produtos
- 💼 **Serviços** - Prestação de serviços

### Despesas:
- 👥 **Salários** - Folha de pagamento
- 🏠 **Aluguel** - Aluguel e condomínio
- 📦 **Fornecedores** - Compras de materiais
- 📢 **Marketing** - Publicidade e propaganda
- ⚡ **Utilidades** - Água, luz, internet
- 📄 **Impostos** - Tributos e taxas

## 🔍 Verificando os Dados

### No Navegador:
1. Abra DevTools (F12)
2. Vá em **Application** > **Local Storage**
3. Procure por `financeia_*`
4. Veja os dados em JSON

### No Sistema:
- **Dashboard**: Visão geral dos números
- **Transações**: Lista completa
- **Relatórios**: Análises detalhadas

## ⚠️ Observações Importantes

1. **Dados Locais**: Os dados ficam salvos apenas no navegador atual
2. **Backup Manual**: Não há backup automático ainda
3. **Múltiplos Navegadores**: Dados não são sincronizados entre navegadores
4. **Limpar Cache**: Cuidado ao limpar cache do navegador

## 🚀 Próximos Passos (Futuro)

- [ ] Backend real com banco de dados
- [ ] Sincronização em nuvem
- [ ] Backup automático
- [ ] API REST
- [ ] App mobile

## 💡 Dicas

- ✅ Lance dados reais do seu negócio
- ✅ Teste todas as funcionalidades
- ✅ Experimente a importação de extratos
- ✅ Use a IA para conciliação
- ✅ Configure orçamentos realistas
- ✅ Gere relatórios mensais

## 📞 Suporte

Encontrou algum problema?
- Verifique o console do navegador (F12)
- Limpe os dados e tente novamente
- Recarregue a página

---

**FinanceIA** - Sistema pronto para testes reais! 🎉
