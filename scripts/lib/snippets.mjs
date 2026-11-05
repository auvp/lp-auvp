// Injeta scripts globais em todo HTML do build, sem depender do código de cada página.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const snippetsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "snippets",
);
const MARCA = 'data-snippet="versao-pagina"';
const MARCA_UTM = 'data-snippet="utm"';

// b.html é a variante B de um teste; qualquer outra página é a A (ou a única versão).
export function versaoDe(arquivo) {
  return basename(arquivo) === "b.html" ? "b" : "a";
}

export function injectHtml(html, versao) {
  if (html.includes(MARCA)) return html;
  const codigo = readFileSync(
    resolve(snippetsDir, "versao-pagina.js"),
    "utf8",
  ).replace(/(["'])__VERSAO__\1/, (_, aspas) => `${aspas}${versao}${aspas}`);
  const utm = readFileSync(resolve(snippetsDir, "utm.js"), "utf8");
  const tag = `<script ${MARCA}>${codigo}</script><script ${MARCA_UTM}>${utm}</script>`;
  return html.includes("</body>")
    ? html.replace("</body>", () => `${tag}</body>`)
    : html + tag;
}

// Os HTMLs de ~partytown são do sandbox do Partytown, não páginas do site.
function htmlsEm(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? e.name === "~partytown"
        ? []
        : htmlsEm(join(dir, e.name))
      : e.name.endsWith(".html")
        ? [join(dir, e.name)]
        : [],
  );
}

export function injectDir(dir) {
  const arquivos = htmlsEm(dir);
  for (const f of arquivos)
    writeFileSync(f, injectHtml(readFileSync(f, "utf8"), versaoDe(f)));
  return arquivos;
}
