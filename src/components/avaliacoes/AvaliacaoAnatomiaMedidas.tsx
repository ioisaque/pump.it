import { Box, Typography } from "@mui/material";
import AnatomiaFigure, { ANATOMIA_HIGHLIGHT, type AnatomiaGroupProp } from "components/AnatomiaFigure";
import Input from "components/form/Input";
import { pessoaSectionSx } from "utils/pessoas/styles";

type MedidaField = {
  name: string;
  label: string;
  id: AnatomiaGroupProp["id"];
  view: "frente" | "costas";
  ax: number;
  ay: number;
  side: "left" | "right";
};

const PERIMETRIA: MedidaField[] = [
  { name: "pescoco", label: "Pescoço", id: "traps", view: "frente", ax: 200, ay: 48, side: "right" },
  { name: "ombro", label: "Ombro", id: "shoulders", view: "frente", ax: 222, ay: 78, side: "right" },
  { name: "peito", label: "Tórax", id: "chest", view: "frente", ax: 210, ay: 108, side: "right" },
  { name: "cintura", label: "Cintura", id: "abs", view: "frente", ax: 208, ay: 152, side: "right" },
  { name: "abdomen", label: "Abdômen", id: "abs", view: "frente", ax: 200, ay: 168, side: "right" },
  { name: "braco_esq", label: "Braço E", id: "biceps", view: "frente", ax: 122, ay: 118, side: "left" },
  { name: "braco_dir", label: "Braço D", id: "biceps", view: "frente", ax: 238, ay: 118, side: "right" },
  { name: "braco_esq_contr", label: "Braço E contr.", id: "biceps", view: "frente", ax: 110, ay: 138, side: "left" },
  { name: "braco_dir_contr", label: "Braço D contr.", id: "biceps", view: "frente", ax: 250, ay: 138, side: "right" },
  { name: "antebraco_esq", label: "Antebr. E", id: "biceps", view: "frente", ax: 116, ay: 168, side: "left" },
  { name: "antebraco_dir", label: "Antebr. D", id: "biceps", view: "frente", ax: 244, ay: 168, side: "right" },
  { name: "coxa_esq", label: "Coxa E", id: "quads", view: "frente", ax: 144, ay: 236, side: "left" },
  { name: "coxa_dir", label: "Coxa D", id: "quads", view: "frente", ax: 216, ay: 236, side: "right" },
  { name: "panturrilha_esq", label: "Pantur. E", id: "calves", view: "frente", ax: 142, ay: 308, side: "left" },
  { name: "panturrilha_dir", label: "Pantur. D", id: "calves", view: "frente", ax: 218, ay: 308, side: "right" },
  { name: "quadril", label: "Quadril", id: "glutes", view: "costas", ax: 214, ay: 176, side: "right" },
];

const DOBRAS: MedidaField[] = [
  { name: "dobra_peitoral", label: "Peitoral", id: "chest", view: "frente", ax: 210, ay: 108, side: "right" },
  { name: "dobra_axilar", label: "Axilar média", id: "chest", view: "frente", ax: 228, ay: 118, side: "right" },
  { name: "dobra_abdominal", label: "Abdominal", id: "abs", view: "frente", ax: 208, ay: 152, side: "right" },
  { name: "dobra_bicipital", label: "Bíceps", id: "biceps", view: "frente", ax: 122, ay: 118, side: "left" },
  { name: "dobra_suprailiaca", label: "Supra-ilíaca", id: "glutes", view: "frente", ax: 214, ay: 176, side: "right" },
  { name: "dobra_coxa", label: "Coxa", id: "quads", view: "frente", ax: 144, ay: 246, side: "left" },
  { name: "dobra_tricipital", label: "Tricipital", id: "triceps", view: "costas", ax: 124, ay: 118, side: "left" },
  { name: "dobra_subescapular", label: "Subescapular", id: "back", view: "costas", ax: 214, ay: 128, side: "right" },
  { name: "dobra_perna", label: "Perna", id: "calves", view: "costas", ax: 140, ay: 308, side: "left" },
];

function MedidaInput({ name, label }: { name: string; label: string }) {
  return (
    <Input
      name={name}
      label={label}
      type="number"
      inputProps={{ step: "0.1", inputMode: "decimal" }}
      sx={{
        width: 108,
        "& .MuiInputBase-root": { bgcolor: "#fff" },
      }}
    />
  );
}

function groupsFrom(fields: MedidaField[]): AnatomiaGroupProp[] {
  return fields.map((f) => ({
    id: f.id,
    text: f.name,
    color: ANATOMIA_HIGHLIGHT,
    view: f.view,
    ax: f.ax,
    ay: f.ay,
    side: f.side,
  }));
}

function AnatomiaMedidasSection({
  title,
  caption,
  fields,
}: {
  title: string;
  caption?: string;
  fields: MedidaField[];
}) {
  const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
  return (
    <Box sx={pessoaSectionSx}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {caption ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          {caption}
        </Typography>
      ) : null}
      <AnatomiaFigure
        groups={groupsFrom(fields)}
        monocromatico
        renderCallout={(g) => {
          const f = byName[g.text];
          return f ? <MedidaInput name={f.name} label={f.label} /> : null;
        }}
      />
    </Box>
  );
}

export default function AvaliacaoAnatomiaMedidas() {
  return (
    <>
      <AnatomiaMedidasSection title="Perimetria (cm)" fields={PERIMETRIA} />
      <AnatomiaMedidasSection
        title="Dobras cutâneas (mm)"
        caption="Jackson & Pollock 7: peitoral, axilar média, tríceps, subescapular, abdominal, supra-ilíaca e coxa. Bíceps e perna entram na distribuição."
        fields={DOBRAS}
      />
    </>
  );
}
