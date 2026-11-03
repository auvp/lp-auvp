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

  /*
   * Carrossel dos tópicos da Escola: setas, pontos, arrastar no celular
   * (scroll-snap nativo) e avanço sozinho a cada 4 s. O avanço para de vez
   * quando a pessoa toca, clica ou usa o teclado nele, e nem começa para quem
   * pediu menos movimento no sistema.
   */
  function iniciarCarrossel(raiz) {
    var trilha = raiz.querySelector("[data-carrossel-trilha]");
    var pontos = raiz.querySelector("[data-carrossel-pontos]");
    if (!trilha || !trilha.children.length) return function () {};
    var itens = trilha.children;

    /*
     * Paradas: as posições de rolagem em que um cartão encosta na esquerda.
     * Os últimos cartões não chegam lá (a trilha acaba antes), então viram
     * uma parada só, a do fim. Um ponto por parada: no desktop, com dois
     * cartões e meio à vista, são menos pontos que cartões.
     */
    function paradas() {
      var max = trilha.scrollWidth - trilha.clientWidth;
      var lista = [];
      for (var i = 0; i < itens.length; i++) {
        var x = Math.min(itens[i].offsetLeft - itens[0].offsetLeft, max);
        if (!lista.length || x - lista[lista.length - 1] > 2) lista.push(x);
      }
      return lista;
    }

    function atual(lista) {
      var x = trilha.scrollLeft;
      var melhor = 0;
      for (var i = 1; i < lista.length; i++) {
        if (Math.abs(lista[i] - x) < Math.abs(lista[melhor] - x)) melhor = i;
      }
      return melhor;
    }

    // Refaz os pontos quando o número de paradas muda (popup abrindo,
    // celular girando).
    function marcar() {
      var lista = paradas();
      if (pontos.children.length !== lista.length) {
        pontos.textContent = "";
        lista.forEach(function (_, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute(
            "aria-label",
            "Ir para o grupo " + (i + 1) + " de " + lista.length,
          );
          b.addEventListener("click", function () {
            irPara(i, true);
          });
          pontos.appendChild(b);
        });
      }
      var n = atual(lista);
      for (var i = 0; i < pontos.children.length; i++) {
        pontos.children[i].setAttribute(
          "aria-current",
          i === n ? "true" : "false",
        );
      }
    }

    // Do fim volta para o começo, e do começo vai para o fim.
    function irPara(n, daPessoa) {
      if (daPessoa) parar();
      var lista = paradas();
      trilha.scrollTo({ left: lista[(n + lista.length) % lista.length] });
    }

    function passo(delta) {
      return function () {
        irPara(atual(paradas()) + delta, true);
      };
    }
    raiz
      .querySelector("[data-carrossel-anterior]")
      .addEventListener("click", passo(-1));
    raiz
      .querySelector("[data-carrossel-proximo]")
      .addEventListener("click", passo(1));

    var espera;
    trilha.addEventListener("scroll", function () {
      clearTimeout(espera);
      espera = setTimeout(marcar, 60);
    });
    window.addEventListener("resize", marcar);
    ["pointerdown", "wheel", "keydown", "focusin"].forEach(function (ev) {
      raiz.addEventListener(ev, parar, { passive: true });
    });

    var relogio = null;
    function parar() {
      clearInterval(relogio);
      relogio = null;
    }

    // Chamada quando o popup abre: com ele visível, as medidas existem.
    return function comecar() {
      marcar();
      var menosMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (relogio || menosMovimento) return;
      relogio = setInterval(function () {
        irPara(atual(paradas()) + 1, false);
      }, 4000);
    };
  }

  var carrossel = dialog.querySelector("[data-carrossel]");
  var comecarCarrossel = carrossel
    ? iniciarCarrossel(carrossel)
    : function () {};

  function abrir(gatilho) {
    if (dialog.open) return;
    gatilhoAtual = gatilho || "manual";
    document.documentElement.classList.add("popup-sempre-aberto");
    dialog.showModal();
    comecarCarrossel();
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
