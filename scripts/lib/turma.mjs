/** Contrato compartilhado pelo build e pela atualização do n8n. */
export function validarTurma(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Dados de turma inválidos.");
  }
  const { proxima_turma, numero_alunos, numero_turma } = dados;
  const partes =
    typeof proxima_turma === "string" &&
    proxima_turma.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/,
    );
  if (!partes || !Number.isFinite(Date.parse(proxima_turma))) {
    throw new Error(
      "proxima_turma precisa de uma data ISO válida com fuso explícito.",
    );
  }
  const [, ano, mes, dia, hora, minuto, segundo] = partes;
  const diasNoMes = new Date(
    Date.UTC(Number(ano), Number(mes), 0),
  ).getUTCDate();
  if (
    Number(mes) < 1 ||
    Number(mes) > 12 ||
    Number(dia) < 1 ||
    Number(dia) > diasNoMes ||
    Number(hora) > 23 ||
    Number(minuto) > 59 ||
    Number(segundo) > 59
  ) {
    throw new Error("proxima_turma contém uma data inexistente.");
  }
  if (!Number.isSafeInteger(numero_turma) || numero_turma <= 0) {
    throw new Error("numero_turma precisa ser um inteiro positivo.");
  }
  if (!Number.isSafeInteger(numero_alunos) || numero_alunos < 0) {
    throw new Error("numero_alunos precisa ser um inteiro não negativo.");
  }
  return { proxima_turma, numero_alunos, numero_turma };
}

/** Datas sem fuso no Directus representam o horário de Brasília. */
export function normalizarTurma(dados) {
  const data = dados?.proxima_turma;
  return validarTurma({
    ...dados,
    proxima_turma:
      typeof data === "string" && !/(Z|[+-]\d{2}:\d{2})$/.test(data)
        ? `${data}-03:00`
        : data,
  });
}

/** Preenche somente elementos de texto marcados para os dados de turma. */
export function preencherTurma(html, dados) {
  const turma = validarTurma(dados);
  const valores = {
    "js-numero-turma": String(turma.numero_turma),
    "js-numero-alunos": turma.numero_alunos.toLocaleString("pt-BR"),
    "js-data-turma": new Date(turma.proxima_turma).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }),
  };
  return html.replace(
    /(<[\w-]+\b[^>]*\bclass="([^"]*)"[^>]*>)[^<]*(<\/[\w-]+>)/g,
    (original, abertura, classes, fechamento) => {
      const marcador = classes.split(/\s+/).find((classe) => classe in valores);
      return marcador ? abertura + valores[marcador] + fechamento : original;
    },
  );
}
