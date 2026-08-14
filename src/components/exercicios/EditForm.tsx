import { Autocomplete, Box, Chip as MuiChip, Stack, TextField, Typography } from "@mui/material";
import { FormHandles, useField } from "@unform/core";
import { Form } from "@unform/web";
import Chip from "components/Chip";
import Input from "components/form/Input";
import { ExercicioFormData } from "domain/exercicios/types";
import { Flag } from "domain/tabelas/types";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { pessoaSectionSx } from "utils/pessoas/styles";

type Props = {
  formId?: string;
  formRef: RefObject<FormHandles>;
  initialData?: Partial<ExercicioFormData>;
  onSubmit: (data: ExercicioFormData) => void | Promise<void>;
  children?: ReactNode;
};

function MusculosField() {
  const { musculos: catalog = [] } = useFlagCatalogs(["musculos"] as const);
  const { fieldName, registerField, defaultValue } = useField("musculos_ids");
  const [selected, setSelected] = useState<Flag[]>([]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => selectedRef.current.map((item) => item.id),
      setValue: (_ref, value: number[] | undefined) => {
        const ids = Array.isArray(value) ? value.map(Number) : [];
        setSelected(catalog.filter((item) => ids.includes(item.id)));
      },
      clearValue: () => setSelected([]),
    });
  }, [fieldName, registerField, catalog]);

  useEffect(() => {
    const ids = Array.isArray(defaultValue) ? defaultValue.map(Number) : [];
    if (!ids.length || !catalog.length) return;
    setSelected(catalog.filter((item) => ids.includes(item.id)));
  }, [catalog, defaultValue]);

  return (
    <Autocomplete
      multiple
      options={catalog}
      value={selected}
      onChange={(_e, next) => setSelected(next)}
      getOptionLabel={(option) => option.nome}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <MuiChip
              key={key}
              {...tagProps}
              size="small"
              label={option.nome}
              sx={{ bgcolor: option.color || "#989898", color: "#fff" }}
            />
          );
        })
      }
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Chip icon={option.icon} nome={option.nome} color={option.color} />
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Músculos trabalhados" size="small" />}
    />
  );
}

export function ExercicioEditFormFields({ formId, formRef, initialData, onSubmit, children }: Props) {
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
        <Stack spacing={2}>
          <Input name="nome" label="Nome" required />
          <Input name="descricao" label="Descrição" multiline rows={4} />
          <Input
            name="carga_inicial"
            label="Carga predefinida inicial (kg)"
            type="number"
            inputProps={{ min: 0, step: "0.5" }}
          />
          <MusculosField />
          {children}
        </Stack>
      </Box>
    </Form>
  );
}
