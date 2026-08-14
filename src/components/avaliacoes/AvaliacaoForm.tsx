import { Box, Grid, Typography } from "@mui/material";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import Input from "components/form/Input";
import { AvaliacaoFormValues } from "domain/avaliacoes/types";
import { ReactNode, RefObject } from "react";
import { pessoaSectionSx } from "utils/pessoas/styles";

type Props = {
  formId?: string;
  formRef: RefObject<FormHandles>;
  initialData?: AvaliacaoFormValues;
  onSubmit: (data: AvaliacaoFormValues) => void | Promise<void>;
  children?: ReactNode;
};

export default function AvaliacaoForm({ formId, formRef, initialData, onSubmit, children }: Props) {
  return (
    <Form
      ref={formRef}
      id={formId}
      initialData={initialData}
      onSubmit={onSubmit}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Dados
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Input name="academia_id" label="Academia ID" type="number" required />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Input name="id_pessoa" label="Pessoa ID" type="number" required />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Input name="data" label="Data" type="date" required InputLabelProps={{ shrink: true }} />
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
          Medidas (cm)
        </Typography>
        <Grid container spacing={2}>
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
            <Input name="coxa_dir" label="Coxa D" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Input name="coxa_esq" label="Coxa E" type="number" inputProps={{ step: "0.1" }} />
          </Grid>
        </Grid>
      </Box>

      {children}
    </Form>
  );
}
