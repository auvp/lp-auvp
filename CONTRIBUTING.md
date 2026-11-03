# Como contribuir

## Antes de começar

Leia o documento correspondente ao que você vai mexer:

- texto, número ou link → [docs/CONTENT.md](docs/CONTENT.md)
- foto → [docs/ASSETS.md](docs/ASSETS.md)
- cor, tipografia, espaçamento → [docs/BRAND.md](docs/BRAND.md)
- estrutura ou componente → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Fluxo

```bash
git checkout -b tipo/descricao-curta
# ... suas alterações ...
npm run check
git commit -m "tipo: o que mudou"
git push -u origin tipo/descricao-curta
```

Abra o PR para `main`.

### Prefixos

| Prefixo    | Uso                                     |
| ---------- | --------------------------------------- |
| `conteudo` | Texto, número, link, pergunta de FAQ    |
| `foto`     | Imagem nova, recorte, substituição      |
| `feat`     | Dobra, componente ou comportamento novo |
| `fix`      | Correção                                |
| `estilo`   | Ajuste visual sem mudança de conteúdo   |
| `docs`     | Documentação                            |
| `chore`    | Dependência, configuração, ferramenta   |

Mensagem no imperativo e em português: `conteudo: atualiza numeros do 3o
trimestre`, `foto: adiciona registros do Private Day 2025`.

## Antes de abrir o PR

```bash
npm run check
npm run build
```

Os dois precisam passar. A CI roda exatamente isso.

E confira você mesmo:

- [ ] Nenhum texto de exemplo ou lorem ipsum sobrou
- [ ] Toda imagem nova tem `alt` descritivo em português
- [ ] Foto nova passou no `npm run esquadro` (ver `docs/ASSETS.md`)
- [ ] Percorri a alteração com `Tab` e o foco está sempre visível
- [ ] Conferi em 390px de largura, não só no desktop
- [ ] Nenhuma cor nova fora dos tokens de `globals.css`
- [ ] Nenhum `border-radius`, sombra ou emoji (ver `docs/BRAND.md`)
- [ ] Nenhum título ou parágrafo terminando com uma palavra sozinha na linha

## Sem palavra órfã

Título ou parágrafo que termina com uma palavra sozinha na última linha
("Seu caminho começa pela / Escola") não vai ao ar. A regra é de CSS e vale
para o site inteiro:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  text-wrap: balance;
} /* linhas de largura parecida */
p,
li,
blockquote,
figcaption,
dd,
dt {
  text-wrap: pretty;
} /* sem órfã */
```

Ela já está no CSS de base de cada parte do site: `comum/base.css` (páginas
vindas do WordPress), `auvp-sempre/style.css`, `escola/src/style.css`,
`institucional/src/globals.css` e no `<style>` das aulas de `a/`. **Página nova
precisa carregar um desses arquivos ou trazer a regra no próprio CSS.** O
`npm run build` confere todas as páginas do site montado e falha, com a lista
das que estão sem a regra (`scripts/lib/tipografia.mjs`).

- Não desligue a regra num elemento (`text-wrap: wrap`) para "caber". Se um
  título não fica bom equilibrado, o texto é que precisa mudar.
- Quebra manual com `<br>` só onde a quebra faz parte do texto (dois versos,
  duas frases). Para evitar órfã, não: em outra largura de tela ela cria o
  problema que queria resolver.
- Navegador antigo, sem suporte a `text-wrap`, quebra a linha como sempre
  quebrou. Nada some nem desalinha.

## O que uma revisão vai olhar

**Em mudança de conteúdo:** se o tom continua institucional, se não há promessa
de rentabilidade, se número novo tem fonte, se o texto continua compatível com o
aviso legal do rodapé.

**Em mudança visual:** se respeita os tokens, se a alternância de fundo da página
continua íntegra, se o contraste passa AA, se o movimento respeita
`prefers-reduced-motion`.

**Em mudança estrutural:** se o componente novo poderia ser Server Component, se
o conteúdo foi para `institucional/src/content/` em vez de ficar no JSX, se o HTML é semântico.

## Ordem das dobras

A sequência em `institucional/src/App.tsx` segue o roteiro aprovado e **não deve ser
alterada sem alinhamento com marketing**. Cada dobra pressupõe o argumento da
anterior: a garantia só faz sentido depois do processo; os ETFs só fazem sentido
depois do método.
