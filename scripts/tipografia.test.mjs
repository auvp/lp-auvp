import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { cssDaPagina, faltando, verificarOrfas } from "./lib/tipografia.mjs";

const REGRA = "h1{text-wrap:balance}p{text-wrap: pretty}";

test("lê o CSS embutido e os links de stylesheet", () => {
  const { embutido, links } = cssDaPagina(
    `<link rel="preload" href="x.css"><link rel="stylesheet" href="a.css"><style>${REGRA}</style>`,
  );
  assert.deepEqual(links, ["a.css"]);
  assert.match(embutido, /balance/);
});

test("aponta o que falta", () => {
  assert.deepEqual(faltando(REGRA), []);
  assert.equal(faltando("p{text-wrap:pretty}").length, 1);
  assert.equal(faltando("").length, 2);
});

test("confere as páginas do site montado, com CSS local, relativo e absoluto", async () => {
  const dist = await mkdtemp(path.join(os.tmpdir(), "orfas-"));
  await mkdir(path.join(dist, "boa"), { recursive: true });
  await mkdir(path.join(dist, "ruim"), { recursive: true });
  await mkdir(path.join(dist, "assets"), { recursive: true });
  await writeFile(path.join(dist, "assets/site.css"), REGRA);
  await writeFile(
    path.join(dist, "index.html"),
    '<link rel="stylesheet" href="/repo/assets/site.css">',
  );
  await writeFile(
    path.join(dist, "boa/index.html"),
    '<link rel="stylesheet" href="https://fonts.googleapis.com/x"><link rel="stylesheet" href="../assets/site.css">',
  );
  await writeFile(
    path.join(dist, "ruim/index.html"),
    "<style>h1{text-wrap:balance}</style>",
  );
  const erros = await verificarOrfas(dist, "/repo");
  assert.equal(erros.length, 1);
  assert.match(erros[0], /^ruim\/index\.html: falta text-wrap: pretty/);
});
