import turma from "../../../dados/turma.json";

/** Dobra de encerramento. Dados publicados pelo n8n via commit do JSON. */

export const closing = {
  eyebrow: "Próxima turma",
  /** Prazo com fuso explícito; o componente oculta a contagem após o início. */
  countdown: {
    target: turma.proxima_turma,
    turma: String(turma.numero_turma),
  },
  title: "A formação começa por uma conversa honesta sobre o seu momento.",
  ctaLabel: "Faça sua Análise de Perfil",
  photo: {
    /** Arquivado em acervo/fotos/raul-sena-biblioteca.webp */
    src: null as string | null,
    brief: "estúdio com estantes de livros, plano aberto",
  },
} as const;
