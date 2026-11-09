# Dados estáticos de turma — plano de implementação

> **For agentic workers:** Use superpowers:executing-plans para executar as tarefas nesta sessão.

**Goal:** eliminar consultas de turma no navegador e publicar mudanças do Directus por commit do n8n.

**Architecture:** um JSON compartilhado alimenta o HTML da Escola e o conteúdo React do institucional. O n8n consulta Directus e GitHub e grava o JSON apenas quando os valores mudam.

**Tech Stack:** Vite, React, Node.js, n8n e GitHub Contents API.

**Spec:** `docs/superpowers/specs/2026-11-09-turma-estatica-design.md`.

## Global Constraints

- Preservar o deploy existente e o webhook de consulta atual.
- Não inserir credenciais no Git nem no navegador.
- Usar horário de Brasília quando o Directus não informar fuso.
- Não ativar escrita automática antes de os consumidores chegarem à main.

## Review Focus

- Datas inexistentes e campos vazios devem impedir publicação.
- Eventos repetidos não devem criar commits.
- Conflitos devem reler as fontes e ter tentativas limitadas.
- Home e institucional devem exibir o mesmo prazo fora do fuso brasileiro.
- O HTML deve conter os números atuais mesmo sem JavaScript.

### Task 1: JSON compartilhado e consumidores

- [x] Escrever testes de validação e transformação de HTML em `scripts/turma.test.mjs` e observar falha.
- [x] Implementar `scripts/lib/turma.mjs`, `dados/turma.json` e plugin HTML da Escola.
- [x] Remover fetch do contador da Escola e do institucional, importando o JSON.
- [x] Executar testes, tipos, lint e build; verificar HTML e assets gerados.

### Task 2: Atualização pelo n8n

- [x] Testar preparação de commits sem mudanças, dados inválidos e conflitos.
- [x] Preparar nós GitHub GET → Directus estrito → validação/comparação → GitHub PUT com SHA.
- [x] Validar o workflow e salvar rascunho sem alterar a versão ativa antes da publicação do código.
- [x] Documentar credencial, ativação e recuperação em `docs/CONTENT.md` e `docs/DEPLOY.md`.
- [x] Executar `npm run check`, `npm run build` e `npm run edge:build`; revisar o diff.

## Evidências e publicação pendente

- `npm run check`: 79 testes da raiz e 7 da Escola, sem falhas; tipos, lint e formatação aprovados.
- Build completo e edge build aprovados. HTML das duas páginas contém 65.269;
  a home contém turma 63; bundles não contêm o webhook de turma.
- SDK dos nós validado; testes n8n com pin data: alteração `8189175`,
  nenhuma mudança `8189189`, limite de conflitos `8189208` (erro esperado).
- Revisão independente sem achados funcionais.
- Pedido adicional: UUID GET rotacionado no rascunho e consulta interna atualizada;
  novo endereço não foi incluído no Git. Versão ativa anterior preservada.
- Ativação depende do merge e deploy e da seleção manual da credencial GitHub
  no nó de escrita, devido à recusa do conector MCP para `httpBearerAuth`.
