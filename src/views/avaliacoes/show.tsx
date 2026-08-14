import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findAvaliacao } from "api/avaliacoes";
import anatomiaCostasMask from "assets/imgs/anatomia-costas-mask.webp";
import anatomiaCostas from "assets/imgs/anatomia-costas.webp";
import anatomiaFrenteMask from "assets/imgs/anatomia-frente-mask.webp";
import anatomiaFrente from "assets/imgs/anatomia-frente.webp";
import Chip from "components/Chip";
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
import { Fragment, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LINK } from "utils/link";

const BTN_140 = { width: 140, height: 40 } as const;

type RegionId = "chest" | "waist" | "hips" | "arms" | "thighs" | "calves";

const REGION_COLOR: Record<RegionId, string> = {
  chest: "#FF5356",
  waist: "#0076F3",
  hips: "#9900CC",
  arms: "#33CC66",
  thighs: "#FFD22B",
  calves: "#F5617F",
};

const FRONT_CALL: Record<RegionId, { ax: number; ay: number; side: "left" | "right" }> = {
  chest: { ax: 210, ay: 108, side: "right" },
  waist: { ax: 208, ay: 152, side: "right" },
  hips: { ax: 214, ay: 200, side: "right" },
  arms: { ax: 122, ay: 118, side: "left" },
  thighs: { ax: 144, ay: 236, side: "left" },
  calves: { ax: 142, ay: 308, side: "left" },
};

const BACK_CALL: Record<RegionId, { ax: number; ay: number; side: "left" | "right" }> = {
  chest: { ax: 214, ay: 120, side: "right" },
  waist: { ax: 208, ay: 160, side: "right" },
  hips: { ax: 214, ay: 200, side: "right" },
  arms: { ax: 124, ay: 118, side: "left" },
  thighs: { ax: 144, ay: 246, side: "left" },
  calves: { ax: 140, ay: 308, side: "left" },
};

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

function regionLabel(id: RegionId, m: AvaliacaoMedidas | null | undefined): { nome: string; valor: string } {
  if (id === "chest") return { nome: "Peito", valor: num(m, "peito") == null ? "—" : `${num(m, "peito")} cm` };
  if (id === "waist") return { nome: "Cintura", valor: num(m, "cintura") == null ? "—" : `${num(m, "cintura")} cm` };
  if (id === "hips") return { nome: "Quadril", valor: num(m, "quadril") == null ? "—" : `${num(m, "quadril")} cm` };
  if (id === "arms") return { nome: "Braços", valor: pair(num(m, "braco_esq"), num(m, "braco_dir")) };
  if (id === "thighs") return { nome: "Coxas", valor: pair(num(m, "coxa_esq"), num(m, "coxa_dir")) };
  return { nome: "Panturrilhas", valor: pair(num(m, "panturrilha_esq"), num(m, "panturrilha_dir")) };
}

function Overlay({
  id,
  selected,
  children,
  onSelect,
}: {
  id: RegionId;
  selected: RegionId | null;
  children: ReactNode;
  onSelect: (id: RegionId) => void;
}) {
  const on = selected == null || selected === id;
  return (
    <g
      fill={REGION_COLOR[id]}
      fillOpacity={selected === id ? 0.55 : selected == null ? 0.22 : 0.06}
      style={{ cursor: "pointer", pointerEvents: on || selected !== id ? "auto" : "auto" }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {children}
    </g>
  );
}

function AnatomyBoard({ medidas }: { medidas: AvaliacaoMedidas | null | undefined }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<RegionId | null>(null);

  const goTo = (next: number) => {
    const el = scrollerRef.current;
    if (!el || next < 0 || next > 1) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };

  const toggle = (id: RegionId) => setSelected((cur) => (cur === id ? null : id));
  const callMap = index === 0 ? FRONT_CALL : BACK_CALL;
  const regions: RegionId[] = ["chest", "waist", "hips", "arms", "thighs", "calves"];
  const overlayMask = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    mixBlendMode: "multiply" as const,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
  const arrowSx = {
    position: "absolute" as const,
    top: "48%",
    zIndex: 4,
    opacity: 0.28,
    color: "text.primary",
    p: 0.25,
    "&:hover": { opacity: 0.55, bgcolor: "transparent" },
  };

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#fff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {index > 0 ? (
        <Box component="button" aria-label="Frente" onClick={() => goTo(0)} sx={{ ...arrowSx, left: 4, border: 0, bgcolor: "transparent" }}>
          <Icon name="mdi:chevron-left" width={36} height={36} />
        </Box>
      ) : null}
      {index < 1 ? (
        <Box component="button" aria-label="Costas" onClick={() => goTo(1)} sx={{ ...arrowSx, right: 4, border: 0, bgcolor: "transparent" }}>
          <Icon name="mdi:chevron-right" width={36} height={36} />
        </Box>
      ) : null}
      <Box
        ref={scrollerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          if (next !== index && (next === 0 || next === 1)) setIndex(next);
        }}
        sx={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", boxSizing: "border-box" }}>
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <Box component="img" src={anatomiaFrente} alt="Frente" draggable={false} sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            <Box
              component="svg"
              viewBox="0 0 360 360"
              sx={{ ...overlayMask, WebkitMaskImage: `url(${anatomiaFrenteMask})`, maskImage: `url(${anatomiaFrenteMask})` }}
            >
              <Overlay id="chest" selected={selected} onSelect={toggle}>
                <path d="M180 76 C164 76 152 86 150 102 C152 116 164 124 180 122 C180 104 180 88 180 76 Z" />
                <path d="M180 76 C196 76 208 86 210 102 C208 116 196 124 180 122 C180 104 180 88 180 76 Z" />
              </Overlay>
              <Overlay id="arms" selected={selected} onSelect={toggle}>
                <path d="M126 96 C116 104 114 124 116 146 C122 154 134 150 138 132 C140 114 136 100 126 96 Z" />
                <path d="M234 96 C244 104 246 124 244 146 C238 154 226 150 222 132 C220 114 224 100 234 96 Z" />
              </Overlay>
              <Overlay id="waist" selected={selected} onSelect={toggle}>
                <path d="M168 122 C176 120 180 120 180 176 L168 176 C162 158 162 138 168 122 Z" />
                <path d="M192 122 C184 120 180 120 180 176 L192 176 C198 158 198 138 192 122 Z" />
              </Overlay>
              <Overlay id="hips" selected={selected} onSelect={toggle}>
                <path d="M154 168 C146 182 148 198 178 200 C178 184 168 170 154 168 Z" />
                <path d="M206 168 C214 182 212 198 182 200 C182 184 192 170 206 168 Z" />
              </Overlay>
              <Overlay id="thighs" selected={selected} onSelect={toggle}>
                <path d="M144 214 C138 238 136 262 142 276 C152 280 166 268 168 242 C166 224 158 214 148 214 Z" />
                <path d="M216 214 C222 238 224 262 218 276 C208 280 194 268 192 242 C194 224 202 214 212 214 Z" />
              </Overlay>
              <Overlay id="calves" selected={selected} onSelect={toggle}>
                <path d="M142 286 C136 308 138 326 148 334 C158 334 164 316 162 298 C160 288 152 284 142 286 Z" />
                <path d="M218 286 C224 308 222 326 212 334 C202 334 196 316 198 298 C200 288 208 284 218 286 Z" />
              </Overlay>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", boxSizing: "border-box" }}>
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <Box component="img" src={anatomiaCostas} alt="Costas" draggable={false} sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            <Box
              component="svg"
              viewBox="0 0 360 360"
              sx={{ ...overlayMask, WebkitMaskImage: `url(${anatomiaCostasMask})`, maskImage: `url(${anatomiaCostasMask})` }}
            >
              <Overlay id="chest" selected={selected} onSelect={toggle}>
                <path d="M150 90 C134 112 130 148 140 176 L180 180 L180 96 C168 94 156 92 150 90 Z" />
                <path d="M210 90 C226 112 230 148 220 176 L180 180 L180 96 C192 94 204 92 210 90 Z" />
              </Overlay>
              <Overlay id="arms" selected={selected} onSelect={toggle}>
                <path d="M126 94 C118 108 118 138 124 156 C134 160 142 146 140 120 C138 102 132 94 126 94 Z" />
                <path d="M234 94 C242 108 242 138 236 156 C226 160 218 146 220 120 C222 102 228 94 234 94 Z" />
              </Overlay>
              <Overlay id="waist" selected={selected} onSelect={toggle}>
                <path d="M160 150 C168 148 180 148 180 188 L160 186 C154 172 154 158 160 150 Z" />
                <path d="M200 150 C192 148 180 148 180 188 L200 186 C206 172 206 158 200 150 Z" />
              </Overlay>
              <Overlay id="hips" selected={selected} onSelect={toggle}>
                <path d="M150 188 C144 200 150 216 178 218 C178 200 168 188 150 188 Z" />
                <path d="M210 188 C216 200 210 216 182 218 C182 200 192 188 210 188 Z" />
              </Overlay>
              <Overlay id="thighs" selected={selected} onSelect={toggle}>
                <path d="M144 218 C136 242 136 266 144 276 C156 280 168 266 170 242 C168 224 158 218 148 218 Z" />
                <path d="M216 218 C224 242 224 266 216 276 C204 280 192 266 190 242 C192 224 202 218 212 218 Z" />
              </Overlay>
              <Overlay id="calves" selected={selected} onSelect={toggle}>
                <path d="M140 286 C134 308 136 326 146 334 C156 334 164 316 162 296 C158 286 148 284 140 286 Z" />
                <path d="M220 286 C226 308 224 326 214 334 C204 334 196 316 198 296 C202 286 212 284 220 286 Z" />
              </Overlay>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 360 360"
        sx={{ position: "absolute", left: 0, right: 0, top: 0, aspectRatio: "1 / 1", width: "100%", pointerEvents: "none", zIndex: 2 }}
      >
        {regions.map((id) => {
          const c = callMap[id];
          const x2 = c.side === "left" ? 36 : 324;
          const dim = selected != null && selected !== id;
          return (
            <g key={id} opacity={dim ? 0.25 : 1}>
              <line x1={c.ax} y1={c.ay} x2={x2} y2={c.ay} stroke={REGION_COLOR[id]} strokeWidth={1.4} />
              <circle cx={c.ax} cy={c.ay} r={2.4} fill={REGION_COLOR[id]} />
            </g>
          );
        })}
      </Box>
      <Box sx={{ position: "absolute", left: 0, right: 0, top: 0, aspectRatio: "1 / 1", zIndex: 3, pointerEvents: "none" }}>
        {regions.map((id) => {
          const c = callMap[id];
          const meta = regionLabel(id, medidas);
          const dim = selected != null && selected !== id;
          return (
            <Box
              key={id}
              onClick={() => toggle(id)}
              sx={{
                position: "absolute",
                top: `calc(${(c.ay / 360) * 100}% - 14px)`,
                left: c.side === "left" ? 6 : "auto",
                right: c.side === "right" ? 6 : "auto",
                pointerEvents: "auto",
                cursor: "pointer",
                opacity: dim ? 0.35 : 1,
              }}
            >
              <Chip
                icon={selected === id ? "mdi:map-marker" : "mdi:circle-small"}
                nome={`${meta.nome} ${meta.valor}`}
                color={REGION_COLOR[id]}
                fontSize="70%"
              />
            </Box>
          );
        })}
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ pb: 1.25, pt: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {index === 0 ? "Frente" : "Costas"} · toque na região
        </Typography>
        {[0, 1].map((i) => (
          <Box
            key={i}
            onClick={() => goTo(i)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === index ? "#FF5356" : "#ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
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
        <AnatomyBoard medidas={data.medidas} />

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
