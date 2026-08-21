import { Alert, Box, Divider, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findAnamnese } from "api/anamneses";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { PessoaAnexosLista, type PessoaAnexo } from "components/pessoas/PessoaAnexos";
import { ANAMNESE_PARQ, ANAMNESE_STEPS, PARQ_ANSWER } from "domain/anamneses/constants";
import { mergeAnamneseRespostas, parqComplete } from "domain/anamneses/formatters";
import { AnamneseRespostas } from "domain/anamneses/types";
import { DATA } from "domain/shared/formatters";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { ReactNode } from "react";

function snLabel(value: string) {
  if (value === PARQ_ANSWER.SIM) return "Sim";
  if (value === PARQ_ANSWER.NAO) return "Não";
  if (value === PARQ_ANSWER.NAO_SEI) return "Não sei";
  return value.trim() || "—";
}

function answerChip(value: string) {
  if (value === PARQ_ANSWER.SIM) {
    return <Chip text="Sim" bgColor="#FF5356" txtColor="#fff" fontSize="78%" />;
  }
  if (value === PARQ_ANSWER.NAO) {
    return <Chip text="Não" bgColor="#33CC66" txtColor="#fff" fontSize="78%" />;
  }
  if (value === PARQ_ANSWER.NAO_SEI) {
    return <Chip text="Não sei" bgColor="#FFD22B" txtColor="#111" fontSize="78%" />;
  }
  if (!value.trim()) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }
  return <Chip text={value} bgColor="#0076F3" txtColor="#fff" fontSize="78%" />;
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ px: 2, py: 1.25, bgcolor: "rgba(0,0,0,0.02)", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Icon name={icon} width={20} height={20} />
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
    </Box>
  );
}

function Row({ label, value, chip }: { label: string; value?: string; chip?: ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.25, sm: 1.5 }}
      sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0, pb: 0 } }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flex: "0 0 42%", minWidth: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {chip ?? (
          <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: "pre-wrap" }}>
            {value || "—"}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function simDetail(flag: string, detail: string) {
  if (flag !== PARQ_ANSWER.SIM) return snLabel(flag);
  return detail.trim() ? `Sim — ${detail.trim()}` : "Sim";
}

function hasContent(f: AnamneseRespostas, respondidoEm: string | null | undefined) {
  if (respondidoEm) return true;
  if (parqComplete(f.parq)) return true;
  if (f.objetivos.length > 0 || f.declaracao) return true;
  return Boolean(
    f.medicamento ||
      f.suplemento ||
      f.dorAtual ||
      f.lesao ||
      f.cirurgia ||
      f.sonoHoras ||
      f.sonoQualidade ||
      f.rotina ||
      f.alimentacao ||
      f.dieta ||
      f.fuma ||
      f.alcool ||
      f.praticaAtividade ||
      f.experienciaMusculacao,
  );
}

export default function PessoaAnamnese({
  pessoaId,
  anexos = [],
}: {
  pessoaId: number;
  anexos?: PessoaAnexo[];
}) {
  const { data: existing, isLoading } = useQuery({
    queryKey: ["anamneses", pessoaId],
    queryFn: () => findAnamnese(pessoaId),
  });
  const { musculos: musculosCatalog = [] } = useFlagCatalogs(["musculos"] as const);

  const f = mergeAnamneseRespostas(existing);
  const filled = hasContent(f, existing?.respondido_em);
  const parqPositivos = f.parq.filter((v) => v === PARQ_ANSWER.SIM).length;
  const dorResumo =
    f.dorAtual === PARQ_ANSWER.SIM
      ? f.dorItens
          .map((item) => {
            const nome = musculosCatalog.find((m) => m.id === item.id_musculo)?.nome ?? `#${item.id_musculo}`;
            return [nome, item.intensidade ? `Intensidade ${item.intensidade}` : "", item.tempo ? `há ${item.tempo}` : ""]
              .filter(Boolean)
              .join(" ");
          })
          .filter(Boolean)
          .join("; ")
      : "";

  if (isLoading) {
    return <LinearProgress sx={{ borderRadius: 1 }} />;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
        <Stack spacing={0.75} minWidth={0} flex={1}>
          {filled ? (
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap>
              {existing?.respondido_em ? (
                <Chip text="Respondido" bgColor="#33CC66" txtColor="#fff" fontSize="85%" />
              ) : (
                <Chip text="Rascunho" bgColor="#FFD22B" txtColor="#111" fontSize="85%" />
              )}
              {parqPositivos > 0 ? (
                <Chip
                  text={`${parqPositivos} alerta${parqPositivos > 1 ? "s" : ""} no PAR-Q`}
                  bgColor="#FF5356"
                  txtColor="#fff"
                  fontSize="85%"
                />
              ) : (
                <Chip text="PAR-Q sem alertas" bgColor="#0076F3" txtColor="#fff" fontSize="85%" />
              )}
              {existing?.respondido_em ? (
                <Typography variant="body2" color="text.secondary">
                  Assinado em {DATA(existing.respondido_em)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Não finalizado
                </Typography>
              )}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ mb: 0 }}>
              Questionário pessoal ainda não enviado.
            </Alert>
          )}
        </Stack>
        <PessoaAnexosLista items={anexos} />
      </Stack>

      {filled ? (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SectionCard icon={ANAMNESE_STEPS[0].icon} title="Saúde">
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                PAR-Q
              </Typography>
              {ANAMNESE_PARQ.map((q, i) => (
                <Box key={q} sx={{ mb: 1.25 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {i + 1}. {q}
                    </Typography>
                    {answerChip(f.parq[i] ?? "")}
                  </Stack>
                  {f.parq[i] === PARQ_ANSWER.SIM && (f.parqDetalhe[i] ?? "").trim() ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pl: 0.5 }}>
                      {f.parqDetalhe[i]}
                    </Typography>
                  ) : null}
                </Box>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <Row label="Medicamento regular" value={simDetail(f.medicamento, f.medicamentoQuais)} />
              <Row label="Suplementos / pré-treino" value={simDetail(f.suplemento, f.suplementoQuais)} />
              <Row
                label="Dor atual"
                value={
                  f.dorAtual === PARQ_ANSWER.SIM
                    ? simDetail(f.dorAtual, dorResumo)
                    : snLabel(f.dorAtual)
                }
              />
              <Row
                label="Lesão"
                value={
                  f.lesao === PARQ_ANSWER.SIM
                    ? simDetail(
                        f.lesao,
                        [f.lesaoQual, f.lesaoQuando, f.lesaoRecuperado ? `recuperado: ${snLabel(f.lesaoRecuperado)}` : ""]
                          .filter(Boolean)
                          .join(" · "),
                      )
                    : snLabel(f.lesao)
                }
              />
              <Row label="Cirurgia" value={simDetail(f.cirurgia, f.cirurgiaQual)} />
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <SectionCard icon={ANAMNESE_STEPS[1].icon} title="Rotina">
              <Row label="Horas de sono" value={f.sonoHoras.trim() ? `${f.sonoHoras} h` : "—"} />
              <Row label="Qualidade do sono" chip={answerChip(f.sonoQualidade)} />
              <Row
                label="Dia a dia"
                value={f.rotina === "Outro" && f.rotinaOutro.trim() ? f.rotinaOutro : snLabel(f.rotina)}
              />
              <Row label="Alimentação" chip={answerChip(f.alimentacao)} />
              <Row label="Restrição alimentar" value={simDetail(f.dieta, f.dietaQual.trim() || f.alergia)} />
              <Row label="Fuma / nicotina" chip={answerChip(f.fuma)} />
              <Row label="Álcool" chip={answerChip(f.alcool)} />
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <SectionCard icon={ANAMNESE_STEPS[2].icon} title="Objetivos">
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Objetivos
                </Typography>
                {f.objetivos.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
                    {f.objetivos.map((o) => (
                      <Chip
                        key={o}
                        text={o === "Outro" && f.objetivoOutro.trim() ? f.objetivoOutro : o}
                        bgColor="#0076F3"
                        txtColor="#fff"
                        fontSize="78%"
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" fontWeight={600}>
                    —
                  </Typography>
                )}
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Motivação
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {f.motivacao}/10
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, f.motivacao * 10))}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.06)",
                    "& .MuiLinearProgress-bar": { bgcolor: "#33CC66", borderRadius: 1 },
                  }}
                />
              </Box>
              <Row
                label="Treino regular"
                value={
                  f.praticaAtividade === PARQ_ANSWER.SIM
                    ? simDetail(
                        f.praticaAtividade,
                        [
                          f.quaisAtividades,
                          f.frequenciaSemana ? `${f.frequenciaSemana}x/semana` : "",
                          f.duracaoSessao ? `${f.duracaoSessao} min` : "",
                        ]
                          .filter(Boolean)
                          .join(" · "),
                      )
                    : snLabel(f.praticaAtividade)
                }
              />
              <Row label="Experiência" chip={answerChip(f.experienciaMusculacao)} />
              {f.declaracao ? (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                  <Stack direction="row" alignItems="center" gap={0.75}>
                    <Icon name="mdi:check-decagram" width={18} height={18} />
                    <Typography variant="body2" fontWeight={600}>
                      Declaração de veracidade confirmada
                    </Typography>
                  </Stack>
                </Box>
              ) : null}
            </SectionCard>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
