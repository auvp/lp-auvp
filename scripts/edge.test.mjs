import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { buildEdge, redirectsFrom, wwwHostDe } from "./lib/edge.mjs";

const require = createRequire(import.meta.url);
const redirects = {
  exatos: { "/escola/": ["/", 302], "/antiga": ["/nova/", 301] },
  prefixos: { "/escola/": ["/", 302] },
};

function load(split = { a: 50, b: 50 }, cookieDays, wwwHost) {
  const code = buildEdge({
    tests: [{ id: "sempre-titulo", page: "/auvp-sempre/", split, cookieDays }],
    redirects,
    wwwHost,
  });
  const run = (src) => vm.runInNewContext(`${src}\nhandler`, { require });
  return { request: run(code.request), response: run(code.response), code };
}

const req = (uri, { qs = {}, cookies = {} } = {}) => ({
  uri,
  querystring: Object.fromEntries(
    Object.entries(qs).map(([k, v]) => [k, { value: v }]),
  ),
  cookies: Object.fromEntries(
    Object.entries(cookies).map(([k, v]) => [k, { value: v }]),
  ),
  headers: {},
});
const ev = (request, requestId = "req-1", response) => ({
  request,
  response,
  context: { requestId },
});
const ok = () => ({ statusCode: 200, headers: {}, cookies: {} });

// Simula o CloudFront: roda a função de pedido e entrega à de resposta o pedido já reescrito.
function serve(fns, request, requestId = "req-1", response = ok()) {
  const out = fns.request(ev(request, requestId));
  if (out.statusCode) return out; // redirect: a função de resposta não roda
  return fns.response(ev(out, requestId, response));
}

test("o código gerado cabe no limite de 10 KB", () => {
  const { code } = load();
  assert.ok(
    Buffer.byteLength(code.request) < 10000 &&
      Buffer.byteLength(code.response) < 10000,
  );
});

test("redirects do vercel.json: caminho exato, prefixo /:path+ e status pela flag permanent", () => {
  assert.deepEqual(
    redirectsFrom({
      redirects: [
        { source: "/x", destination: "/y/", permanent: true },
        { source: "/escola/", destination: "/", permanent: false },
        { source: "/escola/:path+", destination: "/", permanent: false },
      ],
    }),
    {
      exatos: { "/x": ["/y/", 301], "/escola/": ["/", 302] },
      prefixos: { "/escola/": ["/", 302] },
    },
  );
});

test("redirect com padrão que a borda não entende derruba o build", () => {
  assert.throws(
    () =>
      redirectsFrom({ redirects: [{ source: "/a/:id/b", destination: "/" }] }),
    /não entende/,
  );
  assert.throws(
    () => redirectsFrom({ redirects: [{ source: "/(.*)", destination: "/" }] }),
    /não entende/,
  );
});

test("o vercel.json real do projeto é aceito pela borda", async () => {
  const { readFileSync } = await import("node:fs");
  const vercel = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  assert.doesNotThrow(() => redirectsFrom(vercel));
});

test("redirects: status do vercel.json (301 ou 302), preservando a query", () => {
  const { request } = load();
  const permanente = request(ev(req("/antiga", { qs: { utm_source: "g" } })));
  assert.equal(permanente.statusCode, 301);
  assert.equal(permanente.headers.location.value, "/nova/?utm_source=g");
  const temporario = request(ev(req("/escola/", { qs: { utm_source: "g" } })));
  assert.equal(temporario.statusCode, 302);
  assert.equal(temporario.headers.location.value, "/?utm_source=g");
});

test("redirect por prefixo: /escola/qualquer-coisa vai para /, mas /escola-x/ não", () => {
  const { request } = load();
  assert.equal(
    request(ev(req("/escola/qualquer/coisa"))).headers.location.value,
    "/",
  );
  assert.equal(request(ev(req("/escola-x/"))).uri, "/escola-x/index.html");
});

test("trailing slash: /planos vai para /planos/", () => {
  const { request } = load();
  assert.equal(request(ev(req("/planos"))).headers.location.value, "/planos/");
});

test("páginas sem teste: / e /planos/ viram index.html; arquivos passam intactos", () => {
  const { request } = load();
  assert.equal(request(ev(req("/"))).uri, "/index.html");
  assert.equal(request(ev(req("/planos/"))).uri, "/planos/index.html");
  assert.equal(
    request(ev(req("/assets/app-abc.js"))).uri,
    "/assets/app-abc.js",
  );
  assert.equal(request(ev(req("/robots.txt"))).uri, "/robots.txt");
});

test("acesso direto a b.html redireciona para a página", () => {
  const { request } = load();
  assert.equal(
    request(ev(req("/auvp-sempre/b.html"))).headers.location.value,
    "/auvp-sempre/",
  );
});

test("QA: ?ab=b serve a B, ?ab=a serve a A, valor inválido cai no sorteio", () => {
  const { request } = load();
  assert.equal(
    request(ev(req("/auvp-sempre/", { qs: { ab: "b" } }))).uri,
    "/auvp-sempre/b.html",
  );
  assert.equal(
    request(ev(req("/auvp-sempre/", { qs: { ab: "a" } }), "x"))?.uri,
    "/auvp-sempre/index.html",
  );
  assert.match(
    request(ev(req("/auvp-sempre/", { qs: { ab: "zzz" } }))).uri,
    /^\/auvp-sempre\/(b|index)\.html$/,
  );
});

test("cookie manda: quem tem ab_sempre-titulo=b vê a B, mesmo com outro requestId", () => {
  const { request } = load();
  const cookies = { "ab_sempre-titulo": "b" };
  for (const id of ["1", "2", "3"])
    assert.equal(
      request(ev(req("/auvp-sempre/", { cookies }), id)).uri,
      "/auvp-sempre/b.html",
    );
});

test("cookie inválido é ignorado", () => {
  const { request } = load();
  const r = request(
    ev(req("/auvp-sempre/", { cookies: { "ab_sempre-titulo": "hack" } })),
  );
  assert.match(r.uri, /^\/auvp-sempre\/(b|index)\.html$/);
});

test("o sorteio é determinístico para o mesmo requestId", () => {
  const { request } = load();
  const uri = (id) => request(ev(req("/auvp-sempre/"), id)).uri;
  for (const id of ["a1", "b2", "c3"]) assert.equal(uri(id), uri(id));
});

for (const [a, b] of [
  [50, 50],
  [90, 10],
  [20, 80],
]) {
  test(`proporção ${a}/${b} em 20 mil visitantes`, () => {
    const { request } = load({ a, b });
    let countB = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) {
      if (
        request(ev(req("/auvp-sempre/"), randomBytes(8).toString("hex")))
          .uri === "/auvp-sempre/b.html"
      )
        countB++;
    }
    assert.ok(
      Math.abs(countB / n - b / 100) < 0.02,
      `B recebeu ${((countB / n) * 100).toFixed(1)}%`,
    );
  });
}

test("o cookie gravado é a variante servida, para A e para B", () => {
  const fns = load({ a: 50, b: 50 });
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const id = randomBytes(8).toString("hex");
    const served =
      fns.request(ev(req("/auvp-sempre/"), id)).uri === "/auvp-sempre/b.html"
        ? "b"
        : "a";
    const res = serve(fns, req("/auvp-sempre/"), id);
    seen.add(served);
    assert.equal(res.cookies["ab_sempre-titulo"].value, served);
    assert.equal(res.headers["x-ab"].value, `sempre-titulo:${served}`);
  }
  assert.deepEqual([...seen].sort(), ["a", "b"]);
});

test("response: cookie com Secure, SameSite e 30 dias; não regrava se já existe (A e B)", () => {
  const fns = load();
  const first = serve(fns, req("/auvp-sempre/"), "abc");
  assert.equal(
    first.cookies["ab_sempre-titulo"].attributes,
    "Path=/; Max-Age=2592000; Secure; SameSite=Lax",
  );
  for (const v of ["a", "b"]) {
    const again = serve(
      fns,
      req("/auvp-sempre/", { cookies: { "ab_sempre-titulo": v } }),
      "abc",
    );
    assert.equal(again.cookies["ab_sempre-titulo"], undefined);
    assert.equal(again.headers["x-ab"].value, `sempre-titulo:${v}`);
  }
});

test("response: cookieDays do teste define o Max-Age (padrão 30 dias)", () => {
  const maxAge = (res) =>
    res.cookies["ab_sempre-titulo"].attributes.match(/Max-Age=(\d+)/)[1];
  assert.equal(
    maxAge(serve(load(), req("/auvp-sempre/"), "abc")),
    String(30 * 86400),
  );
  assert.equal(
    maxAge(serve(load({ a: 50, b: 50 }, 7), req("/auvp-sempre/"), "abc")),
    String(7 * 86400),
  );
  assert.equal(
    maxAge(serve(load({ a: 50, b: 50 }, 365), req("/auvp-sempre/"), "abc")),
    String(365 * 86400),
  );
});

test("response: QA não grava cookie e marca noindex (A e B)", () => {
  const fns = load();
  for (const v of ["a", "b"]) {
    const res = serve(fns, req("/auvp-sempre/", { qs: { ab: v } }), "abc");
    assert.equal(res.cookies["ab_sempre-titulo"], undefined);
    assert.equal(res.headers["x-robots-tag"].value, "noindex, nofollow");
    assert.equal(res.headers["x-ab"].value, `sempre-titulo:${v}`);
  }
});

test("response: páginas sem teste e respostas que não são 200 não mudam", () => {
  const fns = load();
  assert.deepEqual(serve(fns, req("/planos/"), "abc"), ok());
  const notFound = serve(fns, req("/auvp-sempre/"), "abc", {
    statusCode: 404,
    headers: {},
    cookies: {},
  });
  assert.deepEqual(notFound.cookies, {});
});

test("sem testes, nenhuma página é afetada", () => {
  const code = buildEdge({ tests: [], redirects });
  const request = vm.runInNewContext(`${code.request}\nhandler`, { require });
  assert.equal(
    request(ev(req("/auvp-sempre/"))).uri,
    "/auvp-sempre/index.html",
  );
});

test("teste na página inicial: a B é /b.html, a URL do visitante continua /", () => {
  const code = buildEdge({
    tests: [{ id: "escola-institucional", page: "/", split: { a: 50, b: 50 } }],
    redirects,
  });
  const fns = {
    request: vm.runInNewContext(`${code.request}\nhandler`, { require }),
    response: vm.runInNewContext(`${code.response}\nhandler`, { require }),
  };
  assert.equal(fns.request(ev(req("/", { qs: { ab: "b" } }))).uri, "/b.html");
  assert.equal(
    fns.request(ev(req("/", { qs: { ab: "a" } }))).uri,
    "/index.html",
  );
  assert.equal(fns.request(ev(req("/b.html"))).headers.location.value, "/");
  // Outras páginas não entram no teste da raiz.
  assert.equal(
    fns.request(ev(req("/institucional/", { qs: { ab: "b" } }))).uri,
    "/institucional/index.html",
  );
  const res = serve(fns, req("/", { qs: { ab: "b" } }));
  assert.equal(res.headers["x-ab"].value, "escola-institucional:b");
  const primeira = serve(fns, req("/"), "abc");
  assert.ok(primeira.cookies["ab_escola-institucional"]);
});

test("www principal: auvp.com.br vai para www.auvp.com.br (301), com caminho e query", () => {
  const { request } = load(undefined, undefined, "www.auvp.com.br");
  const r = req("/auvp-sempre/", { qs: { utm_source: "x" } });
  r.headers.host = { value: "auvp.com.br" };
  const out = request(ev(r));
  assert.equal(out.statusCode, 301);
  assert.equal(
    out.headers.location.value,
    "https://www.auvp.com.br/auvp-sempre/?utm_source=x",
  );
});

test("www principal: www, prod.* e cloudfront.net passam; sem wwwHost nada redireciona", () => {
  const { request } = load(undefined, undefined, "www.auvp.com.br");
  for (const host of [
    "www.auvp.com.br",
    "prod.auvp.com.br",
    "d1gaqth6af57nh.cloudfront.net",
  ]) {
    const r = req("/auvp-sempre/");
    r.headers.host = { value: host };
    assert.equal(request(ev(r)).uri, "/auvp-sempre/index.html", host);
  }
  const sem = load().request;
  const r = req("/");
  r.headers.host = { value: "auvp.com.br" };
  assert.equal(sem(ev(r)).uri, "/index.html");
});

test("wwwHostDe: só host com www liga o redirect", () => {
  assert.equal(wwwHostDe("https://www.auvp.com.br"), "www.auvp.com.br");
  assert.equal(wwwHostDe("https://auvp.com.br"), "");
  assert.equal(wwwHostDe(undefined), "");
});

// Redirect só para o próprio site: uma única barra inicial (nunca "//" nem "/\") ou o host principal.
const mesmoSite = (loc) =>
  /^\/(?![/\\])/.test(loc.split("?")[0]) ||
  loc.startsWith("https://www.auvp.com.br/");

const ATAQUES = [
  "///google.com/aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9mYXZpY29uLmljbw",
  "//google.com/x",
  "////google.com/x",
  "/\\google.com/x",
  "/\\\\google.com/x",
  "/\\/google.com/x",
  "/.//google.com/x",
  "/x//google.com/y",
];

test("open redirect: nenhum caminho com barras ou contrabarras leva a outro domínio", () => {
  for (const wwwHost of [undefined, "www.auvp.com.br"]) {
    const { request } = load(undefined, undefined, wwwHost);
    for (const host of ["prod.auvp.com.br", "auvp.com.br", "www.auvp.com.br"]) {
      for (const uri of ATAQUES) {
        const r = req(uri, { qs: { utm_source: "x" } });
        r.headers.host = { value: host };
        const out = request(ev(r));
        if (out.statusCode) {
          const loc = out.headers.location.value;
          assert.ok(mesmoSite(loc), `${host}${uri} -> ${loc}`);
        } else {
          assert.ok(!out.uri.startsWith("//"), `${host}${uri} -> ${out.uri}`);
        }
      }
    }
  }
});

test("open redirect: barras repetidas viram uma e o redirect de barra final fica no site", () => {
  const { request } = load();
  const out = request(ev(req("///google.com/x")));
  assert.equal(out.statusCode, 301);
  assert.equal(out.headers.location.value, "/google.com/x/");
});

test("open redirect: o vercel.json não pode apontar para fora do site", () => {
  const redir = (destination) =>
    redirectsFrom({
      redirects: [{ source: "/x", destination, permanent: true }],
    });
  for (const d of [
    "https://evil.com/",
    "//evil.com",
    "/\\evil.com",
    "evil.com",
    "/a b",
  ])
    assert.throws(() => redir(d), /próprio site|fora do site|destino/i, d);
  assert.doesNotThrow(() => redir("/ok/"));
});
