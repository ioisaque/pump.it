import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findAvaliacao } from "api/avaliacoes";
import AnatomiaFigure, { type AnatomiaGroupProp } from "components/AnatomiaFigure";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import {
    calcBmrHarrisBenedict,
    calcCinturaQuadril,
    calcComposicao,
    calcImc,
    calcJacksonPollock7,
    classificacaoGordura,
    classificacaoImc,
    classificacaoWhr,
    distribuicaoGordura,
    DOBRA_LABELS,
    formatAvaliacaoData,
    idadeNaData,
    isAlunoFem,
    medidaNum,
} from "domain/avaliacoes/formatters";
import { AvaliacaoMedidas } from "domain/avaliacoes/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { Fragment, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LINK } from "utils/link";

const BTN_140 = { width: 140, height: 40 } as const;

function pair(a: number | null, b: number | null, unit = "cm"): string {
  if (a == null && b == null) return "—";
  if (a != null && b != null && a !== b) return `${a} / ${b} ${unit}`;
  return `${a ?? b} ${unit}`;
}

function groupsFromMedidas(m: AvaliacaoMedidas | null | undefined): AnatomiaGroupProp[] {
  const groups: AnatomiaGroupProp[] = [];
  const peito = medidaNum(m, "peito");
  const cintura = medidaNum(m, "cintura");
  const quadril = medidaNum(m, "quadril");
  const ombro = medidaNum(m, "ombro");
  const bracos = pair(medidaNum(m, "braco_esq"), medidaNum(m, "braco_dir"));
  const coxas = pair(medidaNum(m, "coxa_esq"), medidaNum(m, "coxa_dir"));
  const pant = pair(medidaNum(m, "panturrilha_esq"), medidaNum(m, "panturrilha_dir"));
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

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.25 }}>
      <span>{label}</span>
      <span>{value}</span>
    </Typography>
  );
}

function ordinalLabel(n: number | null | undefined): string {
  if (n == null || n < 1) return "";
  return `${n}ª avaliação`;
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

  const m = data?.medidas;
  const anatomyGroups = useMemo(() => groupsFromMedidas(m), [m]);
  const fem = isAlunoFem(data?.pessoa_anatomia_genero);
  const idade = idadeNaData(data?.pessoa_data_nasc, data?.data);
  const imc = calcImc(data?.peso_kg, data?.altura_cm);
  const cq = calcCinturaQuadril(medidaNum(m, "cintura"), medidaNum(m, "quadril"));
  const bmr = calcBmrHarrisBenedict(data?.peso_kg, data?.altura_cm, idade, fem);
  const gorduraAtual = calcJacksonPollock7(m, idade, fem);
  const gorduraObj = medidaNum(m, "gordura_objetivo_pct");
  const gorduraClass = classificacaoGordura(gorduraAtual, idade, fem);
  const composicao = calcComposicao(data?.peso_kg, gorduraAtual, gorduraObj, gorduraClass);
  const dist = useMemo(() => distribuicaoGordura(m), [m]);
  const risco = typeof m?.risco_coronariano === "string" ? m.risco_coronariano.trim() : "";

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
                {data.ordinal ? ` · ${ordinalLabel(data.ordinal)}` : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.pessoa_nome || `Pessoa #${data.id_pessoa}`} · {formatAvaliacaoData(data.data)}
                {data.avaliador_nome ? ` · ${data.avaliador_nome}` : ""}
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
            Informações gerais
          </Typography>
          <Line
            label="Idade / sexo"
            value={`${idade != null ? `${idade} anos` : "—"} · ${fem ? "Feminino" : "Masculino"}`}
          />
          <Line label="Massa corporal" value={data.peso_kg != null ? `${data.peso_kg} kg` : "—"} />
          <Line label="Estatura" value={data.altura_cm != null ? `${(data.altura_cm / 100).toFixed(2)} m` : "—"} />
          <Line label="IMC" value={imc != null ? `${imc} · ${classificacaoImc(imc)}` : "—"} />
          <Line label="WHR (cintura/quadril)" value={cq != null ? `${cq} · ${classificacaoWhr(cq, fem)}` : "—"} />
          <Line label="Metabolismo de repouso" value={bmr != null ? `${bmr} kcal/dia` : "—"} />
        </Box>

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Circunferências
          </Typography>
          <Line label="Pescoço" value={medidaNum(m, "pescoco") != null ? `${medidaNum(m, "pescoco")} cm` : "—"} />
          <Line label="Ombro" value={medidaNum(m, "ombro") != null ? `${medidaNum(m, "ombro")} cm` : "—"} />
          <Line label="Tórax" value={medidaNum(m, "peito") != null ? `${medidaNum(m, "peito")} cm` : "—"} />
          <Line label="Abdômen" value={medidaNum(m, "abdomen") != null ? `${medidaNum(m, "abdomen")} cm` : "—"} />
          <Line label="Cintura" value={medidaNum(m, "cintura") != null ? `${medidaNum(m, "cintura")} cm` : "—"} />
          <Line label="Quadril" value={medidaNum(m, "quadril") != null ? `${medidaNum(m, "quadril")} cm` : "—"} />
          <Line label="Braço E / D" value={pair(medidaNum(m, "braco_esq"), medidaNum(m, "braco_dir"))} />
          <Line label="Braço E / D contraído" value={pair(medidaNum(m, "braco_esq_contr"), medidaNum(m, "braco_dir_contr"))} />
          <Line label="Antebraço E / D" value={pair(medidaNum(m, "antebraco_esq"), medidaNum(m, "antebraco_dir"))} />
          <Line label="Coxa E / D" value={pair(medidaNum(m, "coxa_esq"), medidaNum(m, "coxa_dir"))} />
          <Line label="Perna E / D" value={pair(medidaNum(m, "panturrilha_esq"), medidaNum(m, "panturrilha_dir"))} />
        </Box>

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Dobras cutâneas
          </Typography>
          {Object.entries(DOBRA_LABELS).map(([key, label]) => (
            <Line
              key={key}
              label={label}
              value={medidaNum(m, key) != null ? `${medidaNum(m, key)} mm` : "—"}
            />
          ))}
        </Box>

        {dist.length > 0 ? (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Distribuição de gordura
            </Typography>
            {dist.map((d) => (
              <Line key={d.key} label={d.label} value={`${d.pct} %`} />
            ))}
          </Box>
        ) : null}

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Composição corporal
          </Typography>
          {composicao ? (
            <>
              <Line label="Protocolo" value={composicao.protocolo} />
              <Line
                label="% gordura atual"
                value={`${composicao.gorduraAtual} %${composicao.gorduraClass ? ` · ${composicao.gorduraClass}` : ""}`}
              />
              <Line label="% gordura objetivo" value={`${composicao.gorduraObjetivo} %`} />
              <Line label="Massa magra" value={`${composicao.massaMagra} kg`} />
              <Line label="Massa gorda" value={`${composicao.massaGorda} kg`} />
              <Line label="Massa corporal ideal" value={`${composicao.massaIdeal} kg`} />
              <Line label="Excesso de gordura" value={`${composicao.excessoGordura} kg`} />
              <Line label="Gordura ideal" value={`${composicao.gorduraIdeal} kg`} />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Informe as 7 dobras do protocolo, idade e peso para calcular a composição.
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Risco coronariano
          </Typography>
          <Typography variant="body2">{risco || "Risco coronariano não preenchido"}</Typography>
        </Box>

        {data.observacoes ? (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Observações
            </Typography>
            <Typography variant="body2">{data.observacoes}</Typography>
          </Box>
        ) : null}

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5, mb: 2 }}>
          Valores para acompanhamento na academia. Não substituem diagnóstico médico.
        </Typography>
      </Box>
    </Fragment>
  );
}
