import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findAvaliacao } from "api/avaliacoes";
import AnatomiaFigure, { type AnatomiaGroupProp } from "components/AnatomiaFigure";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import {
    calcCinturaQuadril,
    calcImc,
    classificacaoImc,
    formatAvaliacaoData,
    interpretacaoCq,
    interpretacaoImc,
} from "domain/avaliacoes/formatters";
import { AvaliacaoMedidas } from "domain/avaliacoes/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { Fragment, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LINK } from "utils/link";

const BTN_140 = { width: 140, height: 40 } as const;


function num(m: AvaliacaoMedidas | null | undefined, key: string): number | null {
  const v = m?.[key];
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pair(a: number | null, b: number | null): string {
  if (a == null && b == null) return "—";
  if (a != null && b != null && a !== b) return `${a} / ${b} cm`;
  return `${a ?? b} cm`;
}

function groupsFromMedidas(m: AvaliacaoMedidas | null | undefined): AnatomiaGroupProp[] {
  const groups: AnatomiaGroupProp[] = [];
  const peito = num(m, "peito");
  const cintura = num(m, "cintura");
  const quadril = num(m, "quadril");
  const ombro = num(m, "ombro");
  const bracos = pair(num(m, "braco_esq"), num(m, "braco_dir"));
  const coxas = pair(num(m, "coxa_esq"), num(m, "coxa_dir"));
  const pant = pair(num(m, "panturrilha_esq"), num(m, "panturrilha_dir"));
  if (ombro != null) groups.push({ id: "shoulders", text: `Ombro ${ombro} cm` });
  if (peito != null) groups.push({ id: "chest", text: `Peito ${peito} cm` });
  if (bracos !== "—") {
    groups.push({ id: "biceps", text: `Braços ${bracos}` });
    groups.push({ id: "triceps", text: `Braços ${bracos}` });
  }
  if (cintura != null) groups.push({ id: "abs", text: `Cintura ${cintura} cm` });
  if (quadril != null) groups.push({ id: "glutes", text: `Quadril ${quadril} cm` });
  if (coxas !== "—") {
    groups.push({ id: "quads", text: `Coxas ${coxas}` });
    groups.push({ id: "hams", text: `Coxas ${coxas}` });
  }
  if (pant !== "—") groups.push({ id: "calves", text: `Panturrilhas ${pant}` });
  return groups;
}

export default function AvaliacaoShow() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const avaliacaoId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const academiaFromQuery = Number(searchParams.get("academia_id"));
  const academiaId =
    user?.academia_id && user.academia_id > 0
      ? user.academia_id
      : academiaFromQuery > 0
        ? academiaFromQuery
        : undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["avaliacoes", avaliacaoId, academiaId],
    queryFn: () => findAvaliacao(avaliacaoId, academiaId ? { academia_id: academiaId } : undefined),
    enabled: Number.isInteger(avaliacaoId) && avaliacaoId > 0,
    retry: 1,
  });

  const anatomyGroups = useMemo(() => groupsFromMedidas(data?.medidas), [data?.medidas]);
  const imc = calcImc(data?.peso_kg, data?.altura_cm);
  const cq = calcCinturaQuadril(num(data?.medidas, "cintura"), num(data?.medidas, "quadril"));

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">Avaliação não encontrada.</Alert>
        <Button sx={{ mt: 2, width: 140, height: 40 }} variant="contained" color="quinzel" onClick={() => navigate(LINK("/avaliacoes"))}>
          <Icon name="undo" />
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:clipboard-pulse-outline" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Avaliação: #{String(data.id).padStart(5, "0")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.pessoa_nome || `Pessoa #${data.id_pessoa}`} · {formatAvaliacaoData(data.data)}
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            {isCliente ? null : (
              <Button
                variant="contained"
                color="info"
                sx={BTN_140}
                onClick={() =>
                  navigate(LINK(`/avaliacoes/${data.id}/edit`, academiaId ? { academia_id: academiaId } : undefined))
                }
              >
                <Icon name="line-md:edit" />
                Editar
              </Button>
            )}
            <Button onClick={() => navigate(LINK("/avaliacoes"))} variant="contained" color="quinzel" sx={BTN_140}>
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />

      <Box sx={{ maxWidth: 520, mx: "auto", width: "100%" }}>
        <AnatomiaFigure groups={anatomyGroups} selectable />

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Análise
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {data.peso_kg != null ? `${data.peso_kg} kg` : "Peso —"} · {data.altura_cm != null ? `${data.altura_cm} cm` : "Altura —"}
            {imc != null ? ` · IMC ${imc} (${classificacaoImc(imc)})` : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {interpretacaoImc(imc)}
          </Typography>
          {interpretacaoCq(cq) ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {interpretacaoCq(cq)}
            </Typography>
          ) : null}
          {num(data.medidas, "pescoco") != null || num(data.medidas, "ombro") != null ? (
            <Typography variant="body2" color="text.secondary">
              Pescoço {num(data.medidas, "pescoco") ?? "—"} cm · Ombro {num(data.medidas, "ombro") ?? "—"} cm
            </Typography>
          ) : null}
          {data.observacoes ? (
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              {data.observacoes}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
            Valores ilustrativos para acompanhamento na academia. Não substituem diagnóstico médico.
          </Typography>
        </Box>
      </Box>
    </Fragment>
  );
}
