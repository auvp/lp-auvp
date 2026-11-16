// Acrescenta versao_pagina aos links do formulário (form.auvp.com.br), sem mexer no que já existe.
// Injetado em todo HTML do build por scripts/inject-snippets.mjs; a versão da página (a ou b) entra no lugar do marcador abaixo.
// O valor leva também o layout em que a pessoa está: a_desk, a_mobile, b_desk ou b_mobile.
(function () {
  var VERSAO = "__VERSAO__";
  var HOST = "form.auvp.com.br";
  var PARAM = "versao_pagina";
  // Mesmo corte do layout das páginas: abaixo de 768px é a versão de celular.
  var MOBILE = "(max-width: 767px)";
  var JA_TEM = new RegExp("([?&]" + PARAM + "=)[^&#]*");

  function valor() {
    var celular = false;
    try {
      celular = !!(window.matchMedia && window.matchMedia(MOBILE).matches);
    } catch (e) {}
    return VERSAO + (celular ? "_mobile" : "_desk");
  }

  function doFormulario(href) {
    try {
      return new URL(href, location.href).hostname === HOST;
    } catch (e) {
      return false;
    }
  }

  function comParametro(href) {
    if (!doFormulario(href)) return href;
    var i = href.indexOf("#");
    var base = i < 0 ? href : href.slice(0, i);
    var hash = i < 0 ? "" : href.slice(i);
    if (JA_TEM.test(base)) return href;
    var sep = base.indexOf("?") < 0 ? "?" : /[?&]$/.test(base) ? "" : "&";
    return base + sep + PARAM + "=" + valor() + hash;
  }

  function ajustar(link) {
    var atual = link.getAttribute("href");
    if (atual === null) return;
    var novo;
    if (link._versaoPaginaAuto && JA_TEM.test(atual)) {
      // Parâmetro posto por este script: atualiza o layout (a tela pode ter girado).
      novo = atual.replace(JA_TEM, "$1" + valor());
    } else {
      novo = comParametro(atual);
      if (novo !== atual) link._versaoPaginaAuto = true;
    }
    if (novo !== atual) link.setAttribute("href", novo);
  }

  function varrer(raiz) {
    if (raiz.nodeName === "A") ajustar(raiz);
    var links = raiz.querySelectorAll ? raiz.querySelectorAll("a[href]") : [];
    for (var i = 0; i < links.length; i++) ajustar(links[i]);
  }

  var abrir = window.open;
  window.open = function (url) {
    if (typeof url === "string") arguments[0] = comParametro(url);
    return abrir.apply(this, arguments);
  };

  varrer(document);
  // No clique o valor é conferido de novo, para valer o layout daquele momento.
  if (document.addEventListener) {
    var noClique = function (evento) {
      var alvo = evento.target;
      var link = alvo && alvo.closest ? alvo.closest("a[href]") : null;
      if (link) ajustar(link);
    };
    document.addEventListener("click", noClique, true);
    document.addEventListener("auxclick", noClique, true);
  }
  // Cobre links criados depois do carregamento e hrefs reescritos por outros scripts.
  new MutationObserver(function (mudancas) {
    for (var i = 0; i < mudancas.length; i++) {
      var m = mudancas[i];
      if (m.type === "attributes") ajustar(m.target);
      else
        for (var j = 0; j < m.addedNodes.length; j++)
          if (m.addedNodes[j].nodeType === 1) varrer(m.addedNodes[j]);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  });
})();
