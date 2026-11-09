import { normalizarTurma } from "../lib/turma.mjs";

/** Prepara um PUT Contents API, ou null quando não houve mudança. */
export function prepararCommit(arquivo, dados, tentativa = 0) {
  if (tentativa >= 3) {
    throw new Error(
      "Atualização interrompida após três tentativas concorrentes.",
    );
  }
  const turma = normalizarTurma(dados);
  if (
    typeof arquivo?.sha !== "string" ||
    !arquivo.sha ||
    typeof arquivo.content !== "string" ||
    !arquivo.content
  ) {
    throw new Error(
      "O JSON de turma precisa existir no GitHub com conteúdo e SHA.",
    );
  }
  const anterior = normalizarTurma(
    JSON.parse(Buffer.from(arquivo.content, "base64").toString("utf8")),
  );
  if (JSON.stringify(turma) === JSON.stringify(anterior)) return null;
  return {
    message: `conteudo: atualiza dados da turma ${turma.numero_turma}`,
    content: Buffer.from(`${JSON.stringify(turma, null, 2)}\n`).toString(
      "base64",
    ),
    sha: arquivo.sha,
    branch: "main",
  };
}

/** Somente um conflito de SHA permite nova tentativa com releitura das fontes. */
export function conferirCommit(resposta) {
  if (resposta.statusCode === 409) return true;
  if (resposta.statusCode === 200 || resposta.statusCode === 201) return false;
  throw new Error(
    `GitHub recusou a atualização da turma: HTTP ${resposta.statusCode}.`,
  );
}
