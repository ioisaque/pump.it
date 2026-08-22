import { Alert, Box, Divider, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { findAnamnese } from "api/anamneses";
import { deletePessoaAnexo, listPessoaAnexos, uploadPessoaAnexo } from "api/pessoas";
import AnatomiaFigure, {
    ANATOMIA_DOR_HIGHLIGHT,
    anatomiaGrupoFromNome,
    type AnatomiaGroupProp,
} from "components/AnatomiaFigure";
import AnexosCard, { AnexosAddButton } from "components/anexos/AnexosCard";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { ANAMNESE_ESCALA, ANAMNESE_EXPERIENCIA, ANAMNESE_FREQUENCIA, ANAMNESE_PARQ, ANAMNESE_STEPS, anamneseOptionChipStyle, PARQ_ANSWER } from "domain/anamneses/constants";
import { mergeAnamneseRespostas, parqComplete } from "domain/anamneses/formatters";
import { AnamneseRespostas } from "domain/anamneses/types";
import { DATA } from "domain/shared/formatters";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { useMemo, type ReactNode } from "react";
import toast from "react-hot-toast";

function snLabel(value: string) {
  if (value === PARQ_ANSWER.SIM) return "Sim";
  if (value === PARQ_ANSWER.NAO) return "Não";
  if (value === PARQ_ANSWER.NAO_SEI) return "Não sei";
  return value.trim() || "—";
}

function scaleChip(value: string, options: readonly string[]) {
  if (!value.trim()) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }
  const { bgColor, txtColor } = anamneseOptionChipStyle(value, options);
  return <Chip text={value} bgColor={bgColor} txtColor={txtColor} fontSize="78%" />;
}

function intensidadeChip(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || value.trim() === "") return null;
  const index = Math.min(4, Math.max(0, 4 - Math.round(n / 2.5)));
  const bgColor = anamneseOptionChipStyle(ANAMNESE_ESCALA[index] ?? "", ANAMNESE_ESCALA).bgColor;
  const txtColor = bgColor === "#FFD22B" ? "#111" : "#fff";
  return <Chip text={`${n}/10`} bgColor={bgColor} txtColor={txtColor} fontSize="78%" />;
}

function dorCalloutText(nome: string, intensidade: string) {
  return intensidade.trim() ? `${nome} · ${intensidade}/10` : nome;
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
  headerAction,
  children,
}: {
  icon: string;
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
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
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, py: 1.25, bgcolor: "rgba(0,0,0,0.02)", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
          <Icon name={icon} width={20} height={20} />
          <Typography variant="subtitle2" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        {headerAction}
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

export default function PessoaAnamnese({ pessoaId }: { pessoaId: number }) {
  const queryClient = useQueryClient();
  const anexosQueryKey = ["pessoas", pessoaId, "anexos"] as const;

  const { data: existing, isLoading } = useQuery({
    queryKey: ["anamneses", pessoaId],
    queryFn: () => findAnamnese(pessoaId),
  });
  const { data: anexos = [] } = useQuery({
    queryKey: anexosQueryKey,
    queryFn: () => listPessoaAnexos(pessoaId),
    enabled: pessoaId > 0,
  });
  const { musculos: musculosCatalog = [] } = useFlagCatalogs(["musculos"] as const);

  const uploadAnexo = useMutation({
    mutationFn: (file: File) => uploadPessoaAnexo(pessoaId, file),
    onSuccess: async () => {
      toast.success("Anexo enviado.");
      await queryClient.invalidateQueries({ queryKey: anexosQueryKey });
    },
    onError: () => toast.error("Não foi possível enviar o anexo."),
  });

  const removeAnexo = useMutation({
    mutationFn: (anexoId: number) => deletePessoaAnexo(pessoaId, anexoId),
    onSuccess: async () => {
      toast.success("Anexo removido.");
      await queryClient.invalidateQueries({ queryKey: anexosQueryKey });
    },
    onError: () => toast.error("Não foi possível remover o anexo."),
  });

  const f = mergeAnamneseRespostas(existing);
  const filled = hasContent(f, existing?.respondido_em);
  const parqPositivos = f.parq.filter((v) => v === PARQ_ANSWER.SIM).length;

  const dorAnatomyGroups = useMemo((): AnatomiaGroupProp[] => {
    if (f.dorAtual !== PARQ_ANSWER.SIM || !f.dorItens.length) return [];
    const byGrupo = new Map<string, AnatomiaGroupProp & { maxInt: number }>();
    for (const item of f.dorItens) {
      const musculo = musculosCatalog.find((m) => m.id === item.id_musculo);
      if (!musculo) continue;
      const gid = anatomiaGrupoFromNome(musculo.nome);
      if (!gid) continue;
      const n = Number(item.intensidade);
      const maxInt = Number.isFinite(n) ? n : -1;
      const text = dorCalloutText(musculo.nome, item.intensidade);
      const prev = byGrupo.get(gid);
      if (!prev || maxInt > prev.maxInt) {
        byGrupo.set(gid, {
          id: gid,
          text,
          color: ANATOMIA_DOR_HIGHLIGHT,
          icon: musculo.icon || "mdi:alert-circle",
          maxInt,
        });
      }
    }
    return Array.from(byGrupo.values()).map(({ maxInt: _maxInt, ...group }) => group);
  }, [f.dorAtual, f.dorItens, musculosCatalog]);

  const dorItensVisiveis = useMemo(() => {
    if (f.dorAtual !== PARQ_ANSWER.SIM) return [];
    return f.dorItens
      .map((item) => {
        const musculo = musculosCatalog.find((m) => m.id === item.id_musculo);
        return musculo ? { ...item, musculo } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item != null);
  }, [f.dorAtual, f.dorItens, musculosCatalog]);

  const dorDetalhada = f.dorAtual === PARQ_ANSWER.SIM && dorItensVisiveis.length > 0;

  if (isLoading) {
    return <LinearProgress sx={{ borderRadius: 1 }} />;
  }

  const statusMeta = filled ? (
    <Stack spacing={1.25}>
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
      </Stack>
      {existing?.respondido_em ? (
        <Typography variant="body2" color="text.secondary">
          Assinado em {DATA(existing.respondido_em)}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Não finalizado
        </Typography>
      )}
      {f.declaracao ? (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <Icon name="mdi:check-decagram" width={18} height={18} />
          <Typography variant="body2" fontWeight={600}>
            Declaração de veracidade confirmada
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  ) : null;

  return (
    <Box>
      {!filled ? (
        <Alert severity="info" sx={{ mb: 0 }}>
          Questionário pessoal ainda não enviado.
        </Alert>
      ) : null}

      {filled ? (
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
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
              </SectionCard>

              <SectionCard icon={ANAMNESE_STEPS[1].icon} title="Rotina">
                <Row label="Horas de sono" value={f.sonoHoras.trim() ? `${f.sonoHoras} h` : "—"} />
                <Row label="Qualidade do sono" chip={scaleChip(f.sonoQualidade, ANAMNESE_ESCALA)} />
                <Row
                  label="Dia a dia"
                  value={f.rotina === "Outro" && f.rotinaOutro.trim() ? f.rotinaOutro : snLabel(f.rotina)}
                />
                <Row label="Alimentação" chip={scaleChip(f.alimentacao, ANAMNESE_ESCALA)} />
                <Row label="Restrição alimentar" value={simDetail(f.dieta, f.dietaQual.trim() || f.alergia)} />
                <Row label="Fuma / nicotina" chip={scaleChip(f.fuma, ANAMNESE_FREQUENCIA)} />
                <Row label="Álcool" chip={scaleChip(f.alcool, ANAMNESE_FREQUENCIA)} />
              </SectionCard>

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
                <Row label="Experiência" chip={scaleChip(f.experienciaMusculacao, ANAMNESE_EXPERIENCIA)} />
              </SectionCard>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <SectionCard
                icon="mdi:paperclip-plus"
                title="Anexos"
                headerAction={
                  <AnexosAddButton uploading={uploadAnexo.isLoading} onAdd={(file) => uploadAnexo.mutate(file)} />
                }
              >
                <AnexosCard
                  embedded
                  anexos={anexos}
                  editable
                  uploading={uploadAnexo.isLoading}
                  onAdd={(file) => uploadAnexo.mutate(file)}
                  onRemove={(anexoId) => removeAnexo.mutate(anexoId)}
                />
              </SectionCard>

              <SectionCard icon="mdi:human-male-height-variant" title="Anatomia">
                {dorAnatomyGroups.length ? <AnatomiaFigure groups={dorAnatomyGroups} /> : null}
                {dorItensVisiveis.length ? (
                  <Stack spacing={0.75} sx={{ mt: dorAnatomyGroups.length ? 1.25 : 0, mb: 1.5 }}>
                    {dorItensVisiveis.map((item) => (
                      <Stack
                        key={item.id_musculo}
                        direction="row"
                        alignItems="center"
                        gap={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: 1.5,
                          bgcolor: "action.hover",
                        }}
                      >
                        <Chip
                          icon={item.musculo.icon}
                          nome={item.musculo.nome}
                          color={item.musculo.color || ANATOMIA_DOR_HIGHLIGHT}
                          fontSize="78%"
                        />
                        {intensidadeChip(item.intensidade)}
                        {item.tempo.trim() ? (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                            há {item.tempo.trim()}
                          </Typography>
                        ) : null}
                      </Stack>
                    ))}
                  </Stack>
                ) : null}
                {!dorDetalhada ? <Row label="Dor atual" chip={answerChip(f.dorAtual)} /> : null}
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

              {statusMeta}
            </Stack>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
