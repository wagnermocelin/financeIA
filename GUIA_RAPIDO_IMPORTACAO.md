# 🚀 Guia Rápido: Importação de Fornecedores

## 📋 Passo a Passo Simples:

### 1️⃣ Instalar Dependência
```bash
npm install
```

### 2️⃣ Baixar Template
- Vá em **Fornecedores**
- Clique em **"Baixar Template"** 📥
- Arquivo `template_fornecedores.xlsx` será baixado

### 3️⃣ Preencher Planilha
Abra o template e preencha:

| Nome (obrigatório) | CNPJ | Email | Telefone | Cidade | Estado |
|-------------------|------|-------|----------|--------|--------|
| Fornecedor A | 12.345.678/0001-90 | contato@a.com | (41) 3333-4444 | Curitiba | PR |
| Fornecedor B | 98.765.432/0001-10 | vendas@b.com | (41) 9999-8888 | São Paulo | SP |

### 4️⃣ Importar
- Clique em **"Importar Excel"** 📤
- Selecione sua planilha
- Confirme
- ✅ Pronto!

---

## ⚡ Comandos Rápidos:

### Instalar:
```bash
npm install
```

### Executar:
```bash
npm run dev
```

---

## 📊 Colunas Aceitas:

### Obrigatórias:
- ✅ **Nome** (mínimo 2 caracteres)

### Opcionais:
- CNPJ/CPF (11 ou 14 dígitos)
- Email (formato válido)
- Telefone
- Endereço
- Cidade
- Estado (UF)
- CEP (8 dígitos)
- Contato
- Observações

---

## 🎯 Resultado Esperado:

```
📊 Total: 50
✅ Válidos: 48
❌ Inválidos: 2

Importação concluída!
✅ 48 fornecedores importados
⚠️ 2 ignorados (inválidos)
```

---

## 💡 Dica Importante:

**Apenas o NOME é obrigatório!**

Você pode importar uma planilha simples:

```
Nome
Fornecedor A
Fornecedor B
Fornecedor C
```

E depois completar os dados manualmente.

---

**🚀 Comece agora: `npm install` → Baixar Template → Importar!**
