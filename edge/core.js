// Núcleo das funções de borda do CloudFront (runtime JS 2.0): ES5, sem imports.
// TESTS, REDIRECTS e PREFIXES são declarados antes deste arquivo por scripts/lib/edge.mjs.
var crypto = require("crypto");

function testFor(uri) {
  for (var i = 0; i < TESTS.length; i++) {
    if (uri === TESTS[i].page || uri === TESTS[i].page + "index.html")
      return TESTS[i];
  }
  return null;
}

function cookieName(t) {
  return "ab_" + t.id;
}

function validVariant(v) {
  return v === "a" || v === "b" ? v : null;
}

// Mesmo visitante + mesmo teste = mesma variante; testes diferentes sorteiam de forma independente.
function pick(t, visitor) {
  var hex = crypto
    .createHash("sha256")
    .update(visitor + ":" + t.id)
    .digest("hex");
  return parseInt(hex.slice(0, 8), 16) % 100 < t.a ? "a" : "b";
}

// ?ab=a|b força a versão (QA); depois o cookie; sem nenhum dos dois, sorteia pelo requestId.
function decide(request, requestId, t) {
  var qa = request.querystring.ab;
  if (qa && validVariant(qa.value))
    return { variant: qa.value, qa: true, setCookie: false };
  var c = request.cookies[cookieName(t)];
  if (c && validVariant(c.value))
    return { variant: c.value, qa: false, setCookie: false };
  return { variant: pick(t, requestId), qa: false, setCookie: true };
}

function queryString(request) {
  var parts = [];
  for (var key in request.querystring) {
    var q = request.querystring[key];
    var values = q.multiValue
      ? q.multiValue.map(function (m) {
          return m.value;
        })
      : [q.value];
    for (var i = 0; i < values.length; i++)
      parts.push(values[i] === "" ? key : key + "=" + values[i]);
  }
  return parts.length ? "?" + parts.join("&") : "";
}

// "\" vira "/" e barras repetidas viram uma só: o navegador lê "//host/..." (e "/\host/...")
// como outro site, e o redirect de barra final repete o caminho recebido.
function cleanPath(uri) {
  return uri.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
}

// Só se redireciona para o próprio site: caminho com UMA barra inicial ou o host principal.
function sameSite(location) {
  var path = location.split("?")[0];
  if (/[\x00-\x20\\]/.test(path)) return false;
  if (path.charAt(0) === "/") return path.charAt(1) !== "/";
  return !!WWW_HOST && path.indexOf("https://" + WWW_HOST + "/") === 0;
}

function redirect(location, status) {
  if (!sameSite(location)) location = "/";
  var permanent = status !== 302;
  return {
    statusCode: permanent ? 301 : 302,
    statusDescription: permanent ? "Moved Permanently" : "Found",
    headers: { location: { value: location } },
  };
}

// Endereço sem www (auvp.com.br) vai para o principal (www.auvp.com.br), mantendo caminho e query.
// WWW_HOST vazio desliga o redirect. Outros hosts (prod.*, *.cloudfront.net) passam intactos.
function wwwRedirect(request, uri) {
  var h = request.headers.host;
  if (!WWW_HOST || !h || h.value !== WWW_HOST.slice(4)) return null;
  return redirect("https://" + WWW_HOST + uri + queryString(request));
}

// REDIRECTS: caminho exato -> [destino, status].
// PREFIXES: tudo que vem depois do prefixo -> [destino, status].
function redirectFor(uri, request) {
  var hit = REDIRECTS[uri];
  if (!hit) {
    for (var prefix in PREFIXES) {
      if (uri.indexOf(prefix) === 0 && uri.length > prefix.length)
        hit = PREFIXES[prefix];
    }
  }
  return hit ? redirect(hit[0] + queryString(request), hit[1]) : null;
}
