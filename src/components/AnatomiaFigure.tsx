import { Box, IconButton, Stack, Typography } from "@mui/material";
import Chip from "components/Chip";
import Icon from "components/Icon";
import useAnatomiaGenero from "hooks/useAnatomiaGenero";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { useMemo, useRef, useState, type ReactNode } from "react";

/** Cor única do highlight (multiply sobre a máscara). */
export const ANATOMIA_HIGHLIGHT = "#FF5356";

export const ANATOMIA_GRUPOS = [
  "shoulders",
  "chest",
  "biceps",
  "triceps",
  "abs",
  "traps",
  "back",
  "glutes",
  "quads",
  "hams",
  "calves",
] as const;

export type AnatomiaGrupo = (typeof ANATOMIA_GRUPOS)[number];

export type AnatomiaGroupProp = {
  id: AnatomiaGrupo;
  text: string;
  /** Cor do cadastro (`id_musculos`). Ignorada se `monocromatico`. */
  color?: string;
  icon?: string;
};

const FRONT_CALL: Partial<Record<AnatomiaGrupo, { ax: number; ay: number; side: "left" | "right" }>> = {
  shoulders: { ax: 222, ay: 78, side: "right" },
  chest: { ax: 210, ay: 108, side: "right" },
  biceps: { ax: 122, ay: 118, side: "left" },
  abs: { ax: 208, ay: 152, side: "right" },
  quads: { ax: 144, ay: 236, side: "left" },
  calves: { ax: 142, ay: 308, side: "left" },
};

const BACK_CALL: Partial<Record<AnatomiaGrupo, { ax: number; ay: number; side: "left" | "right" }>> = {
  shoulders: { ax: 222, ay: 78, side: "right" },
  traps: { ax: 190, ay: 106, side: "right" },
  back: { ax: 214, ay: 128, side: "right" },
  triceps: { ax: 124, ay: 118, side: "left" },
  glutes: { ax: 214, ay: 186, side: "right" },
  hams: { ax: 144, ay: 246, side: "left" },
  calves: { ax: 140, ay: 308, side: "left" },
};

export function anatomiaGrupoFromNome(nome: string): AnatomiaGrupo | null {
  const n = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/peit|peitoral|chest/.test(n)) return "chest";
  if (/trapez/.test(n)) return "traps";
  if (/costas|dorsal|latiss|lombar/.test(n)) return "back";
  if (/ombro|deltoid/.test(n)) return "shoulders";
  if (/bicep/.test(n)) return "biceps";
  if (/tricep/.test(n)) return "triceps";
  if (/abdomen|obliquo|core|abs|cintura/.test(n)) return "abs";
  if (/quadric|coxa/.test(n) && !/posterior|femor/.test(n)) return "quads";
  if (/posterior|femor|isquiot/.test(n)) return "hams";
  if (/glute|quadril/.test(n)) return "glutes";
  if (/panturr|gemel|calf/.test(n)) return "calves";
  return null;
}

function Overlay({
  fill,
  dim,
  children,
}: {
  fill: string;
  dim: boolean;
  children: ReactNode;
}) {
  if (!fill) return null;
  return (
    <g fill={fill} fillOpacity={dim ? 0.18 : 1}>
      {children}
    </g>
  );
}

type AnatomiaFigureProps = {
  groups: AnatomiaGroupProp[];
  selectable?: boolean;
  /** `true`: tudo em `#FF5356`. Padrão `false`: cores do cadastro de músculos. */
  monocromatico?: boolean;
};

export default function AnatomiaFigure({
  groups,
  selectable = false,
  monocromatico = false,
}: AnatomiaFigureProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<AnatomiaGrupo | null>(null);
  const { genero, setGenero, assets } = useAnatomiaGenero();
  const { frente, costas, frenteMask, costasMask } = assets;
  const { musculos: musculosCatalog } = useFlagCatalogs(["musculos"]);

  const catalogByGrupo = useMemo(() => {
    const map = new Map<AnatomiaGrupo, { color: string; icon: string }>();
    for (const flag of musculosCatalog ?? []) {
      const gid = anatomiaGrupoFromNome(flag.nome);
      if (gid && !map.has(gid) && flag.color) {
        map.set(gid, { color: flag.color, icon: flag.icon });
      }
    }
    return map;
  }, [musculosCatalog]);

  const paint = (id: AnatomiaGrupo, group?: AnatomiaGroupProp) => {
    if (monocromatico) return ANATOMIA_HIGHLIGHT;
    return group?.color || catalogByGrupo.get(id)?.color || ANATOMIA_HIGHLIGHT;
  };
  const iconFor = (id: AnatomiaGrupo, group?: AnatomiaGroupProp) =>
    group?.icon || catalogByGrupo.get(id)?.icon || "mdi:circle-small";

  const byId = new Map(groups.map((g) => [g.id, g]));
  const active = new Set(groups.map((g) => g.id));
  const focus = selectable ? selected : null;
  const dimId = (id: AnatomiaGrupo) => Boolean(focus && focus !== id);

  const goTo = (next: number) => {
    const el = scrollerRef.current;
    if (!el || next < 0 || next > 1) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };

  const toggle = (id: AnatomiaGrupo) => {
    if (!selectable) return;
    setSelected((cur) => (cur === id ? null : id));
  };

  const callMap = index === 0 ? FRONT_CALL : BACK_CALL;
  const callouts = groups.filter((g) => g.id in callMap);

  const overlayMask = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    mixBlendMode: "multiply" as const,
    WebkitMaskImage: `url(${index === 0 ? frenteMask : costasMask})`,
    maskImage: `url(${index === 0 ? frenteMask : costasMask})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    maskMode: "alpha" as const,
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
        <IconButton aria-label="Anterior" onClick={() => goTo(index - 1)} sx={{ ...arrowSx, left: 4 }}>
          <Icon name="mdi:chevron-left" width={36} height={36} />
        </IconButton>
      ) : null}
      {index < 1 ? (
        <IconButton aria-label="Próximo" onClick={() => goTo(index + 1)} sx={{ ...arrowSx, right: 4 }}>
          <Icon name="mdi:chevron-right" width={36} height={36} />
        </IconButton>
      ) : null}
      <Stack
        direction="row"
        spacing={0.25}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          zIndex: 5,
          bgcolor: "#fff",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          aria-label="Anatomia masculina"
          onClick={() => setGenero("masc")}
          sx={{ p: 0.5, color: genero === "masc" ? "#0076F3" : "text.disabled" }}
        >
          <Icon name="mdi:gender-male" width={20} height={20} />
        </IconButton>
        <IconButton
          aria-label="Anatomia feminina"
          onClick={() => setGenero("fem")}
          sx={{ p: 0.5, color: genero === "fem" ? "#F5617F" : "text.disabled" }}
        >
          <Icon name="mdi:gender-female" width={20} height={20} />
        </IconButton>
      </Stack>
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
            <Box
              component="img"
              src={frente}
              alt="Frente"
              draggable={false}
              sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
            <Box
              component="svg"
              viewBox="0 0 360 360"
              sx={{ ...overlayMask, WebkitMaskImage: `url(${frenteMask})`, maskImage: `url(${frenteMask})` }}
            >
              <Overlay fill={active.has("shoulders") ? paint("shoulders", byId.get("shoulders")) : ""} dim={dimId("shoulders")}>
                <path d="M140 66 C132 70 128 80 130 92 C134 102 146 102 154 92 C154 80 150 70 140 66 Z" />
                <path d="M220 66 C228 70 232 80 230 92 C226 102 214 102 206 92 C206 80 210 70 220 66 Z" />
              </Overlay>
              <Overlay fill={active.has("chest") ? paint("chest", byId.get("chest")) : ""} dim={dimId("chest")}>
                <path d="M180 76 C164 76 152 86 150 102 C152 116 164 124 180 122 C180 104 180 88 180 76 Z" />
                <path d="M180 76 C196 76 208 86 210 102 C208 116 196 124 180 122 C180 104 180 88 180 76 Z" />
              </Overlay>
              <Overlay fill={active.has("biceps") ? paint("biceps", byId.get("biceps")) : ""} dim={dimId("biceps")}>
                <path d="M126 96 C116 104 114 124 116 146 C122 154 134 150 138 132 C140 114 136 100 126 96 Z" />
                <path d="M234 96 C244 104 246 124 244 146 C238 154 226 150 222 132 C220 114 224 100 234 96 Z" />
              </Overlay>
              <Overlay fill={active.has("abs") ? paint("abs", byId.get("abs")) : ""} dim={dimId("abs")}>
                <path d="M168 122 C176 120 180 120 180 176 L168 176 C162 158 162 138 168 122 Z" />
                <path d="M192 122 C184 120 180 120 180 176 L192 176 C198 158 198 138 192 122 Z" />
                <path d="M154 128 C146 142 146 164 154 178 L168 176 C164 152 160 134 168 124 Z" />
                <path d="M206 128 C214 142 214 164 206 178 L192 176 C196 152 200 134 192 124 Z" />
              </Overlay>
              <Overlay fill={active.has("quads") ? paint("quads", byId.get("quads")) : ""} dim={dimId("quads")}>
                <path d="M144 214 C138 238 136 262 142 276 C152 280 166 268 168 242 C166 224 158 214 148 214 Z" />
                <path d="M216 214 C222 238 224 262 218 276 C208 280 194 268 192 242 C194 224 202 214 212 214 Z" />
              </Overlay>
              <Overlay fill={active.has("calves") ? paint("calves", byId.get("calves")) : ""} dim={dimId("calves")}>
                <path d="M142 286 C136 308 138 326 148 334 C158 334 164 316 162 298 C160 288 152 284 142 286 Z" />
                <path d="M218 286 C224 308 222 326 212 334 C202 334 196 316 198 298 C200 288 208 284 218 286 Z" />
              </Overlay>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", boxSizing: "border-box" }}>
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <Box
              component="img"
              src={costas}
              alt="Costas"
              draggable={false}
              sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
            <Box component="svg" viewBox="0 0 360 360" sx={{ ...overlayMask, WebkitMaskImage: `url(${costasMask})`, maskImage: `url(${costasMask})` }}>
              <Overlay fill={active.has("traps") ? paint("traps", byId.get("traps")) : ""} dim={dimId("traps")}>
                <path d="M180 52 C164 58 154 70 158 86 C168 90 180 84 180 52 Z" />
                <path d="M180 52 C196 58 206 70 202 86 C192 90 180 84 180 52 Z" />
                <path d="M170 84 C164 108 166 128 174 142 L180 144 L180 84 Z" />
                <path d="M190 84 C196 108 194 128 186 142 L180 144 L180 84 Z" />
              </Overlay>
              <Overlay fill={active.has("shoulders") ? paint("shoulders", byId.get("shoulders")) : ""} dim={dimId("shoulders")}>
                <path d="M138 68 C130 74 128 86 132 96 C138 104 150 102 156 90 C154 78 148 68 138 68 Z" />
                <path d="M222 68 C230 74 232 86 228 96 C222 104 210 102 204 90 C206 78 212 68 222 68 Z" />
              </Overlay>
              <Overlay fill={active.has("back") ? paint("back", byId.get("back")) : ""} dim={dimId("back")}>
                <path d="M150 96 C134 118 130 150 140 176 L176 178 L176 102 C164 100 154 98 150 96 Z" />
                <path d="M210 96 C226 118 230 150 220 176 L184 178 L184 102 C196 100 206 98 210 96 Z" />
              </Overlay>
              <Overlay fill={active.has("triceps") ? paint("triceps", byId.get("triceps")) : ""} dim={dimId("triceps")}>
                <path d="M126 94 C118 108 118 138 124 156 C134 160 142 146 140 120 C138 102 132 94 126 94 Z" />
                <path d="M234 94 C242 108 242 138 236 156 C226 160 218 146 220 120 C222 102 228 94 234 94 Z" />
              </Overlay>
              <Overlay fill={active.has("glutes") ? paint("glutes", byId.get("glutes")) : ""} dim={dimId("glutes")}>
                <path d="M146 162 C136 176 140 198 160 210 C172 214 180 204 180 186 C176 168 162 158 146 162 Z" />
                <path d="M214 162 C224 176 220 198 200 210 C188 214 180 204 180 186 C184 168 198 158 214 162 Z" />
              </Overlay>
              <Overlay fill={active.has("hams") ? paint("hams", byId.get("hams")) : ""} dim={dimId("hams")}>
                <path d="M144 218 C136 242 136 266 144 276 C156 280 168 266 170 242 C168 224 158 218 148 218 Z" />
                <path d="M216 218 C224 242 224 266 216 276 C204 280 192 266 190 242 C192 224 202 218 212 218 Z" />
              </Overlay>
              <Overlay fill={active.has("calves") ? paint("calves", byId.get("calves")) : ""} dim={dimId("calves")}>
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
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          aspectRatio: "1 / 1",
          width: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {callouts.map((g) => {
          const c = callMap[g.id];
          if (!c) return null;
          const x2 = c.side === "left" ? 36 : 324;
          const color = paint(g.id, g);
          return (
            <g key={g.id} opacity={dimId(g.id) ? 0.25 : 1}>
              <line x1={c.ax} y1={c.ay} x2={x2} y2={c.ay} stroke={color} strokeWidth={1.4} />
              <circle cx={c.ax} cy={c.ay} r={2.4} fill={color} />
            </g>
          );
        })}
      </Box>
      <Box sx={{ position: "absolute", left: 0, right: 0, top: 0, aspectRatio: "1 / 1", zIndex: 3, pointerEvents: "none" }}>
        {callouts.map((g) => {
          const c = callMap[g.id];
          if (!c) return null;
          const label = g.text;
          return (
            <Box
              key={g.id}
              onClick={() => toggle(g.id)}
              sx={{
                position: "absolute",
                top: `calc(${(c.ay / 360) * 100}% - 12px)`,
                left: c.side === "left" ? 6 : "auto",
                right: c.side === "right" ? 6 : "auto",
                pointerEvents: selectable ? "auto" : "none",
                cursor: selectable ? "pointer" : "default",
                opacity: dimId(g.id) ? 0.35 : 1,
              }}
            >
              <Chip icon={iconFor(g.id, g)} nome={label} color={paint(g.id, g)} fontSize="72%" />
            </Box>
          );
        })}
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ pb: 1.25, pt: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {index === 0 ? "Frente" : "Costas"}
          {selectable ? " · toque na região" : ""}
        </Typography>
        {[0, 1].map((i) => (
          <Box
            key={i}
            onClick={() => goTo(i)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === index ? ANATOMIA_HIGHLIGHT : "#ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
