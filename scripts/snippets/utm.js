// Guarda as UTMs da visita e as repassa aos links internos e de checkout, sem sobrescrever o que o link já tem.
// Injetado em todo HTML do build, como o versao-pagina.js. Sites de outros produtos ficam de fora.
(function () {
  var CHAVE = "auvp_utms";
  var HOSTS = [
    location.hostname,
    "www.auvp.com.br",
    "auvp.com.br",
    "form.auvp.com.br",
    "checkout.auvp.com.br",
    "hub-api.auvp.com.br",
    "clkdmg.site",
  ];
  var ARQUIVO = /\.(pdf|png|jpe?g|webp|svg|zip)$/i;

  var daUrl = {};
  new URLSearchParams(location.search).forEach(function (valor, nome) {
    if (nome.indexOf("utm_") === 0 && valor) daUrl[nome] = valor;
  });

  // UTMs novas na URL substituem as guardadas.
  var utms = daUrl;
  try {
    if (Object.keys(daUrl).length) {
      sessionStorage.setItem(CHAVE, JSON.stringify(daUrl));
    } else {
      utms = JSON.parse(sessionStorage.getItem(CHAVE)) || {};
    }
  } catch (e) {}

  var nomes = Object.keys(utms);
  if (!nomes.length) return;

  function comUtms(href) {
    if (!href || href.charAt(0) === "#") return href;
    var alvo;
    try {
      alvo = new URL(href, location.href);
    } catch (e) {
      return href;
    }
    if (!/^https?:$/.test(alvo.protocol)) return href;
    if (HOSTS.indexOf(alvo.hostname) < 0 || ARQUIVO.test(alvo.pathname)) {
      return href;
    }
    var faltam = nomes.filter(function (nome) {
      return !alvo.searchParams.has(nome);
    });
    if (!faltam.length) return href;
    var i = href.indexOf("#");
    var base = i < 0 ? href : href.slice(0, i);
    var hash = i < 0 ? "" : href.slice(i);
    var sep = base.indexOf("?") < 0 ? "?" : /[?&]$/.test(base) ? "" : "&";
    var extra = faltam
      .map(function (nome) {
        return encodeURIComponent(nome) + "=" + encodeURIComponent(utms[nome]);
      })
      .join("&");
    return base + sep + extra + hash;
  }

  function ajustar(link) {
    var atual = link.getAttribute("href");
    var novo = comUtms(atual);
    if (novo !== atual) link.setAttribute("href", novo);
  }

  function varrer(raiz) {
    if (raiz.nodeName === "A") ajustar(raiz);
    var links = raiz.querySelectorAll ? raiz.querySelectorAll("a[href]") : [];
    for (var i = 0; i < links.length; i++) ajustar(links[i]);
  }

  varrer(document);
  // Cobre links criados depois do carregamento e hrefs reescritos por outros scripts.
  new MutationObserver(function (mudancas) {
    mudancas.forEach(function (m) {
      if (m.type === "attributes") ajustar(m.target);
      else
        m.addedNodes.forEach(function (no) {
          if (no.nodeType === 1) varrer(no);
        });
    });
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["href"],
  });
})();
