# 📊 Importação de Fornecedores via Excel

## ✅ Funcionalidade Implementada!

Agora você pode **importar centenas de fornecedores** de uma vez usando uma planilha Excel!

---

## 🎯 Como Funciona:

### 1. Baixar Template
- Clique em **"Baixar Template"**
- Um arquivo `template_fornecedores.xlsx` será baixado
- O template já vem com exemplos preenchidos

### 2. Preencher Planilha
- Abra o template no Excel
- Preencha os dados dos fornecedores
- Siga o formato do exemplo

### 3. Importar
- Clique em **"Importar Excel"**
- Selecione sua planilha preenchida
- Confirme a importação
- Pronto! Fornecedores importados

---

## 📋 Formato da Planilha:

### Colunas Disponíveis:

| Coluna | Obrigatório | Formato | Exemplo |
|--------|-------------|---------|---------|
| **Nome** | ✅ Sim | Texto | Exemplo Fornecedor Ltda |
| **CNPJ** | ❌ Não | 00.000.000/0000-00 | 12.345.678/0001-90 |
| **Email** | ❌ Não | email@dominio.com | contato@fornecedor.com.br |
| **Telefone** | ❌ Não | (00) 0000-0000 | (41) 3333-4444 |
| **Endereço** | ❌ Não | Texto | Rua Exemplo, 123 |
| **Cidade** | ❌ Não | Texto | Curitiba |
| **Estado** | ❌ Não | UF | PR |
| **CEP** | ❌ Não | 00000-000 | 80000-000 |
| **Contato** | ❌ Não | Texto | João Silva |
| **Observações** | ❌ Não | Texto | Fornecedor de materiais |

---

## 🎨 Flexibilidade de Nomes:

O sistema aceita **vários nomes** para as colunas:

### Nome:
- `Nome`, `nome`, `NOME`
- `Razão Social`, `razao_social`
- `Fornecedor`, `fornecedor`

### CNPJ:
- `CNPJ`, `cnpj`
- `CPF`, `cpf`
- `Documento`, `documento`

### Email:
- `Email`, `email`
- `E-mail`, `e-mail`

### Telefone:
- `Telefone`, `telefone`
- `Fone`, `fone`
- `Celular`, `celular`

### Endereço:
- `Endereço`, `endereco`
- `Rua`, `rua`

### Cidade:
- `Cidade`, `cidade`

### Estado:
- `Estado`, `estado`
- `UF`, `uf`

### CEP:
- `CEP`, `cep`

### Contato:
- `Contato`, `contato`
- `Responsável`, `responsavel`

### Observações:
- `Observações`, `observacoes`
- `Obs`, `obs`
- `Notas`, `notas`

---

## ✅ Validações Automáticas:

### Nome:
- ✅ Obrigatório
- ✅ Mínimo 2 caracteres

### CNPJ/CPF:
- ✅ 11 dígitos (CPF) ou 14 dígitos (CNPJ)
- ✅ Formatação automática (remove pontos e traços)

### Email:
- ✅ Formato válido (usuario@dominio.com)

### CEP:
- ✅ 8 dígitos
- ✅ Formatação automática (remove traços)

### Telefone:
- ✅ Formatação automática (remove parênteses e traços)

---

## 📊 Processo de Importação:

### 1. Leitura do Arquivo
```
📂 Lendo arquivo Excel...
📊 Planilha encontrada: Fornecedores
📋 Total de linhas: 50
```

### 2. Validação
```
✅ Fornecedores válidos: 48
⚠️ Fornecedores inválidos: 2
```

### 3. Confirmação
```
Importação de Fornecedores

📊 Total: 50
✅ Válidos: 48
❌ Inválidos: 2

Deseja importar os 48 fornecedores válidos?
```

### 4. Importação
```
✅ Importado: Exemplo Fornecedor Ltda
✅ Importado: Outro Fornecedor ME
✅ Importado: Distribuidora ABC
...
```

### 5. Resultado
```
==================================================
✅ Importação concluída!
   ✅ Importados: 48
   ❌ Erros: 0
   ⚠️  Ignorados: 2
==================================================
```

---

## 🎯 Exemplo de Planilha:

```
Nome                        | CNPJ              | Email                    | Telefone        | Cidade    | Estado
---------------------------|-------------------|--------------------------|-----------------|-----------|--------
Exemplo Fornecedor Ltda    | 12.345.678/0001-90| contato@fornecedor.com.br| (41) 3333-4444 | Curitiba  | PR
Outro Fornecedor ME        | 98.765.432/0001-10| vendas@outro.com.br      | (41) 9999-8888 | São Paulo | SP
Distribuidora ABC          | 11.222.333/0001-44| abc@distribuidora.com    | (11) 5555-6666 | São Paulo | SP
```

---

## 🚀 Como Usar:

### Passo 1: Baixar Template
1. Vá em **Fornecedores**
2. Clique em **"Baixar Template"**
3. Arquivo `template_fornecedores.xlsx` será baixado

### Passo 2: Preencher Dados
1. Abra o template no Excel
2. Delete as linhas de exemplo
3. Preencha com seus fornecedores
4. Salve o arquivo

### Passo 3: Importar
1. Clique em **"Importar Excel"**
2. Selecione seu arquivo
3. Aguarde a validação
4. Confirme a importação
5. Pronto!

---

## 📝 Logs no Console:

### Início:
```
📂 Iniciando importação de fornecedores...
📄 Arquivo: meus_fornecedores.xlsx
📂 Lendo arquivo Excel...
📊 Planilha encontrada: Fornecedores
📋 Total de linhas: 50
✅ Fornecedores válidos: 48
```

### Estatísticas:
```
📈 Estatísticas: {
  total: 50,
  valid: 48,
  invalid: 2,
  successRate: 96
}
```

### Importação:
```
✅ Importado: Exemplo Fornecedor Ltda
✅ Importado: Outro Fornecedor ME
⚠️ Ignorado (inválido): Fornecedor Sem Nome ["Nome deve ter pelo menos 2 caracteres"]
✅ Importado: Distribuidora ABC
...
```

### Resultado:
```
==================================================
✅ Importação concluída!
   ✅ Importados: 48
   ❌ Erros: 0
   ⚠️  Ignorados: 2
==================================================
```

---

## ⚠️ Tratamento de Erros:

### Arquivo Inválido:
```
Arquivo inválido!

Apenas arquivos Excel (.xlsx, .xls) são aceitos.
```

### Fornecedor Inválido:
```
⚠️ Ignorado (inválido): Fornecedor X
Erros:
- Nome deve ter pelo menos 2 caracteres
- CNPJ/CPF inválido (deve ter 11 ou 14 dígitos)
- Email inválido
```

### Erro na Importação:
```
❌ Erro ao importar Fornecedor Y: [mensagem de erro]
```

---

## 🎨 Interface:

### Botões Adicionados:
1. **"Baixar Template"** 📥
   - Ícone: Download
   - Cor: Secundária
   - Gera arquivo Excel com exemplos

2. **"Importar Excel"** 📤
   - Ícone: Upload
   - Cor: Secundária
   - Abre seletor de arquivo
   - Desabilitado durante importação
   - Texto muda para "Importando..."

3. **"Novo Fornecedor"** ➕
   - Ícone: Plus
   - Cor: Primária
   - Abre modal de cadastro manual

---

## 📦 Dependências:

### Biblioteca Instalada:
```json
"xlsx": "^0.18.5"
```

### Instalar:
```bash
npm install
```

---

## 📁 Arquivos Criados:

1. ✅ `package.json` - Dependência `xlsx` adicionada
2. ✅ `src/utils/excelImporter.js` - Serviço de importação
3. ✅ `src/pages/Suppliers.jsx` - Botões e funções adicionados
4. ✅ `IMPORTACAO_FORNECEDORES_EXCEL.md` - Esta documentação

---

## 🎯 Benefícios:

### ⏱️ Economia de Tempo
- Importa centenas de fornecedores em segundos
- Elimina cadastro manual repetitivo

### 🎯 Validação Automática
- Verifica dados antes de importar
- Mostra erros claramente
- Ignora registros inválidos

### 🔄 Flexibilidade
- Aceita vários formatos de colunas
- Formatação automática de dados
- Template pronto para uso

### 📊 Transparência
- Logs detalhados no console
- Estatísticas de importação
- Confirmação antes de importar

---

## 🔮 Melhorias Futuras:

### 1. Atualização em Lote
- Importar e atualizar fornecedores existentes
- Comparar por CNPJ

### 2. Validação Avançada
- Verificar CNPJ na Receita Federal
- Validar CEP nos Correios

### 3. Importação de Outras Entidades
- Clientes
- Produtos
- Contas bancárias

### 4. Exportação
- Exportar fornecedores para Excel
- Gerar relatórios

---

## 💡 Dicas:

### Para Melhor Resultado:
1. Use o template fornecido
2. Preencha pelo menos o nome
3. Mantenha formatação consistente
4. Revise dados antes de importar
5. Verifique logs no console

### Formatação Recomendada:
- **CNPJ**: 00.000.000/0000-00
- **Telefone**: (00) 0000-0000 ou (00) 00000-0000
- **CEP**: 00000-000
- **Estado**: UF (PR, SP, RJ, etc.)

---

## 🎉 Teste Agora:

1. **Instale a dependência**:
   ```bash
   npm install
   ```

2. **Recarregue** (Ctrl+F5)

3. **Vá em Fornecedores**

4. **Clique em "Baixar Template"**

5. **Preencha a planilha**

6. **Clique em "Importar Excel"**

7. **Veja a mágica acontecer!** ✨

---

**📊 Importe seus fornecedores em massa e economize horas de trabalho!** 🚀
