# AUVP · Páginas

Repositório das páginas da **AUVP Escola de Investimentos**, publicadas juntas
num único site estático. Homologação: **<https://escola-homolog.vercel.app/>**.
Repositório: [auvp/lp-escola-homolog](https://github.com/auvp/lp-escola-homolog).

| Endereço                                                                                                | Pasta                              | O que é                                                                                   |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| [/](https://escola-homolog.vercel.app/)                                                                 | `escola/`                          | LP da Escola (Vite + Tailwind 3). Em teste A/B com a institucional                        |
| [/institucional/](https://escola-homolog.vercel.app/institucional/)                                     | `institucional/`                   | Página institucional (Vite + React)                                                       |
| [/auvp-sempre/](https://escola-homolog.vercel.app/auvp-sempre/)                                         | `auvp-sempre/`                     | AUVP Sempre                                                                               |
| [/auvp-sempre/popup/](https://escola-homolog.vercel.app/auvp-sempre/popup/)                             | `auvp-sempre/popup/`               | Prévia do popup da AUVP Sempre que chama para a Escola (sem indexação, sem GTM)           |
| [/auvp-sempre/ja-assinante/](https://escola-homolog.vercel.app/auvp-sempre/ja-assinante/)               | `auvp-sempre/ja-assinante/`        | Aviso para quem já tem a AUVP Sempre, com link para a Minha AUVP (sem indexação, sem GTM) |
| [/auvp-internacional/](https://escola-homolog.vercel.app/auvp-internacional/)                           | `auvp-internacional/`              | AUVP Internacional                                                                        |
| [/nosso-processo/](https://escola-homolog.vercel.app/nosso-processo/)                                   | `nosso-processo/`                  | Nosso processo                                                                            |
| [/quem-somos/](https://escola-homolog.vercel.app/quem-somos/)                                           | `quem-somos/`                      | Quem somos                                                                                |
| [/obrigado-aprovado/](https://escola-homolog.vercel.app/obrigado-aprovado/)                             | `obrigado-aprovado/`               | Obrigado (aprovado)                                                                       |
| [/obrigado-auvp-analitica/](https://escola-homolog.vercel.app/obrigado-auvp-analitica/)                 | `obrigado-auvp-analitica/`         | Obrigado AUVP Analítica                                                                   |
| [/resolva-aqui/](https://escola-homolog.vercel.app/resolva-aqui/)                                       | `resolva-aqui/`                    | Resolva aqui                                                                              |
| [/termos-de-uso/](https://escola-homolog.vercel.app/termos-de-uso/)                                     | `termos-de-uso/`                   | Termos de uso                                                                             |
| [/politica-de-privacidade/](https://escola-homolog.vercel.app/politica-de-privacidade/)                 | `politica-de-privacidade/`         | Política de privacidade                                                                   |
| [/wpp/](https://escola-homolog.vercel.app/wpp/)                                                         | `escola/`                          | Cópia da LP da Escola: em dia útil, os botões do formulário vão para o WhatsApp           |
| [/a/100-mil-reais/](https://escola-homolog.vercel.app/a/100-mil-reais/)                                 | `a/100-mil-reais/`                 | Aula em vídeo: Por que sua vida muda depois de juntar R$ 100 mil                          |
| [/a/6-mil-por-mes/](https://escola-homolog.vercel.app/a/6-mil-por-mes/)                                 | `a/6-mil-por-mes/`                 | Aula em vídeo: Como receber R$ 6.000 por mês com investimentos                            |
| [/a/aula-etf/](https://escola-homolog.vercel.app/a/aula-etf/)                                           | `a/aula-etf/`                      | Aula em vídeo: Aula ETF                                                                   |
| [/a/aula-investimento-conservador/](https://escola-homolog.vercel.app/a/aula-investimento-conservador/) | `a/aula-investimento-conservador/` | Aula em vídeo: Aula investimento conservador                                              |
| [/a/classe-media-alta/](https://escola-homolog.vercel.app/a/classe-media-alta/)                         | `a/classe-media-alta/`             | Aula em vídeo: A classe média alta está quebrada                                          |
| [/a/hacker-social/](https://escola-homolog.vercel.app/a/hacker-social/)                                 | `a/hacker-social/`                 | Aula em vídeo: Como ser um hacker social                                                  |
| [/a/primeira-carteira/](https://escola-homolog.vercel.app/a/primeira-carteira/)                         | `a/primeira-carteira/`             | Aula em vídeo: Começando sua primeira carteira                                            |
| [/a/reserva-de-emergencia/](https://escola-homolog.vercel.app/a/reserva-de-emergencia/)                 | `a/reserva-de-emergencia/`         | Aula em vídeo: Onde deixar sua reserva de emergência                                      |
| [/a/tesouro-direto/](https://escola-homolog.vercel.app/a/tesouro-direto/)                               | `a/tesouro-direto/`                | Aula em vídeo: Aula completa sobre Tesouro Direto                                         |

A raiz é a LP da Escola, que antes ficava em `/escola/`; links antigos para
`/escola/` redirecionam para `/`. Na raiz roda o teste A/B
`escola-institucional`: metade das pessoas vê a Escola e metade a institucional.
Para ver uma versão específica, use [/?ab=a](https://escola-homolog.vercel.app/?ab=a) (Escola) ou
[/?ab=b](https://escola-homolog.vercel.app/?ab=b) (institucional). Ver [docs/AB-TESTING.md](docs/AB-TESTING.md).

As páginas de `/auvp-sempre/` em diante são HTML puro, clonadas do WordPress
(auvp.com.br). Exceção: `/wpp/` não tem pasta própria; o build copia a LP da
Escola para lá, e o `escola/src/wpp-routing.js` troca os links do formulário
pelo WhatsApp de segunda a sexta, fora de feriados nacionais. As aulas de `/a/`
são páginas de vídeo do VTurb, sem indexação.

O resto deste README trata da página institucional. A LP da Escola é HTML
editado direto em `escola/index.html`; os masters das imagens dela estão em
`escola/imagens-originais/`.

A página da AUVP Sempre e as demais páginas clonadas do WordPress
(auvp.com.br) são HTML puro, sem build: cada uma tem `index.html`, `style.css`,
às vezes `script.js`, e as imagens em `img/`. O build só copia as pastas. As
páginas vindas do WordPress compartilham cabeçalho, rodapé, logos e a faixa de
título por `comum/` (`base.css`, `site.js`, `img/`).

**Testes A/B.** `experiments.json` lista os testes ligados; a versão B de uma
página fica em `b.html`, na mesma pasta. Na Vercel, `middleware.js` divide o
tráfego e guarda a versão de cada pessoa no cookie `ab_<id>`. O primeiro teste,
`escola-institucional`, põe a LP da Escola (A) contra a institucional (B) na
raiz, 50/50. Ver **[docs/AB-TESTING.md](docs/AB-TESTING.md)**.

## Página institucional

Página institucional da **AUVP Escola de Investimentos**, construída para
posicionar a instituição como uma escola clássica e sólida: serifa, régua fina,
espaço em branco generoso e as três cores da escola, amarelo, branco e preto.

As referências que guiaram o desenho estão em [docs/BRAND.md](docs/BRAND.md):
SOAS, Lionheart Education, Oxford, Higher Life Foundation, Harvard e Penn.

Não é uma landing page de campanha. É a página que responde "o que é a AUVP" para
quem chega pela primeira vez, e que sustenta autoridade para quem já conhece.

## Começando

Requer Node 22 (ver `.nvmrc`).

```bash
npm install            # instala as duas páginas (npm workspaces)
npm run dev            # institucional em http://localhost:5173
npm run dev:escola     # Escola em http://localhost:5173
```

## Comandos

| Comando              | O que faz                                               |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Desenvolvimento do institucional                        |
| `npm run dev:escola` | Desenvolvimento da Escola                               |
| `npm run build`      | Monta o site completo em `dist/`                        |
| `npm run preview`    | Serve `dist/` em http://localhost:4173                  |
| `npm run typecheck`  | TypeScript, sem emitir                                  |
| `npm run lint`       | ESLint                                                  |
| `npm test`           | Testes da Escola (`node --test`)                        |
| `npm run format`     | Aplica o Prettier                                       |
| `npm run check`      | Tipos, lint, formatação e testes, o mesmo que a CI roda |

## Estrutura da página

Onze dobras, na ordem do roteiro aprovado:

| #   | Dobra                       | Argumento                        |
| --- | --------------------------- | -------------------------------- |
| 01  | Hero                        | Posicionamento e promessa        |
| 02  | Números                     | Escala verificável               |
| 03  | Missão                      | Por que a instituição existe     |
| 04  | Conteúdo programático       | O que se aprende                 |
| 05  | Nosso processo              | Como se aprende, em três etapas  |
| 06  | Comunidade                  | Não se estuda sozinho            |
| 07  | Garantia                    | Risco assumido pela instituição  |
| 08  | Iniciativas                 | O ecossistema em volta da escola |
| 09  | Nossos ETFs                 | Método aplicado em produto       |
| 10  | Acreditam no nosso trabalho | Validação de terceiros           |
| 11  | Dúvidas frequentes          | Transparência                    |

## Onde mexer

**Trocar um texto, um número, um link ou uma pergunta do FAQ** → `institucional/src/content/`.
Nenhum componente precisa ser aberto. Ver **[docs/CONTENT.md](docs/CONTENT.md)**.

**Adicionar ou recortar uma foto** → ver **[docs/ASSETS.md](docs/ASSETS.md)**, que
traz o diagnóstico do acervo, a direção de recorte e o briefing do que ainda
precisa ser produzido.

**Mexer em cor, tipografia ou espaçamento** → tokens em `institucional/src/globals.css`,
com o racional em **[docs/BRAND.md](docs/BRAND.md)**.

## Documentação

| Documento                                      | Assunto                                                       |
| ---------------------------------------------- | ------------------------------------------------------------- |
| [docs/BRAND.md](docs/BRAND.md)                 | Linguagem visual: cor, tipografia, movimento, o que não fazer |
| [docs/CONTENT.md](docs/CONTENT.md)             | Como editar o conteúdo e regras de escrita                    |
| [docs/ASSETS.md](docs/ASSETS.md)               | Diagnóstico das fotos, recortes e briefing de produção        |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   | Stack, estrutura e decisões técnicas                          |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Compromissos de acessibilidade e como verificar               |
| [docs/DEPLOY.md](docs/DEPLOY.md)               | Publicação e checklist de go-live                             |
| [docs/AB-TESTING.md](docs/AB-TESTING.md)       | Testes A/B: como ligar, ver e encerrar                        |
| [CONTRIBUTING.md](CONTRIBUTING.md)             | Fluxo de trabalho, branches e revisão                         |
| [CHANGELOG.md](CHANGELOG.md)                   | Histórico de mudanças                                         |

## Publicação

O mesmo `dist/` serve dois destinos:

- **GitHub Pages**, a cada push na `main`, pelo workflow
  `.github/workflows/deploy.yml`.
  **<https://auvp.github.io/lp-escola-homolog/>**
- **Vercel**, configurada por `vercel.json`: basta importar o repositório.

No Pages o site é servido sob subcaminho, então o build recebe o prefixo do
próprio GitHub. Nada fica fixado no código, e a migração para domínio próprio não
exige mudança de código. Ver [docs/DEPLOY.md](docs/DEPLOY.md), inclusive para
testar o build de produção localmente antes de publicar (o `npm run dev` roda na
raiz e não pega erro de caminho).

## Estado atual

A página está completa e navegável em desktop e mobile. **Todas as fotografias
estão mockadas** e nenhum logo de apoiador existe ainda. Cada lugar que receberá
imagem exibe uma reserva editorial com o briefing do que precisa ser produzido,
em vez de quebrar o layout. A lista completa, com enquadramento e proporção de
cada foto, está em [docs/ASSETS.md](docs/ASSETS.md).

## Stack

Vite 8 · React 19 com pré-renderização · TypeScript · Tailwind CSS 4 · Lenis ·
Sentient e Inter. Página inteiramente estática: sem banco, sem API, sem
formulário.

O movimento (rolagem com inércia, paralaxe, contagem dos números, revelações na
rolagem) vive em `institucional/src/components/motion/` e desliga por inteiro sob
`prefers-reduced-motion`. Ver [docs/BRAND.md](docs/BRAND.md).
