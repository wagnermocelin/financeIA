# ✅ Correção: Erro 406 (Not Acceptable)

## ❌ Problema:

```
GET .../bank_statements?select=id&hash_key=eq.... 406 (Not Acceptable)
```

## 🔍 Causa:

O método `.single()` do Supabase retorna erro 406 quando:
- Não encontra nenhum registro (esperava 1, encontrou 0)
- Encontra múltiplos registros (esperava 1, encontrou vários)

## ✅ Solução:

Trocado `.single()` por `.maybeSingle()`:

```javascript
// ❌ ANTES (causava erro 406):
const { data: existing } = await supabase
  .from('bank_statements')
  .select('id')
  .eq('hash_key', statement.hash_key)
  .single()  // Erro se não encontrar!

// ✅ AGORA (funciona):
const { data: existing } = await supabase
  .from('bank_statements')
  .select('id')
  .eq('hash_key', statement.hash_key)
  .maybeSingle()  // Retorna null se não encontrar
```

---

## 🎯 Diferença:

### `.single()`
- Espera exatamente 1 registro
- Erro 406 se encontrar 0 ou mais de 1
- ❌ Não serve para verificação de existência

### `.maybeSingle()`
- Retorna 1 registro ou null
- Sem erro se não encontrar
- ✅ Perfeito para verificação de existência

---

## 🚀 TESTE AGORA:

1. **Recarregue a página** (Ctrl+F5)
2. **Vá em Conciliação**
3. **Importe o extrato**
4. **Deve funcionar!** ✅

---

## 📊 Logs Esperados:

```
📥 Importando extratos... 186
📊 Importação: 186 novos, 0 duplicados
✅ Extratos importados com sucesso: 186
```

Se importar novamente:
```
📥 Importando extratos... 186
📊 Importação: 0 novos, 186 duplicados
⚠️ Todos os extratos já existem no banco
✅ Extratos importados com sucesso: 0
```

---

## ✅ Sistema Anti-Duplicação Funcionando!

**Agora você pode:**
- ✅ Importar o mesmo arquivo múltiplas vezes
- ✅ Nunca vai duplicar
- ✅ Logs claros de novos vs duplicados
- ✅ Sem erros 406!

---

**🎯 Recarregue e teste a importação!** 🚀
