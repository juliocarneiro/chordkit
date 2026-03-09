# Como testar localmente e publicar no npm

## 1. Testar localmente (sem publicar)

### Opção A: `npm link` (recomendado)

Simula a instalação do pacote no seu projeto local sem precisar publicar nada.

```bash
# 1. Na pasta do chordkit, faça o build e crie o link global
cd packages/chordkit
npm run build
npm link

# 2. Faça o mesmo pro dictionary (opcional)
cd ../dictionary
npm run build
npm link

# 3. No SEU PROJETO que vai usar a lib, linke o pacote
cd /caminho/do/seu/projeto
npm link chordkit
npm link @chordkit/dictionary   # se quiser o dicionário também
```

Agora no seu projeto você pode importar normalmente:

```typescript
import { ChordChart } from 'chordkit'
```

Qualquer mudança que você fizer no chordkit, basta rodar `npm run build` de novo na pasta dele e o link atualiza automaticamente.

Para desfazer o link quando não precisar mais:

```bash
# No seu projeto
npm unlink chordkit
npm unlink @chordkit/dictionary

# Na pasta do chordkit (limpa o link global)
cd packages/chordkit && npm unlink -g
cd packages/dictionary && npm unlink -g
```

### Opção B: Instalar direto do caminho local

Mais simples, sem link global:

```bash
# No seu projeto, aponte pro caminho absoluto ou relativo
npm install ../lib-acordes/packages/chordkit
npm install ../lib-acordes/packages/dictionary
```

### Opção C: `npm pack` (simula o pacote real do npm)

Gera o `.tgz` exatamente como o npm faria, ideal pra testar se o `files` e `exports` estão corretos:

```bash
# Na pasta do chordkit
cd packages/chordkit
npm run build
npm pack
# Gera: chordkit-1.0.0.tgz

# No seu projeto
npm install /caminho/completo/para/chordkit-1.0.0.tgz
```

---

## 2. Publicar no npm

### Pré-requisitos

1. Ter uma conta no npm: https://www.npmjs.com/signup
2. Estar logado no terminal:

```bash
npm login
# Vai pedir usuário, senha e email
# Depois confirma com OTP se tiver 2FA ativado
```

3. Verificar se está logado:

```bash
npm whoami
# Deve mostrar seu username
```

### Publicar o pacote core (`chordkit`)

```bash
# 1. Build
cd packages/chordkit
npm run build

# 2. Verificar o que vai ser publicado
npm pack --dry-run
# Confere se só tem a pasta dist/ e os arquivos certos

# 3. Publicar
npm publish
```

### Publicar o dicionário (`@chordkit/dictionary`)

Como usa escopo (`@chordkit/`), precisa criar a organização no npm primeiro:

1. Acesse https://www.npmjs.com/org/create
2. Crie a org com o nome `chordkit`
3. Depois publique:

```bash
cd packages/dictionary
npm run build

# Pacotes com escopo são privados por padrão, use --access public
npm publish --access public
```

### Publicar novas versões

Antes de cada nova publicação, atualize a versão:

```bash
# Patch (1.0.0 -> 1.0.1) - correções pequenas
npm version patch

# Minor (1.0.0 -> 1.1.0) - novas features sem quebrar compatibilidade
npm version minor

# Major (1.0.0 -> 2.0.0) - mudanças que quebram a API
npm version major
```

Depois:

```bash
npm run build
npm publish
```

---

## 3. Checklist antes de publicar

- [ ] Rodar `npm test` na raiz e confirmar que todos os testes passam
- [ ] Rodar `npm run build` nos dois pacotes
- [ ] Confirmar que `npm pack --dry-run` mostra só os arquivos da `dist/`
- [ ] Testar localmente com `npm link` ou `npm pack` no seu projeto real
- [ ] Verificar que o nome `chordkit` está disponível: `npm view chordkit`
  - Se retornar 404, o nome está livre
- [ ] Verificar que `@chordkit/dictionary` está disponível
- [ ] Preencher os campos `author` e `repository` no `package.json` (opcional mas recomendado)

---

## 4. Campos opcionais recomendados no package.json

Antes de publicar, é bom adicionar no `package.json` de cada pacote:

```json
{
  "author": "Seu Nome <seu@email.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/seu-usuario/chordkit"
  },
  "homepage": "https://github.com/seu-usuario/chordkit#readme",
  "bugs": {
    "url": "https://github.com/seu-usuario/chordkit/issues"
  }
}
```

---

## Resumo rápido

| O que quer fazer | Comando |
|---|---|
| Testar local (link) | `npm link` + `npm link chordkit` |
| Testar local (pack) | `npm pack` + `npm install ./chordkit-1.0.0.tgz` |
| Publicar core | `npm run build && npm publish` |
| Publicar dictionary | `npm run build && npm publish --access public` |
| Atualizar versão | `npm version patch/minor/major` |
