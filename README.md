# FinanceIA - Sistema de Controle Financeiro Empresarial com IA

Sistema web moderno de gestão financeira empresarial com inteligência artificial integrada, desenvolvido com React e TailwindCSS.

## 🚀 Funcionalidades

### 🔐 Autenticação e Controle de Acesso
- Sistema de login seguro
- Três níveis de acesso: Admin, Dono de Empresa e Usuário
- Proteção de rotas por permissão
- Gerenciamento de sessão
- Logout seguro

### 👥 Painel Administrativo
- **Dashboard Admin**: Visão geral do sistema completo
- **Gestão de Empresas**: CRUD completo de empresas
  - Cadastro com CNPJ, endereço e planos
  - Ativação/desativação de empresas
  - Controle de planos (Básico, Premium, Enterprise)
- **Gestão de Usuários**: CRUD completo de usuários
  - Cadastro com diferentes perfis
  - Vinculação com empresas
  - Ativação/desativação de usuários
  - Controle de permissões

### 📊 Dashboard Financeiro
- Visão geral completa das finanças
- Gráficos interativos de receitas vs despesas
- Análise de despesas por categoria
- Tendências de saldo
- Status de orçamentos em tempo real
- Transações recentes

### 💰 Gestão de Transações
- Cadastro completo de receitas e despesas
- Categorização automática
- Filtros avançados por tipo, categoria e período
- Edição e exclusão de transações
- Status de conciliação

### 🔄 Conciliação Bancária com IA
- Sugestões inteligentes de conciliação
- Matching automático de transações com extratos
- Análise de confiança por IA
- Visualização de itens pendentes e conciliados
- Taxa de conciliação em tempo real

### 📈 Controle de Orçamentos
- Criação de orçamentos por categoria
- Monitoramento de limites de gastos
- Alertas configuráveis
- Visualização de progresso
- Status visual (normal, atenção, excedido)

### 📑 Relatórios com IA
- Geração automática de relatórios financeiros
- Insights inteligentes sobre desempenho
- Análise de categorias de despesa
- Recomendações personalizadas
- Margem de lucro e indicadores
- Exportação para PDF e Excel

### 🤖 Assistente IA
- Chat interativo com assistente financeiro
- Análise de receitas e despesas
- Sugestões contextualizadas
- Ações rápidas
- Respostas em tempo real

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navegação SPA
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passos

1. **Clone o repositório** (ou use o diretório atual)
```bash
cd c:/Users/Wagner/Desktop/SISTEMAS/FinanceIA
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse o aplicativo**
```
http://localhost:3000
```

## 🔑 Credenciais de Acesso

O sistema possui três níveis de usuários pré-cadastrados para demonstração:

### Administrador do Sistema
- **Email**: admin@financeia.com
- **Senha**: admin123
- **Permissões**: Acesso total ao sistema, gestão de empresas e usuários

### Dono de Empresa
- **Email**: joao@empresa1.com
- **Senha**: 123456
- **Permissões**: Gestão financeira completa da empresa, gestão de usuários da empresa

### Usuário Padrão
- **Email**: maria@empresa1.com
- **Senha**: 123456
- **Permissões**: Acesso ao sistema financeiro da empresa

## 🏗️ Estrutura do Projeto

```
FinanceIA/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout.jsx       # Layout principal com sidebar
│   │   ├── Card.jsx         # Componente de card
│   │   ├── StatCard.jsx     # Card de estatísticas
│   │   ├── Modal.jsx        # Modal genérico
│   │   └── LoadingSpinner.jsx
│   ├── pages/               # Páginas da aplicação
│   │   ├── Login.jsx        # Página de login
│   │   ├── Dashboard.jsx    # Dashboard principal
│   │   ├── Transactions.jsx # Gestão de transações
│   │   ├── BankReconciliation.jsx
│   │   ├── Budgets.jsx      # Controle de orçamentos
│   │   ├── Reports.jsx      # Relatórios com IA
│   │   ├── AIAssistant.jsx  # Assistente IA
│   │   └── admin/           # Páginas administrativas
│   │       ├── AdminDashboard.jsx
│   │       ├── CompanyManagement.jsx
│   │       └── UserManagement.jsx
│   ├── context/             # Context API
│   │   ├── AuthContext.jsx  # Contexto de autenticação
│   │   └── FinanceContext.jsx
│   ├── utils/               # Utilitários
│   │   ├── mockData.js      # Dados de exemplo
│   │   ├── aiService.js     # Serviço de IA
│   │   └── formatters.js    # Formatadores
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Design

### Mobile-First
- Interface totalmente responsiva
- Otimizada para dispositivos móveis
- Sidebar colapsável
- Tabelas com scroll horizontal
- Touch-friendly

### Sistema de Cores
- **Primary**: Azul (#0ea5e9)
- **Success**: Verde (#10b981)
- **Danger**: Vermelho (#ef4444)
- **Warning**: Amarelo (#f59e0b)
- **Purple**: Roxo (#8b5cf6) - IA

## 🤖 Integração com IA

O sistema possui um serviço de IA simulado (`src/utils/aiService.js`) que pode ser facilmente integrado com APIs reais:

### Serviços Disponíveis

1. **analyzeTransaction** - Categorização automática
2. **suggestReconciliation** - Matching inteligente
3. **generateReport** - Geração de relatórios
4. **predictCashFlow** - Previsão de fluxo de caixa
5. **chat** - Assistente conversacional

### Integração com APIs Reais

Para integrar com OpenAI, Claude ou outro serviço:

```javascript
// Exemplo com OpenAI
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
})

export const aiService = {
  async chat(message, context) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Você é um assistente financeiro..." },
        { role: "user", content: message }
      ]
    })
    return response.choices[0].message.content
  }
}
```

## 📱 Funcionalidades Mobile

- ✅ Sidebar responsiva com menu hambúrguer
- ✅ Gráficos adaptáveis
- ✅ Tabelas com scroll horizontal
- ✅ Formulários otimizados para touch
- ✅ Cards empilháveis em telas pequenas
- ✅ Navegação bottom-friendly

## 🔐 Segurança

Para produção, implemente:

- [ ] Autenticação de usuários
- [ ] Autorização baseada em roles
- [ ] Criptografia de dados sensíveis
- [ ] HTTPS obrigatório
- [ ] Proteção contra CSRF
- [ ] Rate limiting
- [ ] Validação de inputs

## 🚀 Deploy

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

### Opções de Deploy

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Configure no repositório
- **Docker**: Crie um Dockerfile

## 📊 Dados de Exemplo

O sistema vem com dados de exemplo pré-configurados em `src/utils/mockData.js`:

- 8 transações de exemplo
- 3 orçamentos configurados
- 5 extratos bancários
- 8 categorias (receitas e despesas)

## 🎯 Próximos Passos

- [ ] Integração com API real de IA
- [ ] Backend com Node.js/Express
- [ ] Banco de dados (PostgreSQL/MongoDB)
- [ ] Autenticação JWT
- [ ] Upload de extratos bancários (CSV/OFX)
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Múltiplas empresas/usuários
- [ ] Exportação de dados
- [ ] Integração com bancos via Open Banking

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
npm run lint     # Executa linter
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ para gestão financeira empresarial inteligente.

---

**FinanceIA** - Controle Financeiro Empresarial com Inteligência Artificial
