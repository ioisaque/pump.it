import {
    Autocomplete,
    Box,
    Checkbox,
    FormControlLabel,
    Grid,
    MenuItem,
    Chip as MuiChip,
    Radio,
    RadioGroup,
    Slider,
    Stack,
    TextField,
    TextFieldProps,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import Chip from "components/Chip";
import { COMPACT_INPUT_FONT_SIZE } from "components/form/inputConstants";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import {
    ANAMNESE_ESCALA,
    ANAMNESE_ESCALA_CORES,
    ANAMNESE_EXPERIENCIA,
    ANAMNESE_FREQUENCIA,
    ANAMNESE_OBJETIVOS,
    ANAMNESE_PARQ,
    ANAMNESE_ROTINA,
    ANAMNESE_STEPS,
    AnamneseSection,
    PARQ_ANSWER,
    ParqAnswer,
    SN,
    SNN,
} from "domain/anamneses/constants";
import { AnamneseRespostas } from "domain/anamneses/types";
import { DATA } from "domain/shared/formatters";
import { Flag } from "domain/tabelas/types";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { ReactNode } from "react";

const compactSx = compactInputRootSx();
const areaSx = {
  "& .MuiInputBase-root": {
    height: "auto",
    fontSize: COMPACT_INPUT_FONT_SIZE,
    backgroundColor: "transparent",
  },
  "& .MuiOutlinedInput-root": {
    alignItems: "flex-start",
    backgroundColor: "transparent",
  },
};

function countQuestionsInSections(sectionIds: readonly AnamneseSection[], f: AnamneseRespostas): number {
  let n = 0;
  for (const id of sectionIds) {
    if (id === "parq") n += ANAMNESE_PARQ.length;
    if (id === "medicamentos") n += 2;
    if (id === "lesoes") {
      n += 3;
      if (f.lesao === PARQ_ANSWER.SIM) n += 1;
    }
    if (id === "sono") n += 2;
    if (id === "rotina") n += 1;
    if (id === "alimentacao") n += 2;
    if (id === "habitos") n += 2;
    if (id === "objetivos") n += 2;
    if (id === "treino") n += 2;
  }
  return n;
}

function questionOffset(sections: AnamneseSection[], f: AnamneseRespostas): number {
  let offset = 0;
  for (const step of ANAMNESE_STEPS) {
    if (step.sections[0] === sections[0]) return offset;
    offset += countQuestionsInSections(step.sections, f);
  }
  return 0;
}

function snLabel(value: string) {
  if (value === PARQ_ANSWER.SIM) return "Sim";
  if (value === PARQ_ANSWER.NAO) return "Não";
  if (value === PARQ_ANSWER.NAO_SEI) return "Não sei";
  return value.trim() || "—";
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
      <Typography variant="body2" color="text.secondary" sx={{ flex: "0 1 48%", minWidth: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0, whiteSpace: "pre-wrap" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function ReviewGroup({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
        {title}
      </Typography>
      {rows.map((row) => (
        <ReviewRow key={row.label} label={row.label} value={row.value} />
      ))}
    </Box>
  );
}

function Field({ sx, multiline, InputLabelProps, ...rest }: TextFieldProps) {
  return (
    <TextField
      {...rest}
      size="small"
      fullWidth
      multiline={multiline}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      sx={[multiline ? areaSx : compactSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
}

function Choice({
  value,
  onChange,
  options,
  row = true,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  row?: boolean;
}) {
  return (
    <RadioGroup row={row} value={value} onChange={(e) => onChange(e.target.value)} sx={{ mb: 1.5 }}>
      {options.map((o) => (
        <FormControlLabel key={o.value} value={o.value} control={<Radio size="small" />} label={o.label} />
      ))}
    </RadioGroup>
  );
}

function Checks({
  options,
  value,
  onToggle,
}: {
  options: readonly string[];
  value: string[];
  onToggle: (opt: string) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 1.5, rowGap: 0.25, mb: 1.5 }}>
      {options.map((opt) => (
        <FormControlLabel
          key={opt}
          sx={{ mr: 0 }}
          control={<Checkbox size="small" checked={value.includes(opt)} onChange={() => onToggle(opt)} />}
          label={<Typography variant="body2">{opt}</Typography>}
        />
      ))}
    </Box>
  );
}

function Scale({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value || null}
      onChange={(_e, next) => {
        if (next != null) onChange(next);
      }}
      sx={{ mb: 1.5, flexWrap: "wrap" }}
    >
      {options.map((opt, index) => {
        const color = ANAMNESE_ESCALA_CORES[index] ?? "#64748B";
        const selectedText = color === "#FFD22B" ? "#111" : "#fff";
        return (
          <ToggleButton
            key={opt}
            value={opt}
            sx={{
              textTransform: "none",
              px: 1.25,
              borderColor: `${color} !important`,
              color,
              "&.Mui-selected": {
                bgcolor: color,
                color: selectedText,
                "&:hover": { bgcolor: color, color: selectedText },
              },
            }}
          >
            {opt}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

function QuestionBlock({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 0.75 }}>
        {n}. {label}
      </Typography>
      {children}
    </Box>
  );
}

type Props = {
  value: AnamneseRespostas;
  onChange: (next: AnamneseRespostas) => void;
  sections: AnamneseSection[];
  assinadoEm?: string | null;
};

export default function AnamneseFields({ value: f, onChange, sections, assinadoEm }: Props) {
  const show = (id: AnamneseSection) => sections.includes(id);
  const { musculos: musculosCatalog = [] } = useFlagCatalogs(["musculos"] as const);
  const dorFlagsSelected = musculosCatalog.filter((m) => f.dorItens.some((item) => item.id_musculo === m.id));
  let q = questionOffset(sections, f);
  const next = () => {
    q += 1;
    return q;
  };

  function set<K extends keyof AnamneseRespostas>(key: K, val: AnamneseRespostas[K]) {
    onChange({ ...f, [key]: val });
  }

  function toggle(key: "objetivos", opt: string, none?: string) {
    const cur = f[key];
    let nextOpts: string[];
    if (none && opt === none) {
      nextOpts = cur.includes(opt) ? [] : [opt];
    } else {
      const base = none ? cur.filter((x) => x !== none) : cur;
      nextOpts = base.includes(opt) ? base.filter((x) => x !== opt) : [...base, opt];
    }
    onChange({ ...f, [key]: nextOpts });
  }

  return (
    <Box>
      {show("parq")
        ? ANAMNESE_PARQ.map((label, i) => (
            <QuestionBlock key={label} n={next()} label={label}>
              <RadioGroup
                row
                value={f.parq[i]}
                onChange={(e) => {
                  const parq = [...f.parq];
                  parq[i] = e.target.value as ParqAnswer;
                  const detalhes = [...f.parqDetalhe];
                  while (detalhes.length < ANAMNESE_PARQ.length) detalhes.push("");
                  if (e.target.value !== PARQ_ANSWER.SIM) detalhes[i] = "";
                  onChange({ ...f, parq, parqDetalhe: detalhes });
                }}
              >
                {SN.map((o) => (
                  <FormControlLabel key={o.value} value={o.value} control={<Radio size="small" />} label={o.label} />
                ))}
              </RadioGroup>
              {f.parq[i] === PARQ_ANSWER.SIM ? (
                <Field
                  label="Descreva"
                  multiline
                  minRows={2}
                  value={f.parqDetalhe[i] ?? ""}
                  onChange={(e) => {
                    const detalhes = [...f.parqDetalhe];
                    while (detalhes.length < ANAMNESE_PARQ.length) detalhes.push("");
                    detalhes[i] = e.target.value;
                    set("parqDetalhe", detalhes);
                  }}
                  sx={{ mt: 1 }}
                />
              ) : null}
            </QuestionBlock>
          ))
        : null}

      {show("medicamentos") ? (
        <>
          <QuestionBlock n={next()} label="Faz uso contínuo de algum medicamento?">
            <Choice value={f.medicamento} onChange={(v) => set("medicamento", v)} options={SN} />
            {f.medicamento === PARQ_ANSWER.SIM ? (
              <Field
                label="Descreva quais"
                multiline
                minRows={2}
                value={f.medicamentoQuais}
                onChange={(e) => set("medicamentoQuais", e.target.value)}
              />
            ) : null}
          </QuestionBlock>
          <QuestionBlock n={next()} label="Faz uso de suplementos ou pré-treino?">
            <Choice value={f.suplemento} onChange={(v) => set("suplemento", v)} options={SN} />
            {f.suplemento === PARQ_ANSWER.SIM ? (
              <Field
                label="Descreva quais"
                multiline
                minRows={2}
                value={f.suplementoQuais}
                onChange={(e) => set("suplementoQuais", e.target.value)}
              />
            ) : null}
          </QuestionBlock>
        </>
      ) : null}

      {show("lesoes") ? (
        <>
          <QuestionBlock n={next()} label="Tem dor atual que possa interferir no treino?">
            <Choice
              value={f.dorAtual}
              onChange={(v) =>
                onChange({
                  ...f,
                  dorAtual: v,
                  dorItens: v === PARQ_ANSWER.SIM ? f.dorItens : [],
                })
              }
              options={SN}
            />
            {f.dorAtual === PARQ_ANSWER.SIM ? (
              <Stack spacing={1.5}>
                <Autocomplete
                  multiple
                  options={musculosCatalog}
                  value={dorFlagsSelected}
                  onChange={(_e, nextFlags: Flag[]) => {
                    const prev = new Map(f.dorItens.map((item) => [item.id_musculo, item]));
                    set(
                      "dorItens",
                      nextFlags.map((flag) => prev.get(flag.id) ?? { id_musculo: flag.id, intensidade: "", tempo: "" }),
                    );
                  }}
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
                  renderInput={(params) => (
                    <TextField {...params} label="Músculos / regiões" size="small" sx={compactSx} />
                  )}
                />
                {f.dorItens.map((item) => {
                  const musculo = musculosCatalog.find((m) => m.id === item.id_musculo);
                  return (
                    <Grid container spacing={2} key={item.id_musculo} alignItems="flex-start">
                      <Grid item xs={12} sm={4}>
                        <Box
                          sx={{
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            px: 1.25,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "#fff",
                            minWidth: 0,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} noWrap title={musculo?.nome}>
                            {musculo?.nome ?? `Músculo #${item.id_musculo}`}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Field
                          select
                          label="Intensidade 0–10"
                          value={item.intensidade}
                          onChange={(e) =>
                            set(
                              "dorItens",
                              f.dorItens.map((row) =>
                                row.id_musculo === item.id_musculo ? { ...row, intensidade: e.target.value } : row,
                              ),
                            )
                          }
                        >
                          {Array.from({ length: 11 }, (_, i) => (
                            <MenuItem key={i} value={String(i)}>
                              {i}
                            </MenuItem>
                          ))}
                        </Field>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Field
                          label="Há quanto tempo"
                          placeholder="ex.: 2 anos"
                          value={item.tempo}
                          onChange={(e) =>
                            set(
                              "dorItens",
                              f.dorItens.map((row) =>
                                row.id_musculo === item.id_musculo ? { ...row, tempo: e.target.value } : row,
                              ),
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  );
                })}
              </Stack>
            ) : null}
          </QuestionBlock>
          <QuestionBlock n={next()} label="Tem alguma lesão que afeta o treino?">
            <Choice value={f.lesao} onChange={(v) => set("lesao", v)} options={SN} />
            {f.lesao === PARQ_ANSWER.SIM ? (
              <Grid container spacing={2} sx={{ mb: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <Field label="Qual lesão?" value={f.lesaoQual} onChange={(e) => set("lesaoQual", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    label="Quando"
                    placeholder="mês/ano ou aproximado"
                    value={f.lesaoQuando}
                    onChange={(e) => set("lesaoQuando", e.target.value)}
                  />
                </Grid>
              </Grid>
            ) : null}
          </QuestionBlock>
          {f.lesao === PARQ_ANSWER.SIM ? (
            <QuestionBlock n={next()} label="Já está recuperado(a) dessa lesão?">
              <Choice value={f.lesaoRecuperado} onChange={(v) => set("lesaoRecuperado", v)} options={SNN} />
            </QuestionBlock>
          ) : null}
          <QuestionBlock n={next()} label="Já passou por alguma cirurgia relevante?">
            <Choice value={f.cirurgia} onChange={(v) => set("cirurgia", v)} options={SN} />
            {f.cirurgia === PARQ_ANSWER.SIM ? (
              <Field
                label="Descreva quais e quando"
                multiline
                minRows={2}
                value={f.cirurgiaQual}
                onChange={(e) => set("cirurgiaQual", e.target.value)}
              />
            ) : null}
          </QuestionBlock>
        </>
      ) : null}

      {show("sono") ? (
        <>
          <QuestionBlock n={next()} label="Quantas horas você costuma dormir por noite?">
            <Field
              label="Horas"
              type="number"
              inputMode="numeric"
              value={f.sonoHoras}
              onChange={(e) => set("sonoHoras", e.target.value)}
              sx={{ maxWidth: 160 }}
            />
          </QuestionBlock>
          <QuestionBlock n={next()} label="Como considera a qualidade do seu sono?">
            <Scale options={ANAMNESE_ESCALA} value={f.sonoQualidade} onChange={(v) => set("sonoQualidade", v)} />
          </QuestionBlock>
        </>
      ) : null}

      {show("rotina") ? (
        <QuestionBlock n={next()} label="Como é a sua rotina diária de movimento?">
          <Choice
            row={false}
            value={f.rotina}
            onChange={(v) => set("rotina", v)}
            options={ANAMNESE_ROTINA.map((opt) => ({ value: opt, label: opt }))}
          />
          {f.rotina === "Outro" ? (
            <Field label="Descreva" value={f.rotinaOutro} onChange={(e) => set("rotinaOutro", e.target.value)} />
          ) : null}
        </QuestionBlock>
      ) : null}

      {show("alimentacao") ? (
        <>
          <QuestionBlock n={next()} label="Como avalia a sua alimentação?">
            <Scale options={ANAMNESE_ESCALA} value={f.alimentacao} onChange={(v) => set("alimentacao", v)} />
          </QuestionBlock>
          <QuestionBlock n={next()} label="Tem alergia, dieta ou outro tipo de restrição alimentar?">
            <Choice
              value={f.dieta}
              onChange={(v) => {
                onChange({
                  ...f,
                  dieta: v,
                  dietaQual: v === PARQ_ANSWER.SIM ? f.dietaQual : "",
                  alergia: v === PARQ_ANSWER.SIM ? f.alergia : "",
                });
              }}
              options={SN}
            />
            {f.dieta === PARQ_ANSWER.SIM ? (
              <Field
                label="Descreva"
                multiline
                minRows={2}
                value={f.dietaQual || f.alergia}
                onChange={(e) => onChange({ ...f, dietaQual: e.target.value, alergia: "" })}
              />
            ) : null}
          </QuestionBlock>
        </>
      ) : null}

      {show("habitos") ? (
        <>
          <QuestionBlock n={next()} label="Com que frequência você fuma ou usa produtos com nicotina?">
            <Scale options={ANAMNESE_FREQUENCIA} value={f.fuma} onChange={(v) => set("fuma", v)} />
          </QuestionBlock>
          <QuestionBlock n={next()} label="Com que frequência você consome bebidas alcoólicas?">
            <Scale options={ANAMNESE_FREQUENCIA} value={f.alcool} onChange={(v) => set("alcool", v)} />
          </QuestionBlock>
        </>
      ) : null}

      {show("objetivos") ? (
        <>
          <QuestionBlock n={next()} label="Qual é o seu principal objetivo com o treinamento?">
            <Checks options={ANAMNESE_OBJETIVOS} value={f.objetivos} onToggle={(opt) => toggle("objetivos", opt)} />
            {f.objetivos.includes("Outro") ? (
              <Field label="Descreva" value={f.objetivoOutro} onChange={(e) => set("objetivoOutro", e.target.value)} />
            ) : null}
          </QuestionBlock>
          <QuestionBlock n={next()} label="De 0 a 10, qual o seu nível de motivação para treinar?">
            <Stack direction="row" alignItems="center" gap={2} sx={{ maxWidth: 480 }}>
              <Slider
                size="small"
                value={f.motivacao}
                min={0}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_e, v) => set("motivacao", v as number)}
              />
              <Typography variant="body2" fontWeight={700} sx={{ minWidth: 48 }}>
                {f.motivacao}/10
              </Typography>
            </Stack>
          </QuestionBlock>
        </>
      ) : null}

      {show("treino") ? (
        <>
          <QuestionBlock n={next()} label="Você pratica ou já praticou atividade física com regularidade?">
            <Choice value={f.praticaAtividade} onChange={(v) => set("praticaAtividade", v)} options={SN} />
            {f.praticaAtividade === PARQ_ANSWER.SIM ? (
              <>
                <Field
                  label="Quais atividades?"
                  value={f.quaisAtividades}
                  onChange={(e) => set("quaisAtividades", e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      label="Vezes por semana"
                      type="number"
                      inputMode="numeric"
                      value={f.frequenciaSemana}
                      onChange={(e) => set("frequenciaSemana", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      label="Minutos por sessão"
                      type="number"
                      inputMode="numeric"
                      value={f.duracaoSessao}
                      onChange={(e) => set("duracaoSessao", e.target.value)}
                    />
                  </Grid>
                </Grid>
              </>
            ) : null}
          </QuestionBlock>
          <QuestionBlock n={next()} label="Qual o seu nível de experiência com musculação?">
            <Scale
              options={ANAMNESE_EXPERIENCIA}
              value={f.experienciaMusculacao}
              onChange={(v) => set("experienciaMusculacao", v)}
            />
          </QuestionBlock>
        </>
      ) : null}

      {show("confirmacao") ? (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Revise as respostas e confirme a declaração.
          </Typography>

          <ReviewGroup
            title="Saúde"
            rows={[
              ...ANAMNESE_PARQ.map((label, i) => ({
                label,
                value:
                  f.parq[i] === PARQ_ANSWER.SIM && (f.parqDetalhe[i] ?? "").trim()
                    ? `${snLabel(f.parq[i])} — ${f.parqDetalhe[i]}`
                    : snLabel(f.parq[i] ?? ""),
              })),
              {
                label: "Faz uso contínuo de algum medicamento?",
                value:
                  f.medicamento === PARQ_ANSWER.SIM && f.medicamentoQuais.trim()
                    ? `Sim — ${f.medicamentoQuais}`
                    : snLabel(f.medicamento),
              },
              {
                label: "Faz uso de suplementos ou pré-treino?",
                value:
                  f.suplemento === PARQ_ANSWER.SIM && f.suplementoQuais.trim()
                    ? `Sim — ${f.suplementoQuais}`
                    : snLabel(f.suplemento),
              },
              {
                label: "Tem dor atual que possa interferir no treino?",
                value:
                  f.dorAtual === PARQ_ANSWER.SIM
                    ? f.dorItens.length
                      ? f.dorItens
                          .map((item) => {
                            const nome =
                              musculosCatalog.find((m) => m.id === item.id_musculo)?.nome ?? `#${item.id_musculo}`;
                            const parts = [
                              nome,
                              item.intensidade ? `Intensidade ${item.intensidade}` : "",
                              item.tempo ? `há ${item.tempo}` : "",
                            ].filter(Boolean);
                            return parts.join(" ");
                          })
                          .join("; ")
                      : "Sim"
                    : snLabel(f.dorAtual),
              },
              {
                label: "Tem alguma lesão que afeta o treino?",
                value:
                  f.lesao === PARQ_ANSWER.SIM
                    ? `Sim — ${[f.lesaoQual, f.lesaoQuando, f.lesaoRecuperado ? `recuperado: ${snLabel(f.lesaoRecuperado)}` : ""]
                        .filter(Boolean)
                        .join(" · ") || "sem detalhes"}`
                    : snLabel(f.lesao),
              },
              {
                label: "Já passou por alguma cirurgia relevante?",
                value:
                  f.cirurgia === PARQ_ANSWER.SIM && f.cirurgiaQual.trim()
                    ? `Sim — ${f.cirurgiaQual}`
                    : snLabel(f.cirurgia),
              },
            ]}
          />

          <ReviewGroup
            title="Rotina"
            rows={[
              { label: "Quantas horas você costuma dormir por noite?", value: f.sonoHoras.trim() ? `${f.sonoHoras} h` : "—" },
              { label: "Como considera a qualidade do seu sono?", value: snLabel(f.sonoQualidade) },
              {
                label: "Como é a sua rotina diária de movimento?",
                value: f.rotina === "Outro" && f.rotinaOutro.trim() ? f.rotinaOutro : snLabel(f.rotina),
              },
              { label: "Como avalia a sua alimentação?", value: snLabel(f.alimentacao) },
              {
                label: "Tem alergia, dieta ou outro tipo de restrição alimentar?",
                value:
                  f.dieta === PARQ_ANSWER.SIM && (f.dietaQual.trim() || f.alergia.trim())
                    ? `Sim — ${f.dietaQual.trim() || f.alergia.trim()}`
                    : snLabel(f.dieta),
              },
              { label: "Com que frequência você fuma ou usa produtos com nicotina?", value: snLabel(f.fuma) },
              { label: "Com que frequência você consome bebidas alcoólicas?", value: snLabel(f.alcool) },
            ]}
          />

          <ReviewGroup
            title="Objetivos"
            rows={[
              {
                label: "Qual é o seu principal objetivo com o treinamento?",
                value:
                  f.objetivos.length > 0
                    ? f.objetivos.map((o) => (o === "Outro" && f.objetivoOutro.trim() ? f.objetivoOutro : o)).join(", ")
                    : "—",
              },
              { label: "De 0 a 10, qual o seu nível de motivação para treinar?", value: `${f.motivacao}/10` },
              {
                label: "Você pratica ou já praticou atividade física com regularidade?",
                value:
                  f.praticaAtividade === PARQ_ANSWER.SIM
                    ? `Sim — ${[f.quaisAtividades, f.frequenciaSemana ? `${f.frequenciaSemana}x/semana` : "", f.duracaoSessao ? `${f.duracaoSessao} min` : ""]
                        .filter(Boolean)
                        .join(" · ") || "sem detalhes"}`
                    : snLabel(f.praticaAtividade),
              },
              {
                label: "Qual o seu nível de experiência com musculação?",
                value: snLabel(f.experienciaMusculacao),
              },
            ]}
          />

          <FormControlLabel
            sx={{ alignItems: "flex-start", mt: 1, mb: 1.5, mr: 0 }}
            control={
              <Checkbox size="small" checked={f.declaracao} onChange={(e) => set("declaracao", e.target.checked)} sx={{ pt: 0 }} />
            }
            label={
              <Typography variant="body2">
                Declaro que as informações são verdadeiras e completas, e comprometo-me a informar ao profissional
                responsável qualquer alteração relevante no meu estado de saúde, sintomas, lesão, cirurgia, medicação ou
                outra condição que possa interferir no treino.
              </Typography>
            }
          />
          {assinadoEm ? (
            <Typography variant="body2" color="text.secondary">
              Assinado em {DATA(assinadoEm)}.
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
