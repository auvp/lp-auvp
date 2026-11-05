import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { injectHtml, versaoDe } from "./lib/snippets.mjs";

// Executa o script injetado numa página falsa e devolve os hrefs depois da varredura.
function rodar(hrefs, versao = "b") {
  const html = injectHtml("<html><body></body></html>", versao);
  const codigo = html.match(
    /<script data-snippet="versao-pagina">([\s\S]*?)<\/script>/,
  )[1];
  const links = hrefs.map((h) => ({
    h,
    getAttribute() {
      return this.h;
    },
    setAttribute(_, v) {
      this.h = v;
    },
  }));
  const aberturas = [];
  const janela = { open: (...args) => aberturas.push(args) };
  const contexto = {
    URL,
    RegExp,
    location: { href: "https://auvp.com.br/auvp-sempre/" },
    document: { documentElement: {}, querySelectorAll: () => links },
    MutationObserver: class {
      observe() {}
    },
    window: janela,
  };
  vm.runInNewContext(codigo, contexto);
  return { hrefs: links.map((l) => l.h), janela, aberturas };
}

test("acrescenta versao_pagina em link do formulário sem query", () => {
  assert.deepEqual(rodar(["https://form.auvp.com.br/to/eDvFy404"]).hrefs, [
    "https://form.auvp.com.br/to/eDvFy404?versao_pagina=b",
  ]);
});

test("preserva a query existente byte a byte e o fragmento", () => {
  const { hrefs } = rodar([
    "https://form.auvp.com.br/to/nrLyZhc6?typeform-source=www.auvp.com.br&utm_term=a%20b#x",
  ]);
  assert.deepEqual(hrefs, [
    "https://form.auvp.com.br/to/nrLyZhc6?typeform-source=www.auvp.com.br&utm_term=a%20b&versao_pagina=b#x",
  ]);
});

test("não duplica nem sobrescreve versao_pagina que já existe", () => {
  const link = "https://form.auvp.com.br/to/x?versao_pagina=z&x=1";
  assert.deepEqual(rodar([link]).hrefs, [link]);
});

test("trata ? e & no fim da URL", () => {
  assert.deepEqual(
    rodar([
      "https://form.auvp.com.br/to/a?",
      "https://form.auvp.com.br/to/a?x=1&",
    ]).hrefs,
    [
      "https://form.auvp.com.br/to/a?versao_pagina=b",
      "https://form.auvp.com.br/to/a?x=1&versao_pagina=b",
    ],
  );
});

test("ignora outros domínios, relativos, âncoras e domínios parecidos", () => {
  const outros = [
    "https://auvp.com.br/x",
    "/auvp-sempre/",
    "#topo",
    "mailto:a@b.com",
    "https://form.auvp.com.br.evil.com/x",
    "https://evil.com/?u=form.auvp.com.br",
  ];
  assert.deepEqual(rodar(outros).hrefs, outros);
});

test("link com // (mesmo protocolo) também recebe", () => {
  assert.deepEqual(rodar(["//form.auvp.com.br/to/a"]).hrefs, [
    "//form.auvp.com.br/to/a?versao_pagina=b",
  ]);
});

test("window.open para o formulário recebe o parâmetro; outros ficam intactos", () => {
  const { janela, aberturas } = rodar([], "a");
  janela.open("https://form.auvp.com.br/to/DSo4JgH8?utm_source=x", "_blank");
  janela.open("https://outro.com/", "_blank");
  assert.deepEqual(aberturas, [
    [
      "https://form.auvp.com.br/to/DSo4JgH8?utm_source=x&versao_pagina=a",
      "_blank",
    ],
    ["https://outro.com/", "_blank"],
  ]);
});

test("a versão vem do arquivo: b.html é b, o resto é a", () => {
  assert.equal(versaoDe("dist/auvp-sempre/b.html"), "b");
  assert.equal(versaoDe("dist/b.html"), "b");
  assert.equal(versaoDe("dist/auvp-sempre/index.html"), "a");
  assert.equal(versaoDe("dist/404.html"), "a");
});

test("injeção entra antes de </body> e é idempotente", () => {
  const um = injectHtml("<body><p>oi</p></body>", "a");
  assert.match(
    um,
    /<p>oi<\/p><script data-snippet="versao-pagina">[\s\S]*<\/script><\/body>$/,
  );
  assert.equal(injectHtml(um, "a"), um);
  assert.ok(!um.includes("__VERSAO__"));
});

test("HTML sem </body> recebe o script no fim", () => {
  assert.match(injectHtml("<p>x</p>", "a"), /<p>x<\/p><script data-snippet/);
});

test("o código-fonte do snippet não usa sintaxe fora de ES5 (roda em navegador antigo)", () => {
  const src = readFileSync(
    new URL("./snippets/versao-pagina.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(src, /=>|\bconst\b|\blet\b|`/);
});

test("link <a> criado depois entra na varredura (o próprio nó, não só descendentes)", () => {
  const html = injectHtml("<body></body>", "b");
  const codigo = html.match(
    /<script data-snippet="versao-pagina">([\s\S]*?)<\/script>/,
  )[1];
  let observador;
  const novo = {
    nodeName: "A",
    nodeType: 1,
    h: "https://form.auvp.com.br/to/x",
    getAttribute() {
      return this.h;
    },
    setAttribute(_, v) {
      this.h = v;
    },
    querySelectorAll: () => [],
  };
  vm.runInNewContext(codigo, {
    URL,
    RegExp,
    location: { href: "https://auvp.com.br/" },
    window: {},
    document: { documentElement: {}, querySelectorAll: () => [] },
    MutationObserver: class {
      constructor(fn) {
        observador = fn;
      }
      observe() {}
    },
  });
  observador([{ type: "childList", addedNodes: [novo] }]);
  assert.equal(novo.h, "https://form.auvp.com.br/to/x?versao_pagina=b");
});

// Executa o snippet de UTMs numa página falsa, com URL e sessionStorage próprios.
function rodarUtm({ busca = "", guardadas = null, hrefs = [] } = {}) {
  const html = injectHtml("<body></body>", "a");
  const codigo = html.match(
    /<script data-snippet="utm">([\s\S]*?)<\/script>/,
  )[1];
  const links = hrefs.map((h) => ({
    h,
    getAttribute() {
      return this.h;
    },
    setAttribute(_, v) {
      this.h = v;
    },
  }));
  const armazem = guardadas ? { auvp_utms: JSON.stringify(guardadas) } : {};
  vm.runInNewContext(codigo, {
    URL,
    URLSearchParams,
    JSON,
    encodeURIComponent,
    location: {
      href: "https://www.auvp.com.br/escola/" + busca,
      hostname: "www.auvp.com.br",
      search: busca,
    },
    sessionStorage: {
      getItem: (k) => armazem[k] ?? null,
      setItem: (k, v) => {
        armazem[k] = v;
      },
    },
    document: { documentElement: {}, querySelectorAll: () => links },
    MutationObserver: class {
      observe() {}
    },
  });
  return { hrefs: links.map((l) => l.h), armazem };
}

test("UTMs da URL vão para links internos e de checkout e ficam guardadas", () => {
  const { hrefs, armazem } = rodarUtm({
    busca: "?utm_source=g&utm_campaign=c&outro=1",
    hrefs: ["../termos-de-uso/", "https://form.auvp.com.br/to/x#a"],
  });
  assert.deepEqual(hrefs, [
    "../termos-de-uso/?utm_source=g&utm_campaign=c",
    "https://form.auvp.com.br/to/x?utm_source=g&utm_campaign=c#a",
  ]);
  assert.equal(armazem.auvp_utms, '{"utm_source":"g","utm_campaign":"c"}');
});

test("sem UTM na URL, usa as guardadas; UTMs novas substituem as guardadas", () => {
  const guardadas = { utm_source: "antiga", utm_term: "t" };
  assert.deepEqual(rodarUtm({ guardadas, hrefs: ["/x"] }).hrefs, [
    "/x?utm_source=antiga&utm_term=t",
  ]);
  assert.deepEqual(
    rodarUtm({ busca: "?utm_source=nova", guardadas, hrefs: ["/x"] }).hrefs,
    ["/x?utm_source=nova"],
  );
});

test("não sobrescreve parâmetro que o link já tem", () => {
  assert.deepEqual(
    rodarUtm({
      busca: "?utm_source=g&utm_medium=m",
      hrefs: ["https://form.auvp.com.br/to/x?utm_source=fixo"],
    }).hrefs,
    ["https://form.auvp.com.br/to/x?utm_source=fixo&utm_medium=m"],
  );
});

test("não leva UTMs a outros produtos, ao canal, a âncoras nem a arquivos", () => {
  const intactos = [
    "https://auvpcapital.com.br/wealth",
    "https://analitica.auvp.com.br/",
    "https://auvp.canaldenuncias.com.br/",
    "#topo",
    "mailto:a@b.com",
    "https://www.auvp.com.br/doc.pdf",
  ];
  assert.deepEqual(
    rodarUtm({ busca: "?utm_source=g", hrefs: intactos }).hrefs,
    intactos,
  );
});
