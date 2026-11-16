import { HeroBackdrop, HeroForeground } from "@/components/motion/HeroScroll";
import { BackdropReserve } from "@/components/ui/Figure";
import { Button } from "@/components/ui/Button";
import { hero } from "@/content/hero";
import { links, site } from "@/content/site";
import { asset } from "@/lib/asset";
import { srcset } from "@/lib/srcset";

/**
 * Dobra 01.
 *
 * A abertura é uma capa, não um bloco de texto centralizado: fotografia em
 * sangria total e o título partido nas duas pontas da linha de base. Entre o
 * posicionamento, no alto, e o título, embaixo, não há nada além da fotografia.
 *
 * A assinatura AUVP em corpo arquitetônico ficou aqui por um tempo, vinda da
 * abertura da Lionheart. Saiu: com a barra fixa logo acima carregando o mesmo
 * logotipo, a marca aparecia duas vezes na mesma dobra, e a de baixo empurrava
 * o menu para longe do topo.
 *
 * **Esta dobra não usa o `Container`.** É a única da página que não usa, e é de
 * propósito: aqui as réguas são a moldura da capa, e moldura que para a 152px
 * da borda não é moldura, é caixa. Elas correm de ponta a ponta com uma margem
 * curta. Da segunda dobra em diante a grade volta a valer, sem exceção.
 *
 * O título fica embaixo por um motivo prático: é onde a fotografia costuma ser
 * mais escura e onde o véu inferior garante contraste, seja qual for a foto
 * que entrar no lugar desta.
 */
export function Hero() {
  return (
    <section
      id="principal"
      className="bg-ink text-paper relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <HeroBackdrop>
        {hero.photo.src ? (
          <img
            src={asset(hero.photo.src)}
            srcSet={srcset(hero.photo.src)}
            /* A foto cobre a dobra (min-h-[100svh]). Em tela mais estreita
               que 3/2 ela escala pela altura e a largura desenhada seria
               1,5 × a altura da tela. Pedimos 1 × a altura de propósito: sob
               a película escura do hero a diferença não aparece, e o celular
               baixa a versão de 1600 px em vez da de 2400. */
            sizes="(max-aspect-ratio: 3/2) 100vh, 100vw"
            alt={hero.photo.alt}
            fetchPriority="high"
            /* Centro em qualquer largura. A fotografia é uma plateia
               distribuída de ponta a ponta, sem um sujeito único: em retrato,
               onde a foto escala pela altura e sobra corte lateral, o que
               sobra em tela continua sendo plateia. */
            /* Foto do Raul (rodada de testes): a cabeça fica rente ao topo do
               quadro, então a foto começa abaixo dos 96px da barra fixa e
               ancora no alto, para o menu não cobrir o rosto. */
            className="absolute inset-x-0 top-24 bottom-0 h-[calc(100%-6rem)] w-full object-cover object-top"
          />
        ) : (
          <BackdropReserve brief={hero.photo.brief} />
        )}
      </HeroBackdrop>

      {/*
        Três véus sobrepostos. O primeiro escurece topo e base, que é onde há
        texto; o segundo puxa a esquerda, onde o título começa; o terceiro
        fecha o encontro com a dobra seguinte. Juntos garantem o contraste do
        texto sobre qualquer recorte que venha a substituir a fotografia.
      */}
      <div
        aria-hidden
        className="from-ink/70 via-ink/45 to-ink/95 absolute inset-0 bg-gradient-to-b"
      />
      <div
        aria-hidden
        className="from-ink/60 absolute inset-0 bg-gradient-to-r to-transparent"
      />
      <div
        aria-hidden
        className="to-ink absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent"
      />

      {/* O respiro do topo precisa passar dos 96px da barra fixa, senão o
          posicionamento entra por baixo dela. */}
      <HeroForeground className="relative z-10 flex min-h-[100svh] flex-col pt-32 pb-10 md:pb-16">
        <div className="flex flex-1 flex-col px-6 md:px-10 lg:px-10 xl:px-14">
          {/* A linha logo acima destes dois é a borda de baixo da barra fixa, e
              não uma régua desta dobra: é o que faz ela e o pé do fundo branco
              caírem no mesmo ponto da grade. Ver `usePassouOHero`. */}
          <div className="text-paper/60 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <p className="eyebrow">{hero.positioning}</p>
            <p className="eyebrow">Fundada em {site.foundingYear}</p>
          </div>

          {/* Empurra o título para a base sem prender a dobra a uma altura fixa. */}
          <div className="min-h-16 flex-1" />

          <h1 className="grid gap-y-3 sm:grid-cols-2 sm:items-end sm:gap-x-10">
            <span className="font-[family-name:var(--font-display)] text-[2.25rem] leading-[1.02] font-medium tracking-[-0.015em] sm:text-5xl lg:text-[3.75rem]">
              {hero.headline.left.map((linha) => (
                <span key={linha} className="block">
                  {linha}
                </span>
              ))}
            </span>
            <span className="font-[family-name:var(--font-display)] text-[2.25rem] leading-[1.02] font-medium tracking-[-0.015em] sm:text-right sm:text-5xl lg:text-[3.75rem]">
              {hero.headline.right.map((linha) => (
                <span key={linha} className="block">
                  {linha}
                </span>
              ))}
            </span>
          </h1>

          <div className="border-paper/20 mt-8 grid gap-6 border-t pt-6 md:mt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-14 md:pt-7">
            <p className="text-mist max-w-[48rem] text-sm leading-relaxed md:text-base">
              {hero.support}
            </p>
            {/* Rodada de testes: o mesmo verde do .auvp-btn-green da LP da
                Escola (escola/src/style.css), no lugar do amarelo. */}
            <Button
              href={links.profileAnalysis}
              variant="yellow"
              size="lg"
              className="bg-[linear-gradient(90deg,#00c642_0%,#00992b_100%)]! text-white! hover:bg-[linear-gradient(90deg,#00b03a_0%,#008024_100%)]!"
            >
              {hero.ctaLabel}
            </Button>
          </div>
        </div>
      </HeroForeground>
    </section>
  );
}
