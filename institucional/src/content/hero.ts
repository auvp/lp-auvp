/** Dobra 01: hero. */

export const hero = {
  positioning: "A maior escola de investimentos do Brasil",
  /**
   * O título vem partido em dois porque a dobra o distribui nos cantos de
   * baixo, um em cada ponta da mesma linha de base. Rodada de testes pedida
   * pelo Raul (nov/2026): volta a headline original da Escola, com a promessa
   * de prazo do outro lado. Antes: "Aprenda a investir. Viva com liberdade."
   */
  headline: {
    left: ["Aprenda a investir", "no Brasil e no mundo"],
    right: ["Do 0 a investidor", "em 8 semanas"],
  },
  support:
    "A AUVP forma investidores independentes, capazes de tomar suas próprias decisões financeiras e construir patrimônio com autonomia. Uma instituição criada para mudar a relação do brasileiro com o dinheiro.",
  ctaLabel: "Estude com a AUVP",
  photo: {
    /* Rodada de testes (nov/2026): foto do Raul no lugar da plateia. Tem
       2000 px, abaixo dos 2400 do briefing; serve para o teste. A plateia
       continua em public/images/ para a volta. */
    src: "/images/raul-sena-palco-b3.webp" as string | null,
    alt: "Raul Sena falando ao microfone no púlpito, durante um evento na B3.",
    /**
     * Plano fechado da plateia, e não do palco: quem abre a página vê gente
     * escutando, que é o que a instituição faz, e não uma pessoa falando.
     *
     * O quadro já nasce 3:2 e entra sem recorte, então quem decide o corte é o
     * `object-cover`, conforme a altura da janela. Serve nas duas direções: o
     * assunto é uma plateia inteira, distribuída de ponta a ponta, então não há
     * um sujeito que possa ficar de fora quando a janela aperta.
     */
    brief:
      "plano fechado da plateia atenta, escuro e quente, sem um sujeito único que o corte possa perder, paisagem 3:2 com 2400px ou mais",
  },
} as const;
