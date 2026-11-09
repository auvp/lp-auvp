# Publicação

O repositório gera **um único site estático** em `dist/`, com estes endereços:

| Caminho           | Origem                                                                             |
| ----------------- | ---------------------------------------------------------------------------------- |
| `/`               | `escola/`, a LP da Escola com Vite (em teste A/B com a institucional)              |
| `/institucional/` | `institucional/`, Vite + React                                                     |
| `/escola/`        | redireciona para `/` (endereço antigo da Escola)                                   |
| `/auvp-sempre/`   | `auvp-sempre/`, HTML puro copiado                                                  |
| `/<pagina>/`      | as demais páginas clonadas do WordPress, HTML puro copiado, com a base em `comum/` |

A mesma pasta serve o **GitHub Pages** e a **Vercel**. Quem monta tudo é
`scripts/build.mjs`, chamado por `npm run build` na raiz. A lista completa, com
os links da homologação, está no [README](../README.md).

---

## Homologação fora do Google

Enquanto o site for homologação, nada nele deve ser indexado: ele repete o
conteúdo do auvp.com.br e concorreria com ele nos buscadores. Por isso o
`scripts/build.mjs`, por padrão, coloca `<meta name="robots" content="noindex, nofollow">`
em todas as páginas e grava na raiz um `robots.txt` que bloqueia tudo.

Para publicar como produção, defina `SITE_INDEXAVEL=true` no ambiente do build
(na Vercel: **Settings → Environment Variables**; no Pages: no `env` do passo de
build em `.github/workflows/deploy.yml`). Sem ela, o build continua em modo
homologação.

---

## GitHub Pages

Publicado pelo workflow `.github/workflows/deploy.yml` a cada push na `main`.

**Endereço:** `https://<dono>.github.io/<repo>/`. Hoje,
<https://auvp.github.io/lp-escola-homolog/>.

### Ativação (uma vez só)

1. Abra **Settings → Pages** no repositório.
2. Em **Source**, escolha **GitHub Actions** (não "Deploy from a branch").
3. Pronto. O próximo push na `main` publica.

Para publicar sem esperar um commit novo: **Actions → Deploy no GitHub Pages →
Run workflow**.

### Como o build sabe o endereço

Num repositório de projeto, o Pages serve o site sob `/<repo>` em vez da raiz.
Se o build não souber disso, todo CSS, fonte e imagem sai apontando para o lugar
errado e a página carrega em branco.

O workflow pergunta ao próprio GitHub:

```yaml
- id: pages
  uses: actions/configure-pages@v5

- run: npm run build
  env:
    SITE_BASE_PATH: ${{ steps.pages.outputs.base_path }}
    SITE_URL: ${{ steps.pages.outputs.base_url }}
```

E o `scripts/build.mjs` repassa a cada página o seu pedaço:

| Variável         | Vai para                                        | Exemplo no Pages                            |
| ---------------- | ----------------------------------------------- | ------------------------------------------- |
| `SITE_BASE_PATH` | `base` do Vite no institucional e na Escola     | `/lp-escola-homolog/institucional/`         |
| `SITE_URL`       | `VITE_SITE_URL`: canonical, OG, sitemap, robots | `https://…/lp-escola-homolog/institucional` |

Nada fica fixado no código. No dia em que um domínio próprio for configurado, a
action passa a devolver a raiz e o build se ajusta sozinho.

---

## Vercel

Configurada por `vercel.json`. Basta importar o repositório na Vercel uma vez
(**Add New → Project**). Não é preciso escolher framework nem preencher nada: o
arquivo já define install, build e pasta de saída.

Na Vercel o site fica na raiz do domínio, então `SITE_BASE_PATH` fica vazio. A
URL canônica sai de `VERCEL_PROJECT_PRODUCTION_URL`, que a Vercel define sozinha.
Para fixar outra (domínio próprio, por exemplo), crie a variável `SITE_URL` em
**Settings → Environment Variables**.

Cada PR ganha um preview da Vercel com todas as páginas.

**Cabeçalhos.** O `vercel.json` manda em todas as páginas `X-Frame-Options:
SAMEORIGIN` (ninguém de fora embute o site num iframe), `X-Content-Type-Options:
nosniff` e `Referrer-Policy: strict-origin-when-cross-origin`. Não use
`Cross-Origin-Opener-Policy`: com ele, o PageSpeed passou a medir CLS de ~0,5
no computador nas duas páginas, sem salto visível; sem ele, voltou a zero. Os arquivos com hash em
`/assets/` e `/institucional/assets/` saem com cache de um ano (`immutable`). Se
alguma página precisar ser embutida em outro domínio, troque o
`X-Frame-Options` por uma CSP `frame-ancestors` com esse domínio.

**Imagem de compartilhamento.** Cada página aponta a sua `og:image` com
caminho relativo (ex.: `img/og.jpg`). O build troca por endereço absoluto a
partir de `SITE_URL`, que é o que Facebook, WhatsApp e LinkedIn exigem.

**Testes A/B só funcionam na Vercel.** O `middleware.js` da raiz é um Routing
Middleware: a Vercel o detecta sozinha, sem configuração, e ele divide o
tráfego das páginas listadas em `experiments.json`. No GitHub Pages não há
servidor para isso, e todo mundo vê a versão A. Ver [AB-TESTING.md](AB-TESTING.md).

---

## AWS (S3 + CloudFront)

Terceiro destino do mesmo `dist/`, ao lado do Pages e da Vercel (nenhum dos dois
muda). Publicado pelo workflow `.github/workflows/deploy-aws.yml` a cada push na
`main`, no bucket `lp-auvp` (já existente) com uma distribuição CloudFront na
frente. O workflow só roda depois que a variável `SITE_DISTRIBUTION_ID` existir
no repositório (**Settings → Secrets and variables → Actions → Variables**).

- **Testes A/B:** como o middleware é só da Vercel, na AWS duas CloudFront
  Functions (`edge/`) fazem a mesma divisão, com o mesmo `experiments.json`, o
  mesmo `b.html` e o mesmo cookie `ab_<id>`. O `scripts/build-edge.mjs` as gera a
  cada deploy, com os testes e os redirects do `vercel.json` embutidos. Do
  `vercel.json` a borda entende caminho exato e `/:path+`; outro padrão derruba o
  build.
- **Ordem do deploy** (`scripts/ci/deploy.sh`): arquivos novos, funções, remoção
  dos antigos, invalidação. Os `assets/` com hash nunca são apagados.
- **Cache:** `/assets/*` e `/institucional/assets/*` por um ano (`immutable`); o
  resto revalida a cada pedido, igual à Vercel.
- **Terraform** (`terraform/`, fora do git): referencia o bucket existente e cria
  CloudFront, OAC, as funções e a role OIDC. A política do bucket é substituída
  por uma que libera a leitura ao CloudFront e mantém as permissões do Amplify
  (app `d13l7siu16yjgv`, branch `production`) que já estavam lá. Se surgirem
  outras, copie-as para o `terraform/main.tf` antes do apply.
- **O deploy substitui a raiz do bucket.** O `aws s3 sync --delete` apaga o que
  estava no `lp-auvp` (o site anterior, servido pelo Amplify: `wp-content/`,
  `sitemap_index.xml`, `llms.txt`...). Decisão de 27/10/2026: se o Amplify
  precisar voltar, os arquivos antigos são enviados de novo ao bucket. O Amplify
  só enxerga a mudança no próximo deploy dele.
- **Endereço que não existe** mostra a página inicial, com a URL mantida e **status
  404** (o site não tem `404.html`). O 404 vem dos `custom_error_response` do
  Terraform (S3 responde 403/404): as funções de borda não rodam nessa resposta, então
  o status não pode ser trocado por elas. Assim buscadores descartam as URLs antigas do
  WordPress e arquivos como `/llms.txt` não parecem existir. Para responder 200 em vez
  de 404, troque `response_code` nos dois blocos.

---

## O que faz a hospedagem estática funcionar

**Pré-renderização do institucional.** `institucional/scripts/build.mjs` faz o
build normal do Vite, depois um build SSR de `src/entry-server.tsx`, e injeta o
HTML renderizado no `index.html`. A página chega pronta, como chegava no export
do Next: robôs de busca e prévias de link leem o conteúdo sem executar
JavaScript. No navegador, `src/main.tsx` só hidrata.

**`asset()`.** O Vite aplica a `base` aos arquivos que ele mesmo processa
(JS, CSS, fontes importadas), mas não às strings de caminho que vivem em
`institucional/src/content/` (`/images/sede-auvp-capital.webp`). Por isso todo
componente que renderiza `<img>` passa o caminho por
`institucional/src/lib/asset.ts`:

```tsx
<img src={asset(mission.photo.src)} … />
```

**Ao criar um componente novo que renderize imagem, use `asset()`.** É o tipo de
erro que passa despercebido no `npm run dev` e só aparece em produção.

**`.nojekyll`.** O Pages processa o site com Jekyll por padrão, e o Jekyll ignora
pastas iniciadas por underscore. O build grava o arquivo em `dist/` para
desligar esse processamento.

---

## Peso das imagens

Não há otimizador de imagem no servidor: as versões por tamanho de tela são
geradas no repositório (abaixo). Antes de adicionar qualquer foto, gere a
versão final no tamanho de uso (o padrão está em `docs/ASSETS.md`):

```bash
npx sharp-cli --input foto.jpg --output institucional/public/images/foto.webp \
  resize 2000 --withoutEnlargement -- webp --quality 82
```

Depois de pôr a foto em `institucional/public/images/`, rode
`npm run imagens -w institucional`. Ele gera as versões de 640, 1024 e 1600 px
em `public/images/variantes/` e atualiza `src/content/variantes.ts`; com isso a
foto sai com `srcset`, e o celular baixa a versão do tamanho em que ela aparece.
Faça commit dos arquivos gerados junto com a foto.

O material do site antigo vive em `acervo/legado/`, **fora de `public/`**, de
propósito: tudo que está em `public/` é copiado para o build e servido a cada
visitante. Pelo mesmo motivo, os masters da Escola ficam em
`escola/imagens-originais/`.

---

## Testar o build de produção antes de publicar

O `npm run dev` roda na raiz e não pega erro de caminho. Para conferir o
resultado final:

```bash
npm run build
npm run preview     # http://localhost:4173
```

Para reproduzir o subcaminho do Pages, gere com `SITE_BASE_PATH` e sirva a
pasta dentro de um diretório com o nome do repositório:

```bash
SITE_BASE_PATH=/lp-escola-homolog npm run build
mkdir -p /tmp/pages && rm -rf /tmp/pages/lp-escola-homolog
cp -r dist /tmp/pages/lp-escola-homolog
npm run preview -- /tmp/pages
```

Abra <http://localhost:4173/lp-escola-homolog/> e confira o console do
navegador: **qualquer 404 ali é um 404 em produção.**

> No Git Bash do Windows, prefixe com `MSYS_NO_PATHCONV=1`: sem isso o shell
> converte `/lp-escola-homolog` num caminho de disco antes de repassar.

---

## Migrar para domínio próprio

**No Pages:**

1. **Settings → Pages → Custom domain**: informe o domínio (ex.:
   `institucional.auvp.com.br`) e salve.
2. **No DNS da AUVP**, crie um registro `CNAME` do subdomínio apontando para
   `<dono>.github.io`.
   _(Domínio de raiz exige registros `A` para os IPs do Pages. Ver a
   documentação do GitHub Pages.)_
3. Aguarde a verificação e marque **Enforce HTTPS**.
4. **Não é preciso mexer em código.** A `configure-pages` passa a devolver a raiz
   e o próximo deploy sai sem subcaminho.

**Na Vercel:** **Settings → Domains**, e defina `SITE_URL` com o domínio novo.

Nos dois casos, reenvie o `sitemap.xml` do institucional no Search Console.

---

## Checklist antes de anunciar o site

- [ ] `npm run check` e `npm run build` passam
- [ ] Nenhum 404 no console ao abrir o build sob o subcaminho
- [ ] Todos os links de `institucional/src/content/site.ts` respondem
- [ ] O número do WhatsApp em `links.whatsapp` está correto
- [ ] `/institucional/robots.txt` e `/institucional/sitemap.xml` trazem a URL
      certa
- [ ] Nenhuma reserva de "Foto pendente" visível, ou é decisão consciente
      (ver `docs/ASSETS.md`)
- [ ] Lighthouse mobile: referência de 95+ em Performance, Accessibility, Best
      Practices e SEO

## Depois de publicar

- Enviar o `sitemap.xml` do institucional no Google Search Console.
- Validar o dado estruturado no
  [Rich Results Test](https://search.google.com/test/rich-results). A página
  declara `EducationalOrganization` e `FAQPage`.

> **Enquanto o site estiver em `github.io` ou `vercel.app`,** evite divulgá-lo
> como endereço definitivo: quando migrar para o domínio próprio, o antigo vira
> conteúdo duplicado aos olhos do Google. Se a fase de teste for longa, vale
> trocar o `robots` em `institucional/index.html` para `noindex` até a migração.
