import assert from "node:assert/strict";
import test from "node:test";
import { validarTurma, preencherTurma } from "./lib/turma.mjs";

const turma = {
  proxima_turma: "2026-11-29T19:00:00-03:00",
  numero_turma: 63,
  numero_alunos: 65269,
};

test("aceita dados válidos com fuso explícito", () => {
  assert.deepEqual(validarTurma(turma), turma);
});

test("rejeita datas inválidas, inexistentes e sem fuso", () => {
  for (const proxima_turma of [
    "",
    "amanhã",
    "2026-11-29T19:00:00",
    "2026-02-30T19:00:00-03:00",
  ]) {
    assert.throws(() => validarTurma({ ...turma, proxima_turma }));
  }
});

test("rejeita campos ausentes e números inválidos", () => {
  for (const campo of ["numero_turma", "numero_alunos"]) {
    for (const valor of [undefined, null, "", "63", -1, 1.5, Infinity]) {
      assert.throws(() => validarTurma({ ...turma, [campo]: valor }));
    }
  }
  assert.throws(() => validarTurma({ ...turma, numero_turma: 0 }));
  assert.equal(validarTurma({ ...turma, numero_alunos: 0 }).numero_alunos, 0);
});

test("preenche todos os números no HTML antes do JavaScript", () => {
  const html =
    '<b class="js-numero-turma">62</b><span class="outro js-numero-alunos">0</span><i class="js-numero-turma">62</i><p>Não alterar</p>';
  assert.equal(
    preencherTurma(html, turma),
    '<b class="js-numero-turma">63</b><span class="outro js-numero-alunos">65.269</span><i class="js-numero-turma">63</i><p>Não alterar</p>',
  );
});

test("formata a data no horário de Brasília, mesmo se a origem usa UTC", () => {
  assert.equal(
    preencherTurma('<time class="js-data-turma">antiga</time>', {
      ...turma,
      proxima_turma: "2026-11-30T01:00:00Z",
    }),
    '<time class="js-data-turma">29/11/2026</time>',
  );
});
