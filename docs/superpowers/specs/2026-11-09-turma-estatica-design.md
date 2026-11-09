# Dados de turma incorporados ao site

Directus continua sendo a fonte dos dados. Quando ele envia o webhook existente,
o n8n consulta os valores atuais e atualiza somente `dados/turma.json` em
`auvp/lp-auvp`, na `main`. O commit aciona os workflows de publicação existentes.
Home e institucional incorporam o mesmo JSON no build, sem consulta no navegador.

## Abordagens

- **JSON versionado (escolhido pelo usuário):** histórico, rollback e build sem
  acesso ao CMS; exige credencial GitHub com Contents: write no n8n.
- Consulta durante o build: dispensa commit, mas depende do CMS em cada build e
  não registra os valores no Git.

## Contrato

`proxima_turma` é uma data ISO com fuso explícito; datas do Directus sem fuso
recebem `-03:00`. `numero_turma` é inteiro positivo e `numero_alunos` é inteiro
não negativo. O build rejeita dados inválidos. A home já recebe os números no
HTML; o JavaScript atualiza apenas o contador. O institucional mantém a ocultação
do contador vencido e a acessibilidade existente.

O n8n não grava dados de fallback: consulta estrita, compara o conteúdo e só cria
commit se houver mudança. O SHA do arquivo protege contra gravações concorrentes;
conflitos exigem reler GitHub e Directus antes de tentar novamente, com limite.
Tokens ficam nas credenciais do n8n. O webhook atual e seu cache são preservados.

## Publicação

Preparar e verificar código, testes e ajuste do workflow antes da ativação.
A automação de escrita só deve entrar em produção depois que o JSON e os
consumidores estiverem na `main`. O build e o deploy atuais continuam responsáveis
por publicar e invalidar o CloudFront. Falhas conservam a última versão publicada.
