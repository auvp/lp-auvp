/**
 * Regra de tipografia do repositório: nenhuma página publicada com palavra
 * órfã. Toda página precisa carregar `text-wrap: balance` (títulos) e
 * `text-wrap: pretty` (texto corrido), no próprio HTML ou num CSS local que
 * ela carrega. Roda no fim do `npm run build`; página sem a regra derruba o
 * build. Ver CONTRIBUTING.md, "Sem palavra órfã".
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const BALANCE = /text-wrap\s*:\s*balance/;
const PRETTY = /text-wrap\s*:\s*pretty/;

/** CSS que o HTML traz embutido (<style>) e os href dos <link rel=stylesheet>. */
export function cssDaPagina(html) {
  const embutido = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
  const links = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /\brel\s*=\s*["']?stylesheet/i.test(tag))
    .map((tag) => tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
    .filter(Boolean);
  return { embutido, links };
}

/** O que falta no CSS: lista vazia quando a regra está completa. */
export function faltando(css) {
  const falta = [];
  if (!BALANCE.test(css)) falta.push("text-wrap: balance nos títulos");
  if (!PRETTY.test(css)) falta.push("text-wrap: pretty no texto corrido");
  return falta;
}

/**
 * Confere todas as páginas do site montado.
 *
 * @param {string} dist pasta do site montado
 * @param {string} base subcaminho do site ("" na raiz, "/repo" no Pages)
 */
export async function verificarOrfas(dist, base = "") {
  const erros = [];
  const htmls = (await readdir(dist, { recursive: true })).filter(
    (f) => f.endsWith(".html") && !f.includes("~partytown"),
  );
  for (const arquivo of htmls) {
    const caminho = path.join(dist, arquivo);
    const { embutido, links } = cssDaPagina(await readFile(caminho, "utf8"));
    let css = embutido;
    for (const href of links) {
      if (/^(?:https?:)?\/\//i.test(href)) continue; // Google Fonts e afins
      const limpo = href.split(/[?#]/)[0];
      const local = limpo.startsWith("/")
        ? path.join(dist, limpo.slice(base.length))
        : path.join(path.dirname(caminho), limpo);
      css += "\n" + (await readFile(local, "utf8").catch(() => ""));
    }
    const falta = faltando(css);
    if (falta.length) {
      erros.push(
        `${arquivo.split(path.sep).join("/")}: falta ${falta.join(" e ")}`,
      );
    }
  }
  return erros;
}
