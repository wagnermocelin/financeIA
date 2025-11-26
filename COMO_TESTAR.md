# 🚀 Como Testar o Sistema com Dados Reais

## ✅ Sistema Preparado!

O banco de dados foi **completamente limpo** e está pronto para receber dados reais!

---

## 🎯 Acesso Rápido

### 1. Sistema Principal
**URL:** http://localhost:3000

**Credenciais de Teste:**
- **Admin:** admin@financeia.com / admin123
- **Dono:** joao@empresa1.com / 123456
- **Usuário:** maria@empresa1.com / 123456

### 2. Ferramenta de Limpeza de Dados
**Arquivo:** `limpar-dados.html`

Abra este arquivo no navegador para:
- Ver estatísticas dos dados salvos
- Limpar todos os dados com um clique
- Resetar o sistema quando necessário

---

## 📝 Começando os Testes

### Passo 1: Acesse o Sistema
```
http://localhost:3000
```

### Passo 2: Faça Login
Use qualquer uma das credenciais acima

### Passo 3: Lance sua Primeira Transação

1. Clique em **"Transações"** no menu lateral
2. Clique no botão **"+ Nova Transação"**
3. Preencha os dados:
   - **Tipo:** Receita ou Despesa
   - **Descrição:** Ex: "Venda para Cliente ABC"
   - **Valor:** Ex: 5000.00
   - **Categoria:** Escolha uma das 8 categorias
   - **Data:** Selecione a data
4. Clique em **"Salvar"**

✅ **Pronto!** Sua transação foi salva e persistida no navegador.

---

## 💡 Funcionalidades para Testar

### 1. Dashboard 📊
- Visualize receitas vs despesas
- Veja gráficos atualizados em tempo real
- Acompanhe o saldo atual

### 2. Transações 💰
- Adicione receitas e despesas
- Edite transações existentes
- Exclua transações
- Filtre por tipo, categoria e período

### 3. Orçamentos 📈
- Configure limites mensais por categoria
- Receba alertas quando atingir 80% do limite
- Monitore gastos em tempo real

### 4. Conciliação Bancária 🔄
- Importe extratos em CSV ou OFX
- Use a IA para sugestões automáticas
- Concilie transações com extratos

### 5. Relatórios 📑
- Gere relatórios mensais
- Veja insights da IA
- Analise tendências

### 6. Assistente IA 🤖
- Faça perguntas sobre suas finanças
- Receba sugestões personalizadas
- Análise inteligente de dados

---

## 📥 Importando Extratos Bancários

### Formato CSV Aceito:
```csv
Data,Descrição,Valor,Tipo
25/11/2024,Pagamento Cliente A,5000.00,Crédito
24/11/2024,Fornecedor B,1500.00,Débito
23/11/2024,Salário Funcionário,3000.00,Débito
```

### Como Importar:
1. Vá em **"Conciliação"**
2. Clique em **"Importar Extrato"**
3. Arraste o arquivo CSV ou OFX
4. Revise a prévia
5. Confirme a importação

---

## 🗑️ Como Limpar os Dados

### Opção 1: Usar a Ferramenta Visual
1. Abra o arquivo `limpar-dados.html` no navegador
2. Veja as estatísticas dos dados
3. Clique em **"Limpar Todos os Dados"**
4. Confirme a ação

### Opção 2: Via Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Execute:
```javascript
localStorage.removeItem('financeia_transactions')
localStorage.removeItem('financeia_budgets')
localStorage.removeItem('financeia_bankStatements')
location.reload()
```

### Opção 3: Limpar Tudo
```javascript
localStorage.clear()
location.reload()
```

---

## 📊 Categorias Disponíveis

### 💰 Receitas:
- **Vendas** - Venda de produtos
- **Serviços** - Prestação de serviços

### 💸 Despesas:
- **Salários** - Folha de pagamento
- **Aluguel** - Aluguel e condomínio
- **Fornecedores** - Compras e materiais
- **Marketing** - Publicidade
- **Utilidades** - Água, luz, internet
- **Impostos** - Tributos e taxas

---

## 🔍 Verificando os Dados Salvos

### No Navegador:
1. Abra DevTools (F12)
2. Vá em **Application** → **Local Storage** → **http://localhost:3000**
3. Procure por:
   - `financeia_transactions`
   - `financeia_budgets`
   - `financeia_bankStatements`
   - `financeia_categories`

### Na Ferramenta de Limpeza:
- Abra `limpar-dados.html`
- Veja estatísticas em tempo real

---

## ⚠️ Observações Importantes

1. **Dados Locais:** Salvos apenas no navegador atual
2. **Sem Sincronização:** Não sincroniza entre dispositivos
3. **Backup Manual:** Faça backup se necessário
4. **Cache:** Não limpe o cache do navegador

---

## 🎯 Cenários de Teste Sugeridos

### Teste 1: Fluxo Básico
1. ✅ Lance 5 receitas
2. ✅ Lance 5 despesas
3. ✅ Veja o dashboard atualizado
4. ✅ Gere um relatório

### Teste 2: Orçamento
1. ✅ Configure orçamento de R$ 5.000 para Marketing
2. ✅ Lance R$ 4.000 em despesas de Marketing
3. ✅ Veja o alerta de 80%
4. ✅ Lance mais R$ 1.500
5. ✅ Veja o status "Excedido"

### Teste 3: Conciliação
1. ✅ Lance 3 transações
2. ✅ Importe extrato com essas transações
3. ✅ Use "Conciliar com IA"
4. ✅ Confirme as sugestões

### Teste 4: Multi-Empresa (Admin)
1. ✅ Login como admin
2. ✅ Cadastre nova empresa
3. ✅ Crie usuário para a empresa
4. ✅ Faça login com o novo usuário
5. ✅ Lance transações

---

## 📁 Arquivos Importantes

- `INSTRUCOES_TESTE.md` - Instruções detalhadas
- `limpar-dados.html` - Ferramenta de limpeza visual
- `COMO_TESTAR.md` - Este arquivo (guia rápido)

---

## 🚀 Status Atual

- ✅ Dados mockados removidos
- ✅ Persistência com localStorage ativada
- ✅ Sistema pronto para dados reais
- ✅ Ferramenta de limpeza criada
- ✅ Categorias padrão mantidas
- ✅ Servidor rodando em http://localhost:3000

---

## 💬 Dúvidas?

Consulte os arquivos:
- `README.md` - Documentação completa
- `INSTRUCOES_TESTE.md` - Instruções detalhadas
- `INTEGRACAO_NFE.md` - Sobre notas fiscais
- `IMPORTACAO_EXTRATOS.md` - Sobre importação

---

**🎉 Tudo pronto para começar os testes com dados reais!**
