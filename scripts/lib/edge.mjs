// Monta o código das duas funções do CloudFront com os testes e redirects embutidos.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const edgeDir = resolve(import.meta.dirname, "..", "..", "edge");
const MAX_BYTES = 10000; // limite do CloudFront Functions é 10 KB

/*
 * O vercel.json segue como fonte dos redirects. A borda entende dois formatos
 * de `source`: o caminho exato (`/escola/`) e o prefixo com `:path+`
 * (`/escola/:path+`, que casa tudo abaixo de `/escola/`). Qualquer outro
 * padrão derruba o build, em vez de ser ignorado em silêncio.
 * Cada destino leva o status: 301 se `permanent`, senão 302.
 */
export function redirectsFrom(vercel) {
  const exatos = {};
  const prefixos = {};
  for (const r of vercel.redirects ?? []) {
    // Destino fora do site seria um open redirect: só caminho com uma barra inicial.
    if (!/^\/(?![/\\])[^\s\\]*$/.test(r.destination)) {
      throw new Error(
        `Redirect "${r.source}": o destino "${r.destination}" não é um caminho do próprio site.`,
      );
    }
    const alvo = [r.destination, r.permanent ? 301 : 302];
    if (r.source.endsWith("/:path+") && !/[:(*]/.test(r.source.slice(0, -6))) {
      prefixos[r.source.slice(0, -6)] = alvo;
    } else if (!/[:(*{]/.test(r.source)) {
      exatos[r.source] = alvo;
    } else {
      throw new Error(
        `Redirect "${r.source}" do vercel.json usa um padrão que a borda não entende (só caminho exato e /:path+).`,
      );
    }
  }
  return { exatos, prefixos };
}

// SITE_URL com host "www.…" liga o redirect do endereço sem www para ele.
export function wwwHostDe(siteUrl) {
  const host = siteUrl ? new URL(siteUrl).hostname : "";
  return host.startsWith("www.") ? host : "";
}

export function buildEdge({ tests, redirects, wwwHost = "" }) {
  const tabela = tests.map((t) => ({
    id: t.id,
    page: t.page,
    a: t.split.a,
    b: t.split.b,
    d: t.cookieDays ?? 30,
  }));
  const config =
    `var TESTS = ${JSON.stringify(tabela)};\n` +
    `var REDIRECTS = ${JSON.stringify(redirects.exatos)};\n` +
    `var PREFIXES = ${JSON.stringify(redirects.prefixos)};\n` +
    `var WWW_HOST = ${JSON.stringify(wwwHost)};\n`;
  const core = readFileSync(resolve(edgeDir, "core.js"), "utf8");
  const out = {};
  for (const name of ["request", "response"]) {
    out[name] =
      config + core + readFileSync(resolve(edgeDir, `${name}.js`), "utf8");
    const size = Buffer.byteLength(out[name]);
    if (size > MAX_BYTES) {
      throw new Error(
        `Função ${name} com ${size} bytes passa do limite de ${MAX_BYTES}.`,
      );
    }
  }
  return out;
}
