# 📋 Guia de Versionamento do Sistema

## Versão Atual: 1.6.0

Este documento descreve como gerenciar e atualizar a versão do sistema CRM Imóbia.

---

## 🎯 Onde a Versão Aparece

A versão do sistema é exibida no **rodapé do menu lateral**, logo abaixo do botão "Sair do Sistema":

```
┌─────────────────────┐
│ 🚪 Sair do Sistema  │
├─────────────────────┤
│ ℹ️  v1.6.0          │
│ Build: 20/12/24     │
└─────────────────────┘
```

---

## 🔄 Como Atualizar a Versão

### Método 1: Comandos NPM (RECOMENDADO) 🚀

Use os comandos integrados do NPM que seguem o padrão [Semantic Versioning](https://semver.org/):

```bash
# Correção de bug (1.6.0 → 1.6.1)
npm version patch

# Nova funcionalidade (1.6.0 → 1.7.0)
npm version minor

# Breaking change (1.6.0 → 2.0.0)
npm version major
```

**Vantagens:**
- ✅ Atualiza automaticamente o `package.json`
- ✅ Cria commit e tag no Git automaticamente
- ✅ Segue o padrão SemVer corretamente
- ✅ Previne erros de digitação

### Método 2: Scripts Personalizados ⚡

Criamos scripts npm customizados para facilitar ainda mais:

```bash
# Lançar nova versão patch com changelog
npm run release:patch

# Lançar nova versão minor com changelog
npm run release:minor

# Lançar nova versão major com changelog
npm run release:major
```

### Método 3: Versão Específica

Para definir uma versão específica:

```bash
npm version 2.0.0
```

### Método 4: Manual ✏️

Edite diretamente o arquivo `package.json`:

1. Abra `package.json`
2. Localize: `"version": "1.6.0",`
3. Altere para a nova versão: `"version": "1.7.0",`
4. Salve e recompile

---

## 📊 Entendendo o Semantic Versioning

O formato é: **MAJOR.MINOR.PATCH** (exemplo: `1.6.0`)

```
1.6.0
│ │ │
│ │ └─ PATCH: Correções de bugs (compatível)
│ └─── MINOR: Novas funcionalidades (compatível)
└───── MAJOR: Mudanças incompatíveis
```

### Quando usar cada tipo:

| Tipo | Quando Usar | Exemplo |
|------|-------------|---------|
| **PATCH** | Correção de bugs, ajustes menores | Corrigir erro de validação |
| **MINOR** | Novas funcionalidades compatíveis | Adicionar novo relatório |
| **MAJOR** | Breaking changes, grandes mudanças | Refatorar estrutura de dados |

---

## 🔮 Exemplos Práticos

### Cenário 1: Correção de Bug
```bash
# Situação: Corrigiu um bug no formulário de leads
# Versão atual: 1.6.0

npm run release:patch
# Nova versão: 1.6.1
```

### Cenário 2: Nova Funcionalidade
```bash
# Situação: Adicionou novo dashboard de análises
# Versão atual: 1.6.0

npm run release:minor
# Nova versão: 1.7.0
```

### Cenário 3: Breaking Change
```bash
# Situação: Mudou estrutura da API de autenticação
# Versão atual: 1.6.0

npm run release:major
# Nova versão: 2.0.0
```

---

## 🧪 Versões Pre-release

Para versões de desenvolvimento ou testes:

```bash
# Versão beta
npm version prerelease --preid=beta
# Resultado: 1.6.1-beta.0

# Versão alpha
npm version prerelease --preid=alpha
# Resultado: 1.6.1-alpha.0

# Release Candidate
npm version prerelease --preid=rc
# Resultado: 1.6.1-rc.0
```

---

## 📝 Changelog

Mantenha um histórico de mudanças no arquivo `CHANGELOG.md`:

1. Toda vez que lançar uma nova versão, documente as mudanças
2. Use as categorias: Added, Changed, Fixed, Removed
3. Use os scripts `release:*` que atualizam o changelog automaticamente

Formato sugerido:
```markdown
## [1.6.0] - 2024-12-20

### Added
- Indicador de versão no rodapé do menu

### Fixed
- Correção no filtro de leads

### Changed
- Melhorias na interface do pipeline
```

---

## 🎯 Workflow Recomendado

### Para Desenvolvimento Diário:
1. Faça suas alterações normalmente
2. Teste localmente com `npm run dev`
3. **NÃO** atualize a versão ainda

### Para Releases:
1. Complete todas as funcionalidades planejadas
2. Teste tudo minuciosamente
3. Decida o tipo de versão (patch/minor/major)
4. Execute o comando apropriado:
   ```bash
   npm run release:minor
   ```
5. O script irá:
   - Atualizar a versão no `package.json`
   - Solicitar descrição das mudanças
   - Atualizar o `CHANGELOG.md`
   - Criar commit e tag no Git
6. Faça push:
   ```bash
   git push
   git push --tags
   ```

---

## 🔧 Configurações Importantes

### Desabilitar Git Auto-commit (Opcional)

Se preferir fazer commit manual:
```bash
npm version patch --no-git-tag-version
```

### Ver Versão Atual

```bash
npm version
```

---

## 📅 Data de Build

A data de build é atualizada **automaticamente** toda vez que você:
- Reinicia o servidor de desenvolvimento (`npm run dev`)
- Faz o build de produção (`npm run build`)

A data é gerada no formato brasileiro: `dd/mm/aa`

---

## 🚀 Build de Produção

Quando fizer o build para produção:

```bash
npm run build
```

A versão e data de build serão incluídas automaticamente no bundle final.

---

## 📞 Suporte

Se tiver dúvidas sobre versionamento:
1. Consulte este guia
2. Veja o [Semantic Versioning](https://semver.org/)
3. Consulte a documentação do NPM: `npm help version`

---

**Última atualização:** 20/12/2024
