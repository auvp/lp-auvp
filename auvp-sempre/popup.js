/*
 * AUVP Sempre: popup de tela cheia que chama para a AUVP Escola.
 *
 * A Sempre é exclusiva para quem já foi aluno da Escola. Quem chega a um dos
 * pontos marcados da página recebe o popup, que leva para a Escola e não tem
 * como ser fechado: sem X, sem "já sou aluno" e sem Esc. Quem não é aluno não
 * deve voltar para a página da assinatura.
 *
 * Gatilhos:
 * - Qualquer elemento com `data-popup-sempre-gatilho="<nome>"` abre o popup
 *   quando metade dele aparece na tela. O nome vai para o GTM, para saber em
 *   qual ponto da página a pessoa foi barrada.
 * - Abre sempre que a pessoa chega a um gatilho, inclusive depois de
 *   recarregar a página.
 * - `data-popup-sempre-auto` no <dialog> abre assim que a página carrega. Só a
 *   prévia (/auvp-sempre/popup/) usa.
 *
 * Eventos no dataLayer: popup_sempre_aberto e popup_sempre_clique (com
 * `popup_cta`), os dois com `popup_gatilho`.
 */
(function () {
  var dialog = document.getElementById("popup-sempre");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var gatilhoAtual = "";

  function registrar(evento, extra) {
    window.dataLayer = window.dataLayer || [];
    var dados = { event: evento, popup_gatilho: gatilhoAtual };
    for (var k in extra) dados[k] = extra[k];
    window.dataLayer.push(dados);
  }

  function abrir(gatilho) {
    if (dialog.open) return;
    gatilhoAtual = gatilho || "manual";
    document.documentElement.classList.add("popup-sempre-aberto");
    dialog.showModal();
    registrar("popup_sempre_aberto");
  }

  window.popupSempre = { abrir: abrir };

  // Esc não fecha.
  dialog.addEventListener("cancel", function (event) {
    event.preventDefault();
  });

  // Se o navegador fechar mesmo assim (alguns forçam o fechamento depois de
  // vários Esc seguidos), o popup volta.
  dialog.addEventListener("close", function () {
    dialog.showModal();
  });

  dialog.addEventListener("click", function (event) {
    var cta = event.target.closest("[data-popup-cta]");
    if (cta) {
      registrar("popup_sempre_clique", {
        popup_cta: cta.getAttribute("data-popup-cta"),
      });
    }
  });

  if (dialog.hasAttribute("data-popup-sempre-auto")) {
    abrir("previa");
    return;
  }

  var gatilhos = document.querySelectorAll("[data-popup-sempre-gatilho]");
  if (!gatilhos.length || !("IntersectionObserver" in window)) return;

  var observador = new IntersectionObserver(
    function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        if (!entradas[i].isIntersecting) continue;
        observador.disconnect();
        abrir(entradas[i].target.getAttribute("data-popup-sempre-gatilho"));
        return;
      }
    },
    { threshold: 0.5 },
  );
  gatilhos.forEach(function (el) {
    observador.observe(el);
  });
})();
