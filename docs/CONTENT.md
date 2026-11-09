# Como editar o conteúdo

Todo texto visível da página está em `institucional/src/content/`. Não é preciso abrir nenhum
componente para trocar uma palavra, um número, um link ou uma pergunta do FAQ.

## Mapa: dobra → arquivo

| #   | Dobra                       | Arquivo                    | `id` da âncora |
| --- | --------------------------- | -------------------------- | -------------- |
| ..  | Cabeçalho e menu            | `navigation.ts`            | sem âncora     |
| 01  | Hero                        | `hero.ts`                  | `principal`    |
| 02  | Números                     | `stats.ts`                 | sem âncora     |
| 03  | Missão                      | `mission.ts`               | `missao`       |
| 04  | Conteúdo programático       | `curriculum.ts`            | `conteudo`     |
| 05  | Nosso processo              | `process.ts`               | `processo`     |
| 06  | Comunidade                  | `community.ts`             | `comunidade`   |
| 07  | Garantia                    | `guarantee.ts`             | sem âncora     |
| 08  | Iniciativas                 | `initiatives.ts`           | `iniciativas`  |
| 09  | Nossos ETFs                 | `etfs.ts`                  | `etfs`         |
| 10  | Acreditam no nosso trabalho | `endorsements.ts`          | sem âncora     |
| 11  | Convite e próxima turma     | `closing.ts`               | sem âncora     |
| 12  | Dúvidas frequentes          | `faq.ts`                   | `faq`          |
| ..  | Rodapé                      | `site.ts`, `navigation.ts` | sem âncora     |

Nome da instituição, links externos, WhatsApp, e-mail e URL canônica ficam todos
em `site.ts`.

**A ordem do menu é a ordem das dobras.** Ao mover uma dobra em
`institucional/src/App.tsx`, confira `primaryNav` em `navigation.ts`: um menu que lista
fora de ordem faz quem lê perder a noção de onde está.

---

## Tarefas comuns

### Atualizar os números institucionais

`institucional/src/content/stats.ts`. O valor é texto livre, então o formato brasileiro
(`+62.285`, `40 MI`) é preservado exatamente como escrito.

```ts
{ value: "+65.000", label: "Clientes ativos" },
```

Revisar a cada fechamento trimestral. Número institucional desatualizado é o
tipo de erro que custa credibilidade.

### Trocar um link

`institucional/src/content/site.ts`, objeto `links`. Um lugar só: o link aparece em vários
botões da página e todos leem daqui.

**A fonte de um endereço externo é a página da escola em produção**, o
`index.html` de `ProdutosAUVP/lp-auvp-escola-prod`, e não a dedução a partir do
nome. Houve aqui um conjunto inteiro de URLs no formato `auvp.com.br/<coisa>`,
inventado por analogia, e nenhuma delas existe: o checkout é um formulário
(`form.auvp.com.br/to/...`), a área do aluno é `aulasauvp.com.br`, os fundos
são `auvpetfs.com.br`, a comunidade é `comunidade.auvp.com.br` e os produtos da
consultoria ficam sob `auvpcapital.com.br`.

Quando um produto ou uma parceria não tiver endereço confirmado, deixe o `href`
de fora: `Product` e `Partnership` aceitam a ausência, e o cartão simplesmente
não vira link. Link institucional quebrado custa mais do que link
ausente, e âncora sem destino ainda por cima entra no caminho do Tab.

### Abrir uma turma nova

Edite os dados no singleton `LP_AUVP` do **Directus**. O webhook existente
avisa o n8n, que consulta os dados atuais e atualiza `dados/turma.json` na
`main` de `auvp/lp-auvp`. O commit aciona o deploy existente das duas páginas.
Eventos repetidos não criam commits se os três valores continuarem iguais.

```json
{
  "proxima_turma": "2026-11-29T19:00:00-03:00",
  "numero_alunos": 65269,
  "numero_turma": 63
}
```

`proxima_turma` é o início da turma, com fuso explícito. Datas recebidas do
Directus sem fuso são tratadas como horário de Brasília (`-03:00`).
`numero_turma` precisa ser inteiro positivo; `numero_alunos`, inteiro não negativo.
Valores inválidos interrompem a atualização e o build, conservando o site publicado.

Home e institucional incorporam esse JSON ao build: não consultam o n8n no
navegador. O institucional também usa `numero_alunos` no indicador de investidores
formados. Seu contador desaparece quando a data passa; o da home para em zero.

Em emergência, edite o mesmo JSON por PR. A próxima alteração no Directus
volta a sincronizar os valores. Confira as execuções do n8n e o deploy do GitHub
antes de considerar uma atualização publicada. A alteração só aparece após o deploy.

### Adicionar uma pergunta ao FAQ

`institucional/src/content/faq.ts`, dentro da categoria certa. A pergunta entra
automaticamente no dado estruturado de `FAQPage` que o Google lê, então:

- resposta em texto puro, **sem HTML**;
- uma resposta completa em si mesma, sem "como dito acima";
- sem promessa de resultado financeiro.

### Adicionar um módulo ao conteúdo programático

`institucional/src/content/curriculum.ts`. Antes, cadastre o ícone em
`institucional/src/components/ui/ModuleIcon.tsx` e adicione a chave ao tipo `Module["icon"]`,
o TypeScript recusa uma chave que não exista.

Os ícones são traço de 1px em `viewBox` 32×32, sem preenchimento. Ver
`docs/BRAND.md`.

### Adicionar um produto ou uma parceria

`institucional/src/content/initiatives.ts`. Produtos entram na grade; parcerias entram nas
faixas horizontais e **alternam o lado da foto automaticamente** pelo índice,
não é preciso configurar nada.

O `href` é opcional nos dois. Sem endereço confirmado, o cartão perde o "Saiba
mais" e deixa de ser clicável, o que é o comportamento desejado: ver "Trocar um
link".

Uma parceria que ainda vai ter página, e não uma que perdeu a sua, leva
`comingSoon: true` em vez do `href`: em lugar do link aparece um aviso de "em
breve", que é balão no hover onde há ponteiro e texto fixo em tela de toque.
Não é link nem botão, porque não há para onde ir.

### Preencher uma foto pendente

Ver `docs/ASSETS.md`. Em resumo: coloque o arquivo em `institucional/public/images/` e troque
`src: null` pelo caminho.

---

## Regras de escrita

A página fala como instituição de ensino, não como campanha.

**Tom**

- Afirmativo e sóbrio. Sem superlativo que não seja verificável.
- Terceira pessoa para a instituição ("a AUVP forma"), segunda para o leitor
  ("você não está sozinho"). Nunca as duas na mesma frase.
- Frase curta. Se precisar de vírgula três vezes, vira duas frases.

**Pontuação de título**
Títulos de dobra levam ponto final: "Conteúdo programático.", "Nosso processo.",
"Nossos ETFs." É uma escolha deliberada: o ponto dá o tom declarativo de índice
de relatório. Manter a consistência.

**Números**
Formato brasileiro: `62.285`, não `62,285`. Milhão abreviado em caixa alta sem
ponto: `40 MI`.

**O que nunca escrever**

- Promessa de rentabilidade, ganho ou prazo de retorno.
- "Garantido", "certeza", "sem risco" em contexto de investimento.
- Urgência artificial: "últimas vagas", "só hoje", "restam X".
- Emoji.

O rodapé traz o aviso de que o conteúdo é educacional e de que rentabilidade
passada não garante rentabilidade futura. Ele não é decorativo: qualquer texto
novo precisa continuar compatível com ele.

---

## Depois de editar

```bash
npm run check   # tipos, lint e formatação
npm run dev     # confere na tela
```

O `check` reprova texto que quebre o tipo. Por exemplo, um módulo com ícone
inexistente ou um campo obrigatório faltando. É proposital: erro de conteúdo é
pego antes do deploy, não depois.
