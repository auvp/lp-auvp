import assert from "node:assert/strict";
import test from "node:test";
import { prepararCommit, conferirCommit } from "./n8n/turma-commit.mjs";

const atual = {
  proxima_turma: "2026-11-29T19:00:00-03:00",
  numero_alunos: 65269,
  numero_turma: 63,
};
const arquivo = {
  sha: "sha-lido-no-github",
  content: Buffer.from(JSON.stringify(atual)).toString("base64"),
};

test("webhook repetido não produz commit, mesmo com data sem fuso", () => {
  assert.equal(
    prepararCommit(arquivo, {
      ...atual,
      proxima_turma: "2026-11-29T19:00:00",
    }),
    null,
  );
});

test("prepara apenas o JSON da turma com SHA e branch protegendo a atualização", () => {
  const commit = prepararCommit(arquivo, {
    proxima_turma: "2026-12-20T19:00:00",
    numero_alunos: 67000,
    numero_turma: 64,
    campo_interno: "não publicar",
  });
  assert.equal(commit.branch, "main");
  assert.equal(commit.sha, "sha-lido-no-github");
  assert.equal(commit.message, "conteudo: atualiza dados da turma 64");
  assert.equal(
    Buffer.from(commit.content, "base64").toString("utf8"),
    '{\n  "proxima_turma": "2026-12-20T19:00:00-03:00",\n  "numero_alunos": 67000,\n  "numero_turma": 64\n}\n',
  );
});

test("datas inexistentes, payload de erro e números inválidos não produzem commit", () => {
  for (const dados of [
    { error: "Directus indisponível" },
    { ...atual, proxima_turma: "2026-02-30T19:00:00" },
    { ...atual, numero_turma: "" },
    { ...atual, numero_alunos: null },
  ])
    assert.throws(() => prepararCommit(arquivo, dados));
});

test("arquivo sem SHA ou conteúdo válido interrompe a atualização", () => {
  assert.throws(() => prepararCommit({ content: arquivo.content }, atual));
  assert.throws(() => prepararCommit({ sha: "sha", content: "" }, atual));
});

test("conflito exige releitura das fontes e encerra após três tentativas", () => {
  assert.equal(conferirCommit({ statusCode: 409 }), true);
  assert.throws(
    () => prepararCommit(arquivo, { ...atual, numero_turma: 64 }, 3),
    /tentativas/,
  );
  const novoArquivo = {
    sha: "sha-mais-recente",
    content: arquivo.content,
  };
  assert.equal(
    prepararCommit(novoArquivo, { ...atual, numero_turma: 64 }, 1).sha,
    "sha-mais-recente",
  );
});

test("sucesso encerra e erros de permissão ou servidor interrompem o fluxo", () => {
  assert.equal(conferirCommit({ statusCode: 200 }), false);
  assert.equal(conferirCommit({ statusCode: 201 }), false);
  for (const statusCode of [401, 403, 404, 422, 500]) {
    assert.throws(
      () => conferirCommit({ statusCode }),
      new RegExp(String(statusCode)),
    );
  }
});
