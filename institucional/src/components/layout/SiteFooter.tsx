import { Container } from "@/components/ui/Container";
import { footerNav } from "@/content/navigation";
import { contact, links, site } from "@/content/site";
import { asset } from "@/lib/asset";

/**
 * Os canais que a landing page da escola de fato divulga. Havia um LinkedIn
 * aqui, com uma URL deduzida do nome da instituição, e ela não aparece em lugar
 * nenhum da página em produção: saiu. No lugar entrou o Spotify, que aparece.
 */
const social = [
  { label: "Instagram", href: links.instagram },
  { label: "YouTube", href: links.youtube },
  { label: "Spotify", href: links.spotify },
];

export function SiteFooter() {
  return (
    <footer className="border-ink-line bg-ink text-mist border-t">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-6">
            <img
              src={asset("/logos/auvp-escola-serif-olho-branca.svg")}
              alt="AUVP Escola de Investimentos"
              width={1237}
              height={203}
              loading="lazy"
              // Pela largura, não pela altura: com o olho o logo ficou mais
              // largo que a coluna entre 1024 e 1440px, e com altura fixa ele
              // era espremido na horizontal.
              className="h-auto w-72 max-w-full md:w-80"
            />
            <p className="max-w-[30ch] text-sm leading-relaxed">
              {site.tagline}. Fundada em {site.foundingYear} por {site.founder}.
            </p>
            <p className="eyebrow text-mist/80">{contact.address}</p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="eyebrow text-yellow mb-5">{group.title}</h2>
              <ul className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <li key={`${group.title}-${item.label}`}>
                    <a
                      href={item.href}
                      className="hover:text-paper text-sm transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Canais">
            <h2 className="eyebrow text-yellow mb-5">Canais</h2>
            <ul className="flex flex-col gap-3">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper text-sm transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-paper text-sm transition-colors duration-300"
                >
                  {contact.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-ink-line text-mist/80 mt-14 flex flex-col gap-4 border-t pt-8 text-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>
              © {new Date().getFullYear()} {site.legalName}. Todos os direitos
              reservados.
            </p>
            {/* Documentos legais da instituição, nos endereços que a página em
                produção usa. Ficam na régua de baixo, junto do aviso de risco,
                porque é ali que quem procura por eles olha. */}
            <a
              href={links.terms}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-paper underline underline-offset-4 transition-colors duration-300"
            >
              Termos de uso
            </a>
            <a
              href={links.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-paper underline underline-offset-4 transition-colors duration-300"
            >
              Política de privacidade
            </a>
            <a
              href={links.reportChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-paper underline underline-offset-4 transition-colors duration-300"
            >
              Canal de Denúncias
            </a>
            <p>
              {site.razaoSocial} · CNPJ: {site.cnpj}
            </p>
          </div>
          <p className="max-w-[62ch] leading-relaxed">
            Conteúdo de caráter educacional. A AUVP não realiza recomendação
            personalizada de investimentos nesta página. Rentabilidade passada
            não é garantia de rentabilidade futura.
          </p>
        </div>
      </Container>
    </footer>
  );
}
