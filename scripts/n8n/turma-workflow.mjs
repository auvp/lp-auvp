import { validarTurma, normalizarTurma } from "../lib/turma.mjs";
import { prepararCommit, conferirCommit } from "./turma-commit.mjs";

export const nomeLeitura = "Ler JSON da turma no GitHub";
export const arquivoGitHub =
  "https://api.github.com/repos/auvp/lp-auvp/contents/dados/turma.json";

const headers = {
  parameters: [
    { name: "Accept", value: "application/vnd.github+json" },
    { name: "X-GitHub-Api-Version", value: "2026-03-10" },
  ],
};
const autenticacao = {
  authentication: "genericCredentialType",
  genericAuthType: "httpBearerAuth",
  sendHeaders: true,
  headerParameters: headers,
};

/** As funções testadas são incorporadas literalmente aos Code nodes. */
export function nosTurma(fonteDirectus) {
  if (!fonteDirectus)
    throw new Error("Informe o webhook de turma fora do Git.");
  const fonte = new URL(fonteDirectus);
  fonte.searchParams.set("strict", "1");
  return [
    {
      name: nomeLeitura,
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.3,
      position: [1008, 560],
      parameters: {
        ...autenticacao,
        url: `${arquivoGitHub}?ref=main`,
        options: {
          timeout: 15000,
          response: { response: { responseFormat: "json" } },
        },
      },
    },
    {
      name: "Consultar turma atual no Directus",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.3,
      position: [1248, 560],
      parameters: {
        url: fonte.href,
        options: {
          timeout: 20000,
          response: { response: { responseFormat: "json" } },
        },
      },
    },
    {
      name: "Preparar commit da turma",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1488, 560],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: [
          validarTurma.toString(),
          normalizarTurma.toString(),
          prepararCommit.toString(),
          `const commit = prepararCommit($('${nomeLeitura}').last().json, $input.first().json, $runIndex);`,
          "return commit ? [{ json: commit }] : [];",
        ].join("\n\n"),
      },
    },
    {
      name: "Atualizar JSON da turma no GitHub",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.3,
      position: [1728, 560],
      parameters: {
        ...autenticacao,
        method: "PUT",
        url: arquivoGitHub,
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ $json }}",
        options: {
          timeout: 15000,
          response: {
            response: {
              responseFormat: "json",
              fullResponse: true,
              neverError: true,
            },
          },
        },
      },
    },
    {
      name: "Conferir atualização da turma",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1968, 560],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: `${conferirCommit.toString()}\n\nreturn conferirCommit($input.first().json) ? [{ json: {} }] : [];`,
      },
    },
  ];
}

/** SDK para validar isoladamente a cadeia adicionada ao workflow existente. */
export function codigoSdk(fonteDirectus) {
  const nos = nosTurma(fonteDirectus);
  const linhas = [
    "import { workflow, node, trigger, newCredential } from '@n8n/workflow-sdk';",
    "const inicio = trigger({ type: 'n8n-nodes-base.manualTrigger', version: 1, config: { name: 'Testar atualização' } });",
  ];
  nos.forEach((no, i) => {
    const config = JSON.stringify({
      name: no.name,
      parameters: no.parameters,
      position: no.position,
    });
    const cred = no.parameters.authentication
      ? ", credentials: { httpBearerAuth: newCredential('GitHub Actions - LP AUVP') }"
      : "";
    linhas.push(
      `const n${i} = node({ type: '${no.type}', version: ${no.typeVersion}, config: { ...${config}${cred} } });`,
    );
  });
  linhas.push(
    "export default workflow('lp-auvp-turma-json', '[LP AUVP] Atualizar JSON da turma').add(inicio).to(n0).to(n1).to(n2).to(n3).to(n4).add(n4).to(n0);",
  );
  return linhas.join("\n");
}
