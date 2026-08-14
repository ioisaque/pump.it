import { Box, Grid, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { listPessoas } from "api/pessoas";
import AutocompleteSelect from "components/form/AutocompleteSelect";
import FormDateInput from "components/form/FormDateInput";
import Input from "components/form/Input";
import { AvaliacaoFormValues } from "domain/avaliacoes/types";
import { PESSOA_LIST_TIPO } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { ReactNode, RefObject, useEffect, useMemo, useState } from "react";
import { pessoaSectionSx } from "utils/pessoas/styles";

type Props = {
  formId?: string;
  formRef: RefObject<FormHandles>;
  initialData?: AvaliacaoFormValues;
  onSubmit: (data: AvaliacaoFormValues) => void | Promise<void>;
  children?: ReactNode;
};

export default function AvaliacaoForm({ formId, formRef, initialData, onSubmit, children }: Props) {
  const { user } = useAuth();
  const academiaId = user?.academia_id && user.academia_id > 0 ? user.academia_id : Number(initialData?.academia_id) || undefined;
  const [pessoaId, setPessoaId] = useState<number | "">(
    initialData?.id_pessoa != null && initialData.id_pessoa !== "" ? Number(initialData.id_pessoa) : "",
  );

  const { data: pessoasData } = useQuery({
    queryKey: ["pessoas", "alunos", academiaId],
    queryFn: () => listPessoas({ tipo: PESSOA_LIST_TIPO.ALUNO, academia_id: academiaId }),
    enabled: academiaId != null && academiaId > 0,
  });

  const pessoaOptions = useMemo(
    () =>
      (pessoasData?.pessoas ?? []).map((p) => ({
        id: p.id,
        label: `${String(p.id).padStart(5, "0")} ${p.nome}`,
      })),
    [pessoasData?.pessoas],
  );

  useEffect(() => {
    if (initialData?.id_pessoa == null || initialData.id_pessoa === "") return;
    setPessoaId(Number(initialData.id_pessoa));
  }, [initialData?.id_pessoa]);

  return (
    <Form
      ref={formRef}
      id={formId}
      initialData={initialData}
      onSubmit={(data) =>
        onSubmit({
          ...data,
          id_pessoa: pessoaId || data.id_pessoa,
          academia_id: data.academia_id || academiaId || "",
        })
      }
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <Input name="academia_id" sx={{ display: "none" }} />
      <Input name="id_pessoa" sx={{ display: "none" }} />

      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Dados
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <AutocompleteSelect
              label="Aluno"
              options={pessoaOptions}
              value={pessoaId}
              placeholder="Pesquisar aluno…"
              noOptionsText="Nenhum aluno"
              onChange={(id) => {
                const next = id ?? "";
                setPessoaId(next);
                formRef.current?.setFieldValue("id_pessoa", next || "");
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormDateInput name="data" label="Data" required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input name="peso_kg" label="Peso (kg)" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input name="altura_cm" label="Altura (cm)" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={12}>
            <Input name="observacoes" label="Observações" multiline minRows={3} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Perimetria (cm)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Input name="pescoco" label="Pescoço" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="ombro" label="Ombro" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="peito" label="Peito" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="cintura" label="Cintura" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="quadril" label="Quadril" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="braco_dir" label="Braço D" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="braco_esq" label="Braço E" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="antebraco_dir" label="Antebraço D" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="antebraco_esq" label="Antebraço E" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="coxa_dir" label="Coxa D" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="coxa_esq" label="Coxa E" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="panturrilha_dir" label="Panturrilha D" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="panturrilha_esq" label="Panturrilha E" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Dobras cutâneas (mm)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          Opcional — protocolo típico de academia (tricipital, subescapular, abdominal, supra-ilíaca, coxa).
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Input name="dobra_tricipital" label="Tricipital" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Input name="dobra_subescapular" label="Subescapular" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Input name="dobra_abdominal" label="Abdominal" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Input name="dobra_suprailiaca" label="Supra-ilíaca" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Input name="dobra_coxa" label="Coxa" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
        </Grid>
      </Box>

      {children}
    </Form>
  );
}
