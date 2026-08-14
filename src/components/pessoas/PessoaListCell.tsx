import { contatoWhatsappUrl, formatPessoaDisplay } from "utils/pessoas/masks";

type Props = {
  nome: string;
  cpf_cnpj?: string | null;
  email?: string | null;
  contato?: string | null;
};

export default function PessoaListCell({ nome, cpf_cnpj, email, contato }: Props) {
  const whatsappUrl = contatoWhatsappUrl(contato);
  const emailUrl = email ? `mailto:${email}` : null;
  const contatoDisplay = contato ? formatPessoaDisplay("contato", contato) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span style={{ fontWeight: 600 }}>
        {nome}
        {cpf_cnpj ? (
          <>
            {" - "}
            <span style={{ fontWeight: 400, fontSize: 13, opacity: 0.82 }}>
              {formatPessoaDisplay("cpf_cnpj", cpf_cnpj)}
            </span>
          </>
        ) : null}
      </span>

      <span style={{ fontSize: 13, color: "#555", margin: "2px 0" }}>
        {emailUrl ? (
          <a href={emailUrl} style={{ color: "#1976d2", textDecoration: "none", marginRight: 10 }}>
            {email}
          </a>
        ) : (
          email
        )}
        {whatsappUrl && contatoDisplay ? (
          <>
            {" - "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#25D366", textDecoration: "none" }}
            >
              {contatoDisplay}
            </a>
          </>
        ) : (
          contatoDisplay && ` - ${contatoDisplay}`
        )}
      </span>
    </div>
  );
}
