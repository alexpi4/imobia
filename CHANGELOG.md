# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.6.0] - 2024-12-20

### Added
- Sistema de versionamento visível no rodapé do menu lateral
- Indicador de versão com ícone Info
- Data de build automática em formato brasileiro (dd/mm/aa)
- Documentação completa de versionamento (VERSIONING.md)
- Scripts NPM personalizados para facilitar releases
- Changelog estruturado para rastreamento de mudanças

### Changed
- Rodapé do sidebar agora exibe informações de versão e build
- Menu lateral adaptado para mostrar versão tanto expandido quanto colapsado

### Technical
- Configurado Vite para injetar versão do package.json como constante global
- Criado arquivo vite-env.d.ts com declarações TypeScript
- Versão e data de build são compiladas em tempo de build

---

## [Unreleased]

### Planejado
- Nenhuma funcionalidade planejada no momento

---

## Como Usar Este Changelog

### Categorias:
- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de segurança

### Exemplo de Entrada:
```markdown
## [1.7.0] - 2024-12-21

### Added
- Nova página de relatórios avançados
- Exportação de leads em formato Excel

### Fixed
- Correção no filtro de data do dashboard
- Ajuste no cálculo de conversão de leads

### Changed
- Melhorado performance da listagem de leads
```
