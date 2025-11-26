# 💰 FinanceIA - Sistema de Gestão Financeira Empresarial

Sistema completo de gestão financeira com IA integrada, desenvolvido em React + Supabase.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)

---

## 🚀 Funcionalidades Principais

### 💳 Importação Automática de Faturas
- ✅ **Parser Bradesco** - Extrai 43+ transações automaticamente
- ✅ Suporte a PDF com múltiplas páginas
- ✅ Detecção automática de operadora
- ✅ Extração de valor total, vencimento e transações

### 📊 Gestão de Transações
- ✅ **Categorização em Lote** - Selecione múltiplas transações e categorize de uma vez
- ✅ **IA para Recategorização** - Categorização automática baseada em descrição
- ✅ Filtros avançados (tipo, categoria, período)
- ✅ Busca em tempo real
- ✅ Importação/Exportação Excel

### 📋 Notas Fiscais Eletrônicas (NF-e)
- ✅ **Consulta Real na Receita Federal** - Busca por chave de acesso (44 dígitos)
- ✅ Extração automática de dados (emitente, valor, status)
- ✅ Download de XML
- ✅ Importação automática como transação

### 🏦 Conciliação Bancária
- ✅ Importação de extratos (OFX, CSV)
- ✅ Conciliação manual e automática
- ✅ Detecção de duplicatas
- ✅ Gestão de múltiplas contas

### 💼 Gestão Empresarial
- ✅ Múltiplos cartões de crédito
- ✅ Gestão de fornecedores
- ✅ Orçamentos e metas
- ✅ Categorias personalizadas
- ✅ Relatórios financeiros

### 📈 Dashboard e Análises
- ✅ Visão geral financeira
- ✅ Gráficos de receitas x despesas
- ✅ Análise por categoria
- ✅ Evolução temporal
- ✅ Indicadores de performance

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Interface moderna e responsiva
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Estilização utility-first
- **Lucide Icons** - Ícones modernos
- **PDF.js** - Parsing de PDFs

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança por linha

### Integrações
- **Receita Federal** - Consulta de NF-e
- **IA Local** - Categorização inteligente
- **Excel/CSV** - Importação/Exportação

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase (gratuita)

### 1. Clone o Repositório
```bash
git clone https://github.com/SEU_USUARIO/FinanceIA.git
cd FinanceIA
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima

#### 3.2. Configure as Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

#### 3.3. Execute o Schema SQL
No painel do Supabase, vá em **SQL Editor** e execute:
```sql
-- Copie e cole o conteúdo de supabase-schema.sql
```

### 4. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🎯 Como Usar

### 1️⃣ Importar Fatura de Cartão

1. Vá em **Cartões de Crédito**
2. Clique em **Importar Fatura**
3. Selecione o PDF da fatura Bradesco
4. Sistema extrai automaticamente:
   - Valor total
   - Data de vencimento
   - 43+ transações individuais

### 2️⃣ Categorizar em Lote

1. Vá em **Transações**
2. Selecione múltiplas transações (checkboxes)
3. Clique em **Categorizar Selecionadas**
4. Escolha a categoria
5. Pronto! ✅

### 3️⃣ Consultar NF-e

1. Vá em **Gestão de NF-e**
2. Clique em **Buscar NF-e**
3. Aba **"Buscar por Chave"**
4. Digite a chave de 44 dígitos
5. Sistema busca na Receita Federal
6. Clique em **Importar** para criar transação

### 4️⃣ Conciliar Extrato Bancário

1. Vá em **Conciliação Bancária**
2. Importe extrato (OFX ou CSV)
3. Sistema sugere conciliações automáticas
4. Confirme ou ajuste manualmente

---

## 📚 Documentação

### Arquivos de Documentação Incluídos:

- `CATEGORIZACAO_LOTE.md` - Guia de categorização em lote
- `NFE_COMO_USAR.md` - Como usar consulta de NF-e
- `INTEGRACAO_NFE_REAL.md` - Detalhes da integração com Receita
- `BRADESCO_CORRIGIDO.md` - Parser de fatura Bradesco
- `CONFIGURAR_SUPABASE.md` - Setup do Supabase
- `COMO_TESTAR.md` - Guia de testes

---

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Importação de Fatura
![Importação](docs/screenshots/importacao.png)

### Categorização em Lote
![Categorização](docs/screenshots/categorizacao.png)

### Consulta NF-e
![NFe](docs/screenshots/nfe.png)

---

## 🔧 Configuração Avançada

### Desabilitar RLS (Desenvolvimento)
Para desenvolvimento local, você pode desabilitar RLS:

```sql
-- Execute no SQL Editor do Supabase
-- Copie o conteúdo de desabilitar-rls-desenvolvimento.sql
```

⚠️ **Atenção**: Não use em produção!

### Adicionar Mais Operadoras de Cartão

Edite `src/utils/creditCardInvoiceParser.js`:

```javascript
// Adicione novos padrões regex para outras operadoras
const patterns = {
  bradesco: /padrão_bradesco/,
  nubank: /padrão_nubank/,
  itau: /padrão_itau/,
  // ...
}
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Faça upload da pasta dist/
```

### Variáveis de Ambiente
Não esqueça de configurar:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🤝 Contribuindo

Contribuições são bem-vindas! 

### Como Contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Áreas para Contribuição:

- 🏦 Novos parsers de bancos/cartões
- 📊 Novos tipos de relatórios
- 🎨 Melhorias de UI/UX
- 🐛 Correção de bugs
- 📝 Documentação
- 🌍 Traduções

---

## 📝 Roadmap

### Em Desenvolvimento
- [ ] Parser Nubank
- [ ] Parser Itaú
- [ ] Emissão de NF-e
- [ ] Integração com contabilidade
- [ ] App mobile (React Native)

### Planejado
- [ ] Integração com Open Banking
- [ ] Previsão de fluxo de caixa com IA
- [ ] Alertas inteligentes
- [ ] API pública
- [ ] Webhooks

---

## 🐛 Problemas Conhecidos

### CORS na Consulta de NF-e
O navegador pode bloquear requisições diretas para a Receita Federal.

**Solução**: Implementar backend proxy ou usar extensão CORS (desenvolvimento).

### Busca de NF-e por Período
Requer certificado digital A1/A3 ou integração com serviços terceiros (NFe.io, Focus NFe).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Wagner Mocelin**

- GitHub: [@SEU_USUARIO](https://github.com/SEU_USUARIO)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend incrível
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Lucide](https://lucide.dev) - Ícones
- [PDF.js](https://mozilla.github.io/pdf.js/) - Parsing de PDF
- Comunidade React

---

## 📊 Estatísticas do Projeto

- **117 arquivos**
- **31.000+ linhas de código**
- **React 18** + **Vite 5**
- **PostgreSQL** via Supabase
- **100% TypeScript-ready**

---

## 🔗 Links Úteis

- [Documentação Completa](docs/README.md)
- [Guia de Instalação](CONFIGURAR_SUPABASE.md)
- [Como Usar NF-e](NFE_COMO_USAR.md)
- [Categorização em Lote](CATEGORIZACAO_LOTE.md)
- [Issues](https://github.com/SEU_USUARIO/FinanceIA/issues)

---

## ⭐ Mostre seu Apoio

Se este projeto foi útil para você, considere dar uma ⭐!

---

**Desenvolvido com ❤️ usando React e Supabase**
