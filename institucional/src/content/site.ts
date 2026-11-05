/**
 * Dados institucionais da AUVP.
 *
 * Fonte única de verdade para nome, contatos, links externos e metadados de
 * SEO. Ao alterar qualquer URL aqui, confira também `src/content/navigation.ts`
 * e o JSON-LD em `src/app/layout.tsx`.
 */

import { comUtm } from "@/lib/utm";

export const site = {
  name: "AUVP",
  legalName: "AUVP Educação Financeira",
  razaoSocial: "DO NOT SCARE SOLUÇÕES INTERATIVAS LTDA",
  cnpj: "38.099.091/0001-37",
  shortName: "AUVP Escola de Investimentos",
  tagline: "A maior escola de investimentos do Brasil",
  description:
    "A AUVP forma investidores independentes, capazes de tomar suas próprias " +
    "decisões financeiras e construir patrimônio com autonomia. Uma instituição " +
    "criada para mudar a relação do brasileiro com o dinheiro.",
  foundingYear: 2020,
  founder: "Raul Sena",
  locale: "pt-BR",
  /**
   * URL canônica, sem barra no final. Precisa incluir o `basePath` quando o
   * site é servido sob subcaminho. É daqui que saem canonical, Open Graph,
   * sitemap.xml e robots.txt. Vem de `VITE_SITE_URL`, que o build da raiz
   * define a partir do destino (Pages ou Vercel). Ver docs/DEPLOY.md.
   */
  url: import.meta.env.VITE_SITE_URL,
} as const;

/**
 * Endereços externos.
 *
 * Todos vieram do `index.html` de `ProdutosAUVP/lp-auvp-escola-prod`, que é a
 * landing page da escola no ar. Antes daqui saíam URLs no formato
 * `auvp.com.br/<coisa>`, que é um padrão plausível e que a instituição não usa:
 * o checkout mora num formulário, a área do aluno tem domínio próprio, os ETFs
 * também, e os produtos da Capital ficam sob `auvpcapital.com.br`. Link
 * institucional quebrado custa mais do que link ausente.
 *
 * **Ao mexer aqui, a fonte é a página em produção, não a dedução.** Se um
 * endereço não existir lá, ele não entra: o componente que precisaria dele
 * aceita `href` ausente e simplesmente não vira link.
 */
export const links = {
  /** O checkout da escola é um formulário, não uma página de venda. */
  profileAnalysis: "https://form.auvp.com.br/to/DSo4JgH8",
  studentArea: "https://www.aulasauvp.com.br/start",
  community: "https://comunidade.auvp.com.br/",
  /** Com `utm_source`, como os produtos: ver `src/lib/utm.ts`. */
  etfs: comUtm("https://www.auvpetfs.com.br/"),
  /**
   * Encurtador da própria AUVP que abre a conversa no WhatsApp, e não um
   * `wa.me` com o número cru: assim o atendimento pode trocar de número sem
   * que esta página precise de deploy.
   */
  whatsapp: "https://sard.ink/leadduvida",
  terms: "../termos-de-uso/",
  privacy: "../politica-de-privacidade/",
  /** Canal único do grupo: mesmo texto e mesma URL em todos os sites. */
  reportChannel: "https://auvp.canaldenuncias.com.br/",
  instagram: "https://www.instagram.com/auvpcapital",
  youtube: "https://www.youtube.com/@AUVPCapital",
  spotify:
    "https://open.spotify.com/show/4FUAeRg9G0ntPVDuC8Zpjp?si=353f3c809d6b468c",
} as const;

export const contact = {
  whatsappLabel: "Falar com a AUVP no WhatsApp",
  address: "Goiânia · Goiás · Brasil",
  email: "fale@auvp.com.br",
} as const;
