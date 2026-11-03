# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Não publicado]

### Sem palavra órfã (nov/2026)

- **Regra do repositório:** títulos com `text-wrap: balance` e texto corrido
  com `text-wrap: pretty` no CSS de base de todas as partes do site. O
  `npm run build` falha se alguma página publicada ficar sem a regra. Ver
  CONTRIBUTING.md.

### Novas páginas (out/2026)

- **`/wpp/`**: cópia da LP da Escola montada pelo build. Em dia útil, o
  `wpp-routing.js` troca os botões do formulário pelo WhatsApp, como no
  auvp.com.br/wpp/.
- **`/a/<aula>/`**: as nove aulas gratuitas em vídeo (VTurb), sem indexação.
  Favicon e imagem de compartilhamento passam a vir de `comum/`, em vez do
  `wp-content` do WordPress; cada aula ganhou `<main>` e título `h1` para
  leitores de tela.

### Pendências da auditoria (out/2026)

- **Informações padronizadas pela página da Escola**: preço R$ 2.997 nos
  dados estruturados, comunidade de 35 mil alunos ativos, Termos com "mais de
  100 aulas" e atualizações semanais ao vivo.
- **Nosso processo atualizado**: as quatro etapas da metodologia, Plano de
  Estudos, eBooks, ferramentas pelo nome, cartão AUVP, validade da garantia e
  o formulário oficial de análise de perfil.
- **DO NOT SCARE como titular** nos rodapés e nos dados estruturados; Termos
  e Política linkados nas próprias páginas do site.
- **AUVP Sempre** com canonical em auvp.com.br/auvp-sempre/.
- **Imagem de compartilhamento e descrição próprias** em todas as páginas; o
  build converte a og:image para endereço absoluto.
- **Imagens da Escola no repositório**: ferramentas da metodologia (a da
  Analítica tinha 3,4 MB) e capas dos módulos extras, que vinham do WordPress.
- AUVP Business removido de Quem somos; AUVP News, App Store, âncoras dos ETFs
  e erros de texto corrigidos; contraste, links sublinhados, carrossel
  focável, títulos e botões ajustados.

### Desempenho e acessibilidade (auditoria do PageSpeed, out/2026)

- **Fontes servidas pelo site**: Sentient na institucional e Anek Latin na
  Escola deixam de vir da Fontshare e do Google Fonts. Na Escola, reservas
  em Arial com as medidas de cada fonte evitam que a página pule quando a
  fonte chega.
- **Imagens no tamanho da tela**: `srcset` nas fotos da institucional
  (`npm run imagens -w institucional`) e fundo da dobra inicial e foto da
  AUVP Capital da Escola servidos pelo site, com proporção correta.
- **Acessibilidade**: abas do FAQ da institucional, contraste de rótulos,
  selos e botões, títulos em ordem e links com nome próprio.
- **Cabeçalhos de segurança e cache longo** dos arquivos com hash no
  `vercel.json`.

### Adicionado (testes A/B)

- **Testes A/B por `experiments.json`**, divididos na Vercel por
  `middleware.js`: cookie `ab_<id>`, `?ab=a|b` para ver uma versão sem entrar
  na divisão e redirecionamento de `b.html` para a página. O build falha se um
  teste não tiver `b.html`, se um `b.html` não tiver teste ou se o canonical
  das duas versões for diferente. Ver [docs/AB-TESTING.md](docs/AB-TESTING.md).
- **Primeiro teste, `escola-institucional`:** na raiz, metade vê a LP da
  Escola (A) e metade a institucional (B), por 30 dias.

### Alterado (raiz)

- **A LP da Escola passa para a raiz do site (`/`)** e o índice de páginas
  (`indice/`) sai. `/escola/` redireciona para `/`. A lista de páginas, com os
  links da homologação, fica no README.

### Alterado

- **Repositório unificado com a LP da Escola.** O site publicado passa a ter três
  endereços: o índice em `/`, esta página em `/institucional/` e a landing da
  Escola em `/escola/`. Cada página vive na sua pasta, com um único
  `npm ci` para tudo (npm workspaces). Ver [docs/DEPLOY.md](docs/DEPLOY.md).
- **Next.js trocado por Vite + React.** Os componentes seguem os mesmos; saiu
  só o que era do Next (`next/image`, `next/link`, `next/font`, `layout.tsx`,
  `robots.ts`, `sitemap.ts`). A página continua chegando pré-renderizada, agora
  por `institucional/scripts/build.mjs`.
- **Publicação também na Vercel**, por `vercel.json`, a partir do mesmo `dist/`
  do GitHub Pages.

### Adicionado

- **Contagem regressiva na dobra de encerramento**, na coluna da esquerda, com
  o convite na da direita. Conta o fim das inscrições da próxima turma. É a única da página e a única permitida: some sozinha
  quando a data passa ou sai do conteúdo, não pisca nem muda de cor, e entrega
  a data por extenso a leitor de tela em vez do tique-taque. Com
  `prefers-reduced-motion` os segundos somem e o relógio anda de meio em meio
  minuto. **A data em `src/content/closing.ts` é provisória e precisa da real.**

- **Fotografia própria na abertura**: o auditório lotado do Private Day, com
  4783px de largura no negativo. Encerra a última reserva de foto de dobra
  interna: a anterior tinha 1616px, no limite para sangria total, e era o mesmo
  negativo da dobra da comunidade. O sujeito fica no eixo central, que é a
  faixa onde o hero não põe texto, então o arquivo entra sem recorte.

- **A barra pousa na régua do hero antes de encaixar no topo.** Existe um menu
  só: sobre a primeira dobra a barra desce até a régua e fica apoiada ali, sem
  fundo, com logo e botão invisíveis mas ainda ocupando a grade. Entre um estado
  e o outro os itens não se movem um pixel na horizontal e não mudam de corpo,
  porque são os mesmos elementos. Só a cor muda.
- `Figure` aceita `frameClassName`, para a moldura largar a proporção fixa onde
  a dobra precisar.

### Corrigido

- **A fotografia da sede aparecia quase quadrada**, cortando um terço da
  largura de um quadro 16:9. A moldura copia a altura da coluna de texto ao
  lado, então o texto foi enxugado, sem perder nenhum fato, e a coluna da
  imagem cresceu: a moldura passou de 1,14 para 1,42.
- **A mesma dobra ficava pior em 1024px do que em 1440**: a coluna de texto
  caía para 361px, o que a deixava com 616px de altura, e a moldura virava um
  retrato de 0,88. As duas colunas agora só valem a partir de `xl`; abaixo
  disso a dobra empilha e a fotografia ocupa a largura inteira.
- **Os itens do menu quebravam em duas linhas entre 1024 e 1180px.** Nessa
  faixa eles entram menores e mais juntos, e voltam ao corpo cheio em `xl`.
- **A barra mudava de conteúdo entre os dois estados.** Sobre o hero ela
  escondia o logo e o botão da área do aluno, e ficava dentro do `Container`
  enquanto a régua da dobra corria de ponta a ponta: nada batia. Agora a barra é
  a mesma nos dois estados, em largura total, e a única diferença é o que existe
  atrás dela: filete sobre o hero, fundo de papel depois. A borda de baixo é o
  mesmo elemento, então a linha e o pé do fundo caem no mesmo ponto da grade.
- **A assinatura do hero empurrava o menu para baixo.** Com 640px de largura ela
  jogava a barra para 318px do topo. Agora tem 384px, e a barra pousa em 226px.
- A fotografia da sede terminava mais de 100px antes do último parágrafo ao
  lado. A partir de `lg` ela passa a ter a altura da coluna de texto.
- As logos dos apoiadores voltam para uma fileira só, agora em escala de cinza:
  quatro paletas de quatro donos diferentes eram a área mais colorida de uma
  página de três cores.
- **A régua do hero e a barra se separavam em até 10px no meio da rolagem**, e o
  menu flutuava acima da própria linha. A causa era o deslocamento de 72px da
  camada de texto do hero: a régua vive dentro dela e a barra não. O
  deslocamento saiu; a dissolução ficou.

### Removido

- Os dois botões "Veja tudo que está incluído no treinamento" da dobra do
  conteúdo programático.

- `private-day-palco.webp`, o antigo fundo do hero, sem uso depois da troca.
- **Assinatura AUVP em corpo grande do hero.** A barra fixa logo acima carrega o
  mesmo logotipo, então a marca aparecia duas vezes na mesma dobra, e a de baixo
  empurrava o menu para longe do topo. Com ela saiu a viagem da barra até a
  âncora: sem nada para pousar embaixo, mover a barra era movimento sem motivo.
- `AuvpLettering`, que ficou sem uso. Os contornos continuam em
  `public/logos/auvp-monograma.svg`.
- Botão do WhatsApp da primeira dobra. Ele entra a partir da segunda, pelo mesmo
  limite geométrico que troca o fundo da barra.
- Deslocamento vertical da camada de texto do hero. A profundidade da abertura
  fica por conta do `HeroBackdrop`, que não tem nada preso a ele.
- Deriva da assinatura do hero em resposta ao ponteiro. A marca da instituição
  ganhava comportamento de enfeite, que é a mesma razão pela qual o objeto WebGL
  foi recusado antes dela.
- Barra fixa sobre a primeira dobra. Sobra o botão de gaveta, sem barra atrás.
- `Wordmark`, que ficou sem uso: o hero usa `AuvpLettering` direto.

### Alterado

- O botão da dobra da comunidade passa de "Conheça nossos alunos" para "Faça
  parte de nossa comunidade".

- O hero larga o `Container` e passa a `px-6 md:px-10 lg:px-14`. É a única dobra
  da página que faz isso, e é de propósito: as réguas dele são a moldura da
  capa, e moldura que para a 152px da borda é caixa, não moldura.

### Adicionado

- **O hero vira uma capa.** Fotografia em sangria total, a assinatura da marca
  em corpo arquitetônico no alto e o título partido nas duas pontas da linha de
  base. Embaixo, uma régua separa o texto de apoio do único botão. Referência
  aprovada: a abertura da Lionheart.
- Deriva de poucos pixels na assinatura do hero, em resposta ao ponteiro. Só em
  ponteiro fino e sem `prefers-reduced-motion`.
- Cor de identidade de cada ETF no subtítulo do fundo: verde no AUVP11, rosa no
  AUPO11, azul no AREA11, amarelo no ABTC11. Valem só ali, e não abrem
  precedente contra a regra de paleta.
- Logo do CEIA na dobra de apoiadores, o único arquivo local do conjunto.
- Fotografia de relações internacionais: entrevista do AUVP Atlas com
  embaixador. Era a última reserva de dobra interna.

### Corrigido

- **As logos de apoiador apareciam com metade da altura pedida.** Numa fileira
  de quatro, cada célula media 134px e o `max-w-full` encolhia as logos largas:
  a restrição era de largura, não de altura. Agora são duas fileiras de duas.
- A foto da AUVP Experience ficava 162px à esquerda do centro da moldura. O
  recorte novo centra o grupo e ainda descarta céu e asfalto vazios.

- **A página usava duas larguras de container.** As dobras com a variante larga
  começavam 96px mais à esquerda, e a borda do texto saltava a cada dobra
  durante a rolagem. Agora é uma largura só, e todos os títulos alinhados à
  esquerda partem do mesmo ponto.
- O título de "Iniciativas" ficava indentado sobre uma coluna vazia: o rail
  existia para segurar o rótulo que foi removido das dobras.
- Faixas curtas voltam a ter menos respiro que as dobras longas, agora por uma
  prop `compact` em vez de `className`, que perdia na ordem do CSS gerado.

### Removido

- Assinatura gigante do rodapé.
- Curva de crescimento do hero, junto com o texto centralizado que ela
  acompanhava. Sobre a foto em sangria total ela virava ruído, e uma curva de
  crescimento a poucos pixels de um botão sempre corre o risco de ser lida como
  promessa de rentabilidade.
- `LineReveal` e `canRunWebGL`, que ficaram sem uso.

### Alterado

- Seis fotografias publicadas: as duas restantes do Private Day, CEIA, BTG
  Pactual, AUVP Experience e a listagem do AUVP11 na B3. Restam duas reservas,
  as duas com foto publicada que já funciona.
- A foto de palestras do Private Day passa a fechar na poltrona amarela: o
  plano aberto do mesmo negativo agora abre a página.
- Cada recorte foi escolhido olhando a imagem, e está registrado em
  `docs/ASSETS.md` para poder ser refeito.

### Alterado

- **Nosso processo vira uma linha do tempo vertical.** Trilho que preenche com
  a rolagem, três nós numerados que acendem ao cruzar a faixa central da tela, e
  os itens de cada etapa listados ao lado do nó.
- O botão da Análise de Perfil dá lugar a um balão que acompanha o ponteiro, e
  a dobra inteira passa a levar à Análise. Teclado e toque têm caminhos
  próprios, descritos em `docs/ACCESSIBILITY.md`.

### Corrigido

- O filete de progresso do cabeçalho nunca apareceu desde que foi criado: a
  classe `scale-x-0` do Tailwind v4 escreve na propriedade `scale`, que se
  multiplica com o `transform` escrito pelo rAF e o zerava. O trilho da linha do
  tempo nasceu com o mesmo defeito.

### Alterado

- A assinatura decorativa do hero e do rodapé passa a usar **as letras do
  arquivo da marca**, e não a palavra "AUVP" composta na fonte de display. O A
  da AUVP é um V invertido, sem travessão, e nenhuma fonte entrega essa letra
  digitando "A".
- No rodapé, o logo alinha pela esquerda com o texto abaixo dele: o `flex-col`
  esticava o `<svg>`, que passou a obedecer à largura esticada em vez da própria.

### Adicionado

- Primeira fotografia real da dobra de comunidade: o plano aberto do salão do
  Private Day, em largura total. As duas ao lado dela continuam como reserva.
- `acervo/originais/`, com os arquivos em resolução cheia como vieram do CDN.

### Alterado

- Dobra de missão perde os dois parágrafos de fecho, sobre o princípio fundador,
  e volta a exibir a fotografia da fachada da sede, que estava arquivada.
- **Apoiadores deixam de ser carrossel.** São quatro, e quatro cabem na tela:
  título de um lado, as quatro logos do outro, maiores e em cor própria. Com
  poucos itens, o carrossel passava a mesma marca duas vezes por ciclo e ainda
  escondia parte do conjunto a cada instante.

### Alterado

- **Serifa do site passa a ser a Sentient**, a mesma do logotipo, no lugar da
  Cormorant Garamond. Vem do CDN da Fontshare, como a landing de produção já faz
  com a Satoshi.
- **Etiqueta antes do título removida de todas as dobras.** Sobrou o
  `GroupLabel`, sem filete, onde o rótulo nomeia um grupo de cards e não repete
  o título ao lado.
- Logo do cabeçalho e do rodapé em corpo maior; a barra fixa cresceu junto, e o
  deslocamento de âncora acompanhou.
- **Conteúdo programático refeito** na mecânica da landing da AUVP Advisors:
  coluna fixa à esquerda, oito módulos rolando à direita, numeral vazado que
  preenche ao cruzar o meio da tela. A grade com descrição no hover saiu: ela
  escondia sete oitavos do conteúdo atrás de um gesto que não existe no celular.
- Logos de BTG Pactual, Governo de Goiás e R7 passam a aparecer no carrossel,
  servidas pelo CDN da AUVP enquanto os arquivos não são baixados.

### Alterado

- **Paleta refeita nas três cores da escola: amarelo, branco e preto.** O
  azul-marinho e o ouro fosco saíram por inteiro, inclusive dos cinzas de apoio,
  que tinham viés frio. O amarelo obedece a uma regra de contraste: acento sobre
  preto, preenchimento sólido sobre branco, nunca texto nem filete sobre branco.
- Faixa de garantia passa a ser o único bloco amarelo de área grande da página.
- Rótulo de seção passa de versalete em sans para serifa itálica. O versalete
  continua nos micro-rótulos.
- Botões passam a pílula. Quatro das cinco referências fazem isso.
- Títulos de seção ganham variante com o rótulo em coluna estreita à esquerda.
- **Todas as fotografias mockadas.** Cada lugar que receberá imagem exibe uma
  reserva com o briefing do que produzir. As fotos do site anterior foram para
  `acervo/fotos/`, fora do que é publicado.
- Nenhum travessão em texto, comentário ou documentação do repositório.

### Adicionado

- Assinatura tipográfica em escala arquitetônica no hero e no rodapé, cortada
  pela borda, no recurso usado por Oxford e Lionheart.
- Reserva de fundo para as dobras em que a foto ocupa a seção inteira.
- Publicação automática no GitHub Pages a cada push na `main`, via
  `.github/workflows/deploy.yml`. O `basePath` e a URL canônica vêm da action
  `configure-pages`, então migrar para domínio próprio não exige mudança de
  código.
- Export estático (`output: "export"`, `trailingSlash`, `images.unoptimized`).
- `src/lib/asset.ts`, que prefixa caminhos de `/public` com o `basePath`. O
  `next/image` não faz isso quando `unoptimized` está ligado, e sem o helper toda
  imagem daria 404 sob subcaminho.

### Alterado

- Fotografias redimensionadas para o tamanho de uso, já que a hospedagem
  estática não otimiza imagem: a pasta `public/` caiu de 1,9 MB para 416 KB.
- Acervo do site antigo movido de `public/images/legacy/` para `acervo/legado/`,
  fora do que é publicado.
- `robots.ts` e `sitemap.ts` marcados como `force-static`, exigência do export.

## [0.1.0] · página institucional

### Adicionado

- Estrutura inicial do projeto: Next.js 16, TypeScript, Tailwind CSS 4.
- Página institucional completa, com as onze dobras do roteiro aprovado.
- Sistema de design em `globals.css`: paleta de papel, tinta e ouro fosco;
  Cormorant Garamond para display e Inter para texto.
- Camada de conteúdo em `src/content/`, com todo o texto da página tipado e
  editável sem tocar em componentes.
- Oito ícones de módulo desenhados em traço fino, substituindo os cards do
  branding antigo.
- Componente `Figure` com reserva editorial para fotografia ainda não produzida.
- Dado estruturado `EducationalOrganization` e `FAQPage`, `sitemap.xml` e
  `robots.txt`.
- Documentação: marca, conteúdo, acervo de imagens, arquitetura, acessibilidade,
  publicação e contribuição.
- CI no GitHub Actions: tipos, lint, formatação e build.
- Camada de movimento em `src/components/motion/`: rolagem com inércia (Lenis),
  saída do hero em duas velocidades, revelação por linha da headline, contagem
  crescente dos números institucionais, paralaxe nas fotografias, filete de
  progresso no cabeçalho e marcação da dobra ativa no menu. Tudo desligado sob
  `prefers-reduced-motion`.

### Removido

- Monograma 3D em WebGL no hero (three.js). O sólido competia com a tipografia e
  lia como logo animado. Decisão registrada em `docs/ARCHITECTURE.md`.

### Observações

- Sete fotografias e quatro logos de parceiros ainda pendentes de produção. Ver
  `docs/ASSETS.md`.
- Imagens do site anterior arquivadas em `public/images/legacy/`, fora de uso.
