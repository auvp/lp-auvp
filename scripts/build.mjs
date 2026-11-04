/**
 * Monta o site completo em `dist/`:
 *
 *     dist/index.html        LP da Escola (Vite), com assets/, fonts/ e
 *                            ~partytown/ na raiz
 *     dist/escola/           só um redirecionamento para a raiz, para
 *                            links antigos (a Vercel redireciona antes)
 *     dist/institucional/    página institucional (Vite + React)
 *     dist/auvp-sempre/      página da AUVP Sempre (HTML puro, copiada)
 *     dist/wpp/              cópia da LP da Escola para campanhas de
 *                            WhatsApp (ver `wpp-routing.js` da Escola)
 *     dist/<pagina>/         demais páginas clonadas do WordPress (idem),
 *                            com a base comum em dist/comum/
 *     dist/a/<aula>/         aulas gratuitas em vídeo (HTML puro, copiadas)
 *     dist/<pagina>/b.html   versão B de uma página em teste A/B
 *
 * A mesma pasta serve o GitHub Pages e a Vercel. O que muda entre os dois é
 * só o prefixo de URL, lido do ambiente:
 *
 * - `SITE_BASE_PATH`: subcaminho do site. No Pages de repositório de projeto
 *   é `/<repo>`; na Vercel e em domínio próprio fica vazio.
 * - `SITE_URL`: endereço público, usado na URL canônica do institucional. Na
 *   Vercel, se ausente, sai de `VERCEL_PROJECT_PRODUCTION_URL`.
 *
 * - `SITE_INDEXAVEL`: só com `true` o site pode ser indexado por buscadores.
 *   Sem ela (homologação), todo HTML sai com `noindex, nofollow` e a raiz
 *   ganha um robots.txt que bloqueia tudo, para o homolog não concorrer com o
 *   auvp.com.br no Google.
 *
 * No fim, injeta em todo HTML o script que acrescenta `versao_pagina` aos links
 * de form.auvp.com.br (`b.html` = b, o resto = a).
 *
 * Antes de montar, confere o experiments.json; no fim, confere se cada teste
 * A/B tem as duas versões no site. Qualquer erro derruba o build com a lista
 * do que corrigir. Ver docs/AB-TESTING.md.
 *
 * Ver docs/DEPLOY.md.
 */
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { injectDir } from "./lib/snippets.mjs";
import { arquivosSeo } from "./lib/seo.mjs";
import { verificarOrfas } from "./lib/tipografia.mjs";
import {
  canonical,
  validarExperimentos,
  validarSite,
} from "../ab/validacao.js";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");

// A action `configure-pages` devolve "/" quando o site fica na raiz.
const base = (process.env.SITE_BASE_PATH ?? "").replace(/\/+$/, "");
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = (
  process.env.SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "")
).replace(/\/+$/, "");

/*
 * Versões B que não são um `b.html` escrito à mão, e sim outra página deste
 * repositório: o build copia o index.html montado dela para `<página>/b.html`.
 * Os arquivos de CSS, JS e imagens continuam na pasta de origem (os caminhos
 * são absolutos), e o canonical é trocado pelo da versão A.
 *
 * Encerrar um desses testes é apagar a linha daqui e o teste do
 * experiments.json, no mesmo PR.
 */
const versoesMontadas = {};

function falhar(titulo, erros) {
  console.error(`\n${titulo}\n${erros.map((e) => `  - ${e}`).join("\n")}\n`);
  process.exit(1);
}

// Confere o experiments.json antes de gastar tempo com o build das páginas.
const experimentos = JSON.parse(
  await readFile(path.join(root, "experiments.json"), "utf8"),
);
const errosDoJson = validarExperimentos(experimentos);
if (errosDoJson.length) falhar("experiments.json com problema:", errosDoJson);
const montadasSemTeste = Object.keys(versoesMontadas).filter(
  (pagina) => !experimentos.tests.some((t) => t.page === pagina),
);
if (montadasSemTeste.length) {
  falhar(
    "Testes A/B com problema:",
    montadasSemTeste.map(
      (pagina) =>
        `${pagina} tem versão B montada em versoesMontadas (scripts/build.mjs), mas não há teste para ${pagina} no experiments.json. Acrescente o teste ou apague a linha de versoesMontadas.`,
    ),
  );
}

function run(workspace, env) {
  // Comando em string única: no Windows o `npm` é um .cmd e só roda via shell.
  const result = spawnSync(`npm run build -w ${workspace}`, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

await rm(dist, { recursive: true, force: true });

run("institucional", {
  BASE_PATH: `${base}/institucional/`,
  BUILD_OUT_DIR: path.join(dist, "institucional"),
  ...(siteUrl && { VITE_SITE_URL: `${siteUrl}/institucional` }),
});

// A Escola é a página da raiz. Vai depois da institucional porque não limpa a
// pasta de saída (emptyOutDir: false no vite.config.js dela).
run("escola", {
  BASE_PATH: `${base}/`,
  BUILD_OUT_DIR: dist,
});

// /wpp/: a mesma LP da Escola, para campanhas que mandam o lead ao WhatsApp.
// Quem troca os links do formulário pelo WhatsApp (em dia útil) é o
// escola/src/wpp-routing.js, que só age neste endereço. A cópia fica um nível
// abaixo da raiz, por isso os caminhos relativos ganham um `../`.
await mkdir(path.join(dist, "wpp"), { recursive: true });
await writeFile(
  path.join(dist, "wpp/index.html"),
  umNivelAbaixo(await readFile(path.join(dist, "index.html"), "utf8")),
);

await mkdir(dist, { recursive: true });
// Páginas em HTML puro, sem build: index.html, style.css, script.js e img/ vão
// como estão. Os caminhos são relativos, então funcionam na raiz e sob
// subcaminho do Pages. `comum/` guarda o cabeçalho, o rodapé e as imagens que
// as páginas vindas do WordPress compartilham.
const paginasEstaticas = [
  "comum",
  "auvp-sempre",
  "auvp-internacional",
  "nosso-processo",
  "quem-somos",
  "obrigado-aprovado",
  "obrigado-auvp-analitica",
  "resolva-aqui",
  "termos-de-uso",
  "politica-de-privacidade",
  // Aulas gratuitas em vídeo (VTurb), uma pasta por aula: /a/<aula>/.
  "a",
];
for (const pasta of paginasEstaticas) {
  await cp(path.join(root, pasta), path.join(dist, pasta), { recursive: true });
}
// A Escola morava em /escola/ e passou para a raiz. Na Vercel, o vercel.json
// redireciona antes de chegar aqui; este arquivo cobre o GitHub Pages.
await mkdir(path.join(dist, "escola"), { recursive: true });
await writeFile(
  path.join(dist, "escola/index.html"),
  `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>AUVP Escola</title>
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=../" />
    <style>
      p { text-wrap: pretty; }
      h1 { text-wrap: balance; }
    </style>
    <script>location.replace("../" + location.search + location.hash);</script>
  </head>
  <body>
    <p>A página da Escola mudou para <a href="../">o início do site</a>.</p>
  </body>
</html>
`,
);
// O Pages processa o site com Jekyll por padrão, e o Jekyll ignora pastas
// iniciadas por underscore. Nada aqui depende disso hoje, mas desligar evita
// a surpresa no dia em que depender.
await writeFile(path.join(dist, ".nojekyll"), "");

// Imagem de compartilhamento (og:image, twitter:image) em endereço absoluto,
// como o Facebook, o WhatsApp e o LinkedIn exigem. No HTML fica relativa à
// página, para funcionar em qualquer domínio; aqui ela vira URL completa a
// partir de SITE_URL. Sem SITE_URL (build local), fica como está. Roda antes
// das versões B montadas, que herdam o endereço já resolvido.
if (siteUrl) {
  const htmls = (await readdir(dist, { recursive: true })).filter(
    (f) => f.endsWith(".html") && !f.includes("~partytown"),
  );
  const origem = new URL(siteUrl).origin;
  for (const arquivo of htmls) {
    const caminho = path.join(dist, arquivo);
    const pasta = path.dirname(arquivo).split(path.sep).join("/");
    const pagina = `${siteUrl}/${pasta === "." ? "" : `${pasta}/`}`;
    const html = await readFile(caminho, "utf8");
    const novo = html.replace(
      /(<meta\s+(?:property|name)="(?:og:image|og:image:secure_url|twitter:image)"\s+content=")([^"]+)(")/g,
      (_, antes, valor, depois) =>
        /^https?:/.test(valor)
          ? antes + valor + depois
          : antes +
            (valor.startsWith("/")
              ? new URL(valor, origem).href
              : new URL(valor, pagina).href) +
            depois,
    );
    if (novo !== html) await writeFile(caminho, novo);
  }
}

// Versões B montadas a partir de outra página. Ver `versoesMontadas`.
for (const [pagina, origem] of Object.entries(versoesMontadas)) {
  const htmlA = await readFile(path.join(dist, pagina, "index.html"), "utf8");
  const htmlB = await readFile(path.join(dist, origem, "index.html"), "utf8");
  await writeFile(
    path.join(dist, pagina, "b.html"),
    trocarCanonical(htmlB, canonical(htmlA)),
  );
  console.log(`versão B de ${pagina} montada a partir de /${origem}/`);
}

/** Deixa no HTML só o canonical `href` (ou nenhum, se `href` for null). */
function trocarCanonical(html, href) {
  const semCanonical = html.replace(
    /[ \t]*<link\b[^>]*\brel\s*=\s*["']?canonical\b[^>]*>\n?/gi,
    "",
  );
  if (href === null) return semCanonical;
  return semCanonical.replace(
    /<head>/i,
    `<head>\n    <link rel="canonical" href="${href}" />`,
  );
}

// Homologação fora dos buscadores. Ver o comentário do topo.
if (process.env.SITE_INDEXAVEL !== "true") {
  const robots = '<meta name="robots" content="noindex, nofollow" />';
  const paginas = (await readdir(dist, { recursive: true })).filter(
    (f) => f.endsWith(".html") && !f.includes("~partytown"),
  );
  for (const pagina of paginas) {
    const arquivo = path.join(dist, pagina);
    const html = await readFile(arquivo, "utf8");
    const comMeta = /<meta\s+name="robots"[^>]*>/i.test(html)
      ? html.replace(/<meta\s+name="robots"[^>]*>/gi, robots)
      : html.replace(/<head>/i, `<head>\n    ${robots}`);
    await writeFile(arquivo, comMeta);
  }
  await writeFile(
    path.join(dist, "robots.txt"),
    "# Homologação: nada aqui deve ser indexado.\nUser-agent: *\nDisallow: /\n",
  );
  console.log(`noindex aplicado em ${paginas.length} páginas (homologação)`);
} else if (siteUrl) {
  // Produção: robots.txt, llms.txt e sitemaps da raiz, como o Amplify servia. Sem eles, na AWS
  // esses caminhos cairiam na home. Um arquivo da própria raiz (se existir) prevalece.
  for (const [nome, conteudo] of Object.entries(arquivosSeo(siteUrl))) {
    await writeFile(path.join(dist, nome), conteudo, { flag: "wx" }).catch(
      (e) => {
        if (e.code !== "EEXIST") throw e;
      },
    );
  }
}

// Script global em todo HTML do build: acrescenta versao_pagina (a ou b) aos
// links de form.auvp.com.br. Roda por último para cobrir também as versões B
// montadas acima. Ver scripts/snippets/versao-pagina.js.
console.log(
  `versao_pagina injetado em ${injectDir(dist).length} páginas (links de form.auvp.com.br)`,
);

const errosDoSite = await validarSite(dist, experimentos);
if (errosDoSite.length) falhar("Testes A/B com problema:", errosDoSite);

// Regra do repositório: nenhuma página com palavra órfã. Ver CONTRIBUTING.md.
const semRegraDeOrfas = await verificarOrfas(dist, base);
if (semRegraDeOrfas.length) {
  falhar(
    "Páginas sem a regra de palavra órfã (text-wrap). Ver CONTRIBUTING.md:",
    semRegraDeOrfas,
  );
}
if (experimentos.tests.length) {
  console.log(
    `testes A/B ligados: ${experimentos.tests.map((t) => `${t.id} (${t.page})`).join(", ")}`,
  );
}

console.log(`\nSite montado em ${dist} (base "${base || "/"}")`);

/**
 * Ajusta o HTML de uma página da raiz para servir uma pasta abaixo: caminhos
 * relativos em href, src e nas imagens de compartilhamento ganham `../`.
 * Endereços absolutos, âncoras e `mailto:`/`tel:` ficam como estão.
 */
function umNivelAbaixo(html) {
  const relativo = (valor) => !/^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(valor);
  return html
    .replace(/(\s(?:href|src)=")([^"]*)(")/g, (tudo, antes, valor, depois) =>
      valor && relativo(valor)
        ? `${antes}../${valor.replace(/^\.\//, "")}${depois}`
        : tudo,
    )
    .replace(
      /(<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content=")([^"]+)(")/g,
      (tudo, antes, valor, depois) =>
        relativo(valor)
          ? `${antes}../${valor.replace(/^\.\//, "")}${depois}`
          : tudo,
    );
}
