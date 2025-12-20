# 🚀 Guia Rápido de Versionamento

## Ver Versão Atual

```bash
npm run version:check
```

---

## Lançar Nova Versão

### Correção de Bug (Patch)
```bash
npm run release:patch
# 1.6.0 → 1.6.1
```

### Nova Funcionalidade (Minor)
```bash
npm run release:minor
# 1.6.0 → 1.7.0
```

### Breaking Change (Major)
```bash
npm run release:major
# 1.6.0 → 2.0.0
```

---

## Após Atualizar a Versão

```bash
# Enviar para o repositório
git push
git push --tags
```

---

## 📚 Documentação Completa

Para informações detalhadas, consulte: [VERSIONING.md](./VERSIONING.md)

## 📝 Histórico de Mudanças

Para ver o histórico completo de versões: [CHANGELOG.md](./CHANGELOG.md)
