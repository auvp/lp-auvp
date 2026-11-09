import turma from "../../../dados/turma.json";

/** Dobra 02: alunos vêm do Directus; os demais números têm revisão trimestral. */

export type Stat = {
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { value: "+62.285", label: "Clientes ativos" },
  { value: "+4.637", label: "Artigos gratuitos publicados" },
  { value: "40 MI", label: "De pessoas impactadas" },
  {
    value: turma.numero_alunos.toLocaleString("pt-BR"),
    label: "Investidores formados pela AUVP",
  },
];
