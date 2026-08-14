import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { listExercicios } from "api/exercicios";
import ActionIcon from "components/data-table/ActionIcon";
import Input from "components/form/Input";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import Select from "components/form/Select";
import Icon from "components/Icon";
import { FICHA_PADRAO, FICHA_PADRAO_OPTIONS, FICHA_STATUS } from "domain/fichas/constants";
import { diasFromPadrao } from "domain/fichas/formatters";
import { Ficha, FichaItem } from "domain/fichas/types";
import { buildFichaPayload, validateFichaForm } from "domain/fichas/validators";
import useAuth from "hooks/useAuth";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { pessoaSectionSx } from "utils/pessoas/styles";

const BTN_140 = { width: 140, height: 40 } as const;
const compactFieldSx = compactInputRootSx();

type ExercicioOption = { id: number; nome: string; carga_inicial?: number | null };

type FichaFormProps = {
  formId: string;
  initial?: Ficha | null;
  onSubmit: (payload: ReturnType<typeof buildFichaPayload>) => Promise<void>;
};

function emptyItem(dia = "A"): FichaItem {
  return {
    id_exercicio: 0,
    dia,
    ordem: 0,
    series: 3,
    repeticoes: "10",
    carga: null,
    descanso_segundos: 60,
  };
}

export default function FichaForm({ formId, initial, onSubmit }: FichaFormProps) {
  const { user } = useAuth();
  const formRef = useRef<FormHandles>(null);
  const [padrao, setPadrao] = useState(initial?.padrao ?? FICHA_PADRAO.A_B);
  const [itens, setItens] = useState<FichaItem[]>(
    initial?.itens?.length ? initial.itens : [emptyItem("A")],
  );

  const { data: exercicios = [] } = useQuery({
    queryKey: ["exercicios", "options"],
    queryFn: async (): Promise<ExercicioOption[]> => {
      const raw = await listExercicios();
      return (raw ?? []).map((ex) => ({ id: ex.id, nome: ex.nome, carga_inicial: ex.carga_inicial ?? null }));
    },
    retry: 0,
  });

  const dias = useMemo(() => diasFromPadrao(String(padrao)), [padrao]);

  useEffect(() => {
    if (!initial) return;
    setPadrao(initial.padrao ?? FICHA_PADRAO.A_B);
    setItens(initial.itens?.length ? initial.itens : [emptyItem("A")]);
    formRef.current?.setData({
      nome: initial.nome ?? "",
      padrao: initial.padrao ?? FICHA_PADRAO.A_B,
    });
  }, [initial]);

  async function handleSubmit(data: { nome?: string; padrao?: string }) {
    const nextPadrao = data.padrao ?? String(padrao);
    const merged = {
      nome: data.nome ?? "",
      padrao: nextPadrao,
      status: initial?.status ?? FICHA_STATUS.ACTIVE,
      itens,
    };
    const error = validateFichaForm(merged);
    if (error) {
      toast.error(error);
      return;
    }
    const payload = buildFichaPayload(merged, itens, user?.academia_id);
    await onSubmit(payload);
  }

  function updateItem(index: number, patch: Partial<FichaItem>) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItens((prev) => [...prev, emptyItem(dias[0] ?? "A")]);
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <Form
      id={formId}
      ref={formRef}
      initialData={{
        nome: initial?.nome ?? "",
        padrao: initial?.padrao ?? FICHA_PADRAO.A_B,
      }}
      onSubmit={handleSubmit}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Dados
        </Typography>
        <Stack spacing={2}>
          <Input name="nome" label="Nome" inputProps={{ maxLength: 128 }} />
          <Select name="padrao" label="Padrão" onChange={(e) => setPadrao(String(e.target.value))}>
            {FICHA_PADRAO_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Box>

      <Box sx={pessoaSectionSx}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Itens
          </Typography>
          <Button variant="contained" color="success" sx={BTN_140} startIcon={<Icon name="mdi:plus" />} onClick={addItem}>
            Adicionar
          </Button>
        </Stack>

        <Stack spacing={1.5}>
          {itens.map((item, index) => (
            <Stack
              key={`${item.id ?? "new"}-${index}`}
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <TextField
                select
                size="small"
                label="Exercício"
                value={item.id_exercicio || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const ex = exercicios.find((opt) => opt.id === id);
                  updateItem(index, { id_exercicio: id, carga: ex?.carga_inicial ?? null });
                }}
                sx={{ minWidth: 180, flex: 1, ...compactFieldSx }}
              >
                {exercicios.map((ex) => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Dia"
                value={item.dia || dias[0] || "A"}
                onChange={(e) => updateItem(index, { dia: String(e.target.value) })}
                sx={{ width: 88, ...compactFieldSx }}
              >
                {dias.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Séries"
                size="small"
                type="number"
                value={item.series}
                onChange={(e) => updateItem(index, { series: Number(e.target.value) || 0 })}
                sx={{ width: 96, ...compactFieldSx }}
              />
              <TextField
                label="Repetições"
                size="small"
                value={item.repeticoes}
                onChange={(e) => updateItem(index, { repeticoes: e.target.value })}
                sx={{ width: 120, ...compactFieldSx }}
              />
              <TextField
                label="Carga (kg)"
                size="small"
                type="number"
                value={item.carga ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  updateItem(index, { carga: raw === "" ? null : Number(raw) });
                }}
                sx={{ width: 110, ...compactFieldSx }}
                inputProps={{ min: 0, step: "0.5" }}
              />
              <TextField
                label="Descanso (s)"
                size="small"
                type="number"
                value={item.descanso_segundos}
                onChange={(e) => updateItem(index, { descanso_segundos: Number(e.target.value) || 0 })}
                sx={{ width: 120, ...compactFieldSx }}
              />
              {itens.length > 1 ? (
                <ActionIcon
                  icon="mdi:delete"
                  color="error.main"
                  to="#delete-item"
                  onClick={(e) => {
                    e.preventDefault();
                    removeItem(index);
                  }}
                />
              ) : null}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Form>
  );
}
