import AnamneseWizardForm from "components/anamneses/AnamneseWizardForm";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { Navigate } from "react-router-dom";
import { LINK } from "utils/link";

export default function AnamneseWizardPage() {
  const { user } = useAuth();
  if ((user?.nivel ?? 0) > ALUNO_NIVEL_MAX) {
    return <Navigate to={LINK("/")} replace />;
  }

  return <AnamneseWizardForm />;
}
