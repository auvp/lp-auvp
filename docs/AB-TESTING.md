# Testes A/B

Para o time de produto. Tudo é feito por PR: você edita arquivos, abre o PR e, quando ele é aprovado e entra na `main`, o site é publicado sozinho.

## Teste ligado agora

| Teste                  | Página | Versão A                 | Versão B                         | Divisão | Cookie                             |
| ---------------------- | ------ | ------------------------ | -------------------------------- | ------- | ---------------------------------- |
| `escola-institucional` | `/`    | LP da Escola (`escola/`) | Institucional (`institucional/`) | 50/50   | `ab_escola-institucional`, 30 dias |

Para ver cada uma: `/?ab=a` e `/?ab=b`. A institucional continua também no endereço dela, `/institucional/`, fora do teste.

## Como funciona

- A página original (`auvp-sempre/index.html`, por exemplo) é a **versão A**.
- A **versão B** é uma cópia dela na mesma pasta, chamada `b.html` (`auvp-sempre/b.html`). Na página inicial (a LP da Escola), a B fica em `/b.html`.
- `experiments.json`, na raiz do projeto, é a lista dos testes ligados.
- Quem entra em `/auvp-sempre/` recebe A ou B, conforme a divisão do teste. A mesma pessoa continua vendo a mesma versão por 30 dias, ou o que estiver em `cookieDays` (um cookie `ab_<id-do-teste>` guarda a escolha).

Cada teste no `experiments.json` tem:

```json
{
  "id": "sempre-titulo",
  "page": "/auvp-sempre/",
  "split": { "a": 50, "b": 50 },
  "cookieDays": 14
}
```

- `id`: nome do teste (letras minúsculas, números e hífen).
- `page`: a página testada, começando e terminando com `/`.
- `split`: quantos % veem cada versão, em números inteiros. Precisam somar 100.
- `cookieDays` (opcional): por quantos dias a pessoa continua vendo a mesma versão. De 1 a 365; se não informar, são 30.

Regra: **um teste por página**.

## Receitas

### Iniciar um teste

1. Copie `<página>/index.html` para `<página>/b.html`.
2. Edite o `b.html` com as mudanças que quer testar. **Não mexa no `<link rel="canonical">`**: ele precisa continuar igual ao do `index.html`.
3. Acrescente o teste em `experiments.json` (dentro de `"tests": [ ... ]`).
4. Abra o PR. O sistema confere se está tudo certo e avisa o que corrigir.

Isso vale para as páginas em HTML puro (`auvp-sempre/`, `auvp-internacional/`, `nosso-processo/` e as demais vindas do WordPress). A Escola e a institucional são montadas pelo Vite: para testar algo nelas, veja [Versão B que é outra página](#versão-b-que-é-outra-página) ou peça ajuda ao time de desenvolvimento.

### Encerrar um teste

1. Se a **B venceu**: copie o conteúdo do `b.html` para o `index.html`.
2. Apague o `b.html`.
3. Apague o teste do `experiments.json`.
4. Abra o PR. Depois do merge, todo mundo vê uma versão só.

O sistema não deixa passar um `b.html` sem teste correspondente, nem um teste sem `b.html`.

### Publicar sem teste

Edite a página normalmente. Não mexa no `experiments.json`.

### Pausar um teste

Não existe pausa: o jeito é encerrar o teste (apagar o teste do `experiments.json` e o `b.html`). Todo mundo volta a ver a versão A. A B continua no histórico do git, se quiserem retomar depois.

## Versão B que é outra página

No teste `escola-institucional` a B não é uma cópia editada da Escola: é a página institucional inteira. Ela não tem um `b.html` escrito à mão. O build copia a institucional pronta para `b.html`, na raiz do site,, troca o canonical pelo da Escola e mantém os arquivos de CSS, JS e imagens dela em `/institucional/`. Quem diz de onde vem a B é a lista `versoesMontadas`, no começo de `scripts/build.mjs`:

```js
const versoesMontadas = {
  "/": "institucional",
};
```

- **Encerrar esse teste:** apague a linha `"/": "institucional"` e o teste do `experiments.json`, no mesmo PR. Se só um dos dois sair, o build falha e diz qual falta.
- **Se a institucional vencer:** decidir o endereço final dela é trabalho de desenvolvimento (por exemplo, passar a institucional para a raiz). Encerre o teste no mesmo PR.
- **Corrigir algo durante o teste:** a Escola se edita em `escola/index.html`; a institucional, em `institucional/src/content/` (ver [CONTENT.md](CONTENT.md)). A correção na institucional vale para `/institucional/` e para a B da raiz ao mesmo tempo.

## Ver a versão B antes de divulgar

Depois do merge, abra a página com `?ab=b` no final, por exemplo `https://escola-homolog.vercel.app/?ab=b`. Isso mostra a B só para você, sem gravar cookie e sem afetar a divisão. `?ab=a` mostra a A.

No computador, `npm run build && npm run preview` faz a mesma divisão em `http://localhost:4173`. Para cair de novo no sorteio, apague o cookie `ab_<id>` do navegador.

## Cuidados

- Durante um teste, se for corrigir algo em uma das versões, **corrija nas duas** (`index.html` e `b.html`). Elas são arquivos separados.
- CSS e JS da pasta (`style.css`, `script.js`) são compartilhados: mexer neles muda A e B ao mesmo tempo.
- Mudar `cookieDays` vale só para quem receber o cookie dali em diante: quem já tem cookie mantém o prazo antigo.
- A versão B só aparece na URL da página. Quem abrir `/auvp-sempre/b.html` é redirecionado para `/auvp-sempre/`, e `/b.html` para `/`.
- Resultados: o sistema só divide o tráfego. Para saber quem converteu, cruze com a ferramenta de vocês usando o cookie `ab_<id-do-teste>` (valor `a` ou `b`). Ele vale para o site inteiro (`Path=/`) e pode ser lido pelo GTM (variável do tipo "Cookie primário").
- A divisão acontece **na Vercel** (`middleware.js`) e **na AWS** (CloudFront Functions em `edge/`, ver [DEPLOY.md](DEPLOY.md)). No GitHub Pages, que serve arquivos estáticos, todo mundo vê a versão A, e o `b.html` abre direto se alguém digitar o endereço.
- **`versao_pagina`:** todo link para `form.auvp.com.br` sai com a versão da página e o layout em que a pessoa está: `a_desk`, `a_mobile`, `b_desk` ou `b_mobile`. A letra vem do arquivo da página (`b.html` = `b`, o resto = `a`). O layout vem da largura da tela, com o mesmo corte das páginas: abaixo de 768px é `mobile`, de 768px para cima é `desk` (tablet em pé conta como `desk`). O valor é conferido de novo no clique, então vale o layout daquele momento, mesmo que a pessoa tenha girado o celular. Quem faz é um script que o build coloca no fim de **todo** HTML (`scripts/snippets/versao-pagina.js`), sem precisar mexer nas páginas, inclusive nas novas. Os parâmetros e o `#fragmento` que já estão no link são preservados, e um `versao_pagina` que já exista não é sobrescrito. Links montados e abertos só com `location.href` não recebem o parâmetro.

## Como é feito (para desenvolvimento)

| Arquivo                           | Papel                                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `experiments.json`                | Testes ligados.                                                                                       |
| `ab/roteamento.js`                | Decide quem vê o quê: sorteio, cookie, `?ab=`, redirecionamento do `b.html`. Função pura, com testes. |
| `middleware.js`                   | Routing Middleware da Vercel. Chama `ab/roteamento.js` e serve a B no lugar da A, sem mudar a URL.    |
| `ab/validacao.js`                 | Regras do `experiments.json` e do site montado. Roda no `npm run build`; erro derruba o build e o PR. |
| `scripts/build.mjs`               | Monta as versões B de `versoesMontadas`, injeta o `versao_pagina` e chama a validação.                |
| `edge/`, `scripts/build-edge.mjs` | Divisão do tráfego na AWS (CloudFront Functions), gerada a cada deploy.                               |
| `scripts/preview.mjs`             | Servidor local com a mesma divisão.                                                                   |

O middleware só roda em endereços de página: CSS, JS, imagens, fontes e vídeos passam direto, sem custo de execução.
