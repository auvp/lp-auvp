import { useEffect, useState } from "react";
import { closing } from "@/content/closing";

/**
 * Contagem regressiva para o início da próxima turma.
 *
 * A data e o número da turma vêm de `dados/turma.json`, compartilhado com a
 * LP da Escola e incorporado ao build. O navegador só atualiza o relógio.
 *
 * É a única contagem regressiva da página, e existe porque conta um prazo que
 * existe de verdade: a turma tem data. `docs/BRAND.md` continua proibindo a
 * outra espécie, a que inventa pressa, e a diferença entre as duas está em
 * três regras que este componente cumpre.
 *
 * **Primeira: prazo vencido não aparece.** Passada a data, ou sem data no
 * conteúdo, o componente não renderiza nada e a dobra segue de pé sem ele. Uma
 * contagem parada em zero, ou negativa, numa página institucional é pior do
 * que contagem nenhuma, e é o destino de toda data que alguém esquece de
 * atualizar.
 *
 * **Segunda: nada pisca, nada fica vermelho.** Os numerais usam a serifa e a
 * régua da página, como o resto dela.
 *
 * **Terceira: quem usa leitor de tela recebe a data, não o tique-taque.** Os
 * numerais ficam em `aria-hidden` e abaixo deles há a frase com o prazo por
 * extenso, que é texto comum e não `sr-only`: se a informação precisa existir
 * para quem não vê o relógio, ela serve para todo mundo. Anunciar a mudança a
 * cada segundo tornaria a dobra inutilizável.
 *
 * Com `prefers-reduced-motion` os segundos somem e o relógio passa a andar de
 * meio em meio minuto: assim não há conteúdo em movimento contínuo, que é o
 * que o critério 2.2.2 do WCAG cobra.
 */

type Restante = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

function calcular(alvo: number): Restante | null {
  const falta = alvo - Date.now();
  if (falta <= 0) return null;

  const segundosTotais = Math.floor(falta / 1000);
  return {
    dias: Math.floor(segundosTotais / 86400),
    horas: Math.floor((segundosTotais % 86400) / 3600),
    minutos: Math.floor((segundosTotais % 3600) / 60),
    segundos: segundosTotais % 60,
  };
}

/**
 * O rótulo nomeia a turma quando ela tem nome.
 *
 * "Inscrições para a turma 126 encerram em" diz de qual prazo se trata, e numa
 * escola que abre turma atrás de turma isso é a diferença entre um prazo e o
 * prazo. Sem o identificador sobra o genérico, que continua verdadeiro: é
 * melhor não nomear do que nomear errado.
 */
function rotulo(turma: string | null) {
  return turma ? `A turma ${turma} começa em` : "A próxima turma começa em";
}

const dataPorExtenso = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function ClassCountdown() {
  const alvo = Date.parse(closing.countdown.target);
  const turma = closing.countdown.turma;

  const [estado, setEstado] = useState<{
    restante: Restante;
    semSegundos: boolean;
  } | null>(null);

  useEffect(() => {
    if (!Number.isFinite(alvo)) return;

    const reduzido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let intervalo = 0;

    const passo = () => {
      const restante = calcular(alvo);
      setEstado(restante ? { restante, semSegundos: reduzido } : null);
    };

    // A primeira leitura vai por rAF: `Date.now()` no corpo do efeito seria
    // estado escrito durante a montagem, e o servidor não tem como acertar o
    // mesmo valor que o navegador.
    const frame = requestAnimationFrame(() => {
      passo();
      intervalo = window.setInterval(passo, reduzido ? 30_000 : 1000);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (intervalo) clearInterval(intervalo);
    };
  }, [alvo]);

  if (!estado) return null;

  const { restante, semSegundos } = estado;
  const titulo = rotulo(turma);
  const unidades = [
    { valor: restante.dias, rotulo: restante.dias === 1 ? "dia" : "dias" },
    { valor: restante.horas, rotulo: restante.horas === 1 ? "hora" : "horas" },
    { valor: restante.minutos, rotulo: "min" },
    ...(semSegundos ? [] : [{ valor: restante.segundos, rotulo: "seg" }]),
  ];

  // A grade tem uma coluna por unidade, e não `flex` com folga fixa: assim os
  // numerais ocupam a largura inteira da coluna em vez de se amontoar à
  // esquerda dela e deixar um vazio à direita. Os dois literais precisam ficar
  // escritos por extenso para o Tailwind enxergá-los na varredura.
  const colunas = semSegundos ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="flex flex-col gap-8">
      {/* Neutro, e não amarelo: o rótulo da dobra, na outra coluna, já é
          amarelo, e dois acentos colados um no outro anulam os dois. */}
      <p className="eyebrow text-paper/70 text-balance">{titulo}</p>

      <ul aria-hidden className={`grid gap-4 ${colunas}`}>
        {unidades.map((unidade) => (
          <li key={unidade.rotulo} className="flex flex-col gap-2">
            <span className="text-paper font-[family-name:var(--font-display)] text-[2.75rem] leading-none font-semibold tabular-nums lg:text-[3.25rem]">
              {String(unidade.valor).padStart(2, "0")}
            </span>
            <span className="eyebrow text-mist/70">{unidade.rotulo}</span>
          </li>
        ))}
      </ul>

      {/*
        A data por extenso, visível, e não mais só para leitor de tela. São
        duas coisas ao mesmo tempo: é o que dá ao prazo a precisão que um
        relógio correndo não dá, e é o que dá à coluna a altura que faltava
        para ela conversar com a coluna do convite, do outro lado da régua.
      */}
      {/* Só a data, sem verbo: o rótulo acima ("A turma 62 começa em") já
          disse o resto, e repeti-lo aqui faria a coluna dizer a mesma frase
          duas vezes. Lido em sequência por um leitor de tela, o rótulo e esta
          linha formam uma frase só. */}
      <p className="text-mist/70 border-paper/15 border-t pt-6 text-sm leading-relaxed">
        {dataPorExtenso.format(alvo)}, horário de Brasília.
      </p>
    </div>
  );
}
