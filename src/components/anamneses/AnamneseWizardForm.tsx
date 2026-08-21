import { Alert, Box, Button } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAnamnese, findAnamnese } from "api/anamneses";
import AnamneseFields from "components/anamneses/AnamneseFields";
import AnamneseStepCarousel from "components/anamneses/AnamneseStepCarousel";
import Icon from "components/Icon";
import { ANAMNESE_STEPS } from "domain/anamneses/constants";
import { mergeAnamneseRespostas, parqComplete } from "domain/anamneses/formatters";
import { AnamneseRespostas, emptyAnamneseRespostas } from "domain/anamneses/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";
import { pessoaSectionSx } from "utils/pessoas/styles";

const BTN = { width: 140, height: 40 } as const;

export default function AnamneseWizardForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AnamneseRespostas>(emptyAnamneseRespostas);

  const { data: existing } = useQuery({
    queryKey: ["anamneses", "self"],
    queryFn: () => findAnamnese(),
  });

  useEffect(() => {
    if (!existing) return;
    setForm(mergeAnamneseRespostas(existing));
    setStarted(true);
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: (finalizar: boolean) =>
      addAnamnese({ parq: form.parq, respostas: form, finalizar }),
    onSuccess: async (_data, finalizar) => {
      await queryClient.invalidateQueries({ queryKey: ["anamneses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (finalizar) {
        toast.success("Questionário enviado.");
        navigate(LINK("/"));
        return;
      }
      toast.success("Respostas salvas.");
    },
    onError: (_err, finalizar) => {
      toast.error(finalizar ? "Não foi possível enviar o questionário." : "Não foi possível salvar.");
    },
  });

  const last = step === ANAMNESE_STEPS.length - 1;
  const current = ANAMNESE_STEPS[step];

  function goNext() {
    if (current.key === "saude" && !parqComplete(form.parq)) {
      toast.error("Responda todas as perguntas do PAR-Q.");
      return;
    }
    if (!last) setStep((currentStep) => currentStep + 1);
  }

  function goBack() {
    if (step === 0) {
      setStarted(false);
      return;
    }
    setStep((currentStep) => currentStep - 1);
  }

  function salvar() {
    if (!parqComplete(form.parq)) {
      toast.error("Responda todas as perguntas do PAR-Q.");
      return;
    }
    if (!form.declaracao) {
      toast.error("Confirme a declaração para enviar.");
      return;
    }
    saveMutation.mutate(true);
  }

  return (
    <Box sx={pessoaSectionSx}>
      {started ? (
        <>
          <AnamneseStepCarousel step={step} onPrev={goBack} onNext={goNext} onStep={setStep} />
          <AnamneseFields
            value={form}
            onChange={setForm}
            sections={[...current.sections]}
            assinadoEm={existing?.respondido_em}
          />
          {last ? (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="success"
                disabled={saveMutation.isLoading}
                onClick={salvar}
                sx={BTN}
                startIcon={<Icon name="mdi:content-save-outline" />}
              >
                Salvar
              </Button>
            </Box>
          ) : null}
        </>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Responda com atenção. O questionário ajuda a treinar com segurança e não substitui avaliação médica.
          </Alert>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setStarted(true);
              setStep(0);
            }}
            sx={BTN}
            startIcon={<Icon name="mdi:play" />}
          >
            Iniciar
          </Button>
        </Box>
      )}
    </Box>
  );
}
