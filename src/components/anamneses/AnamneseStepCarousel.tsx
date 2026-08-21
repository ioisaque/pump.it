import { Box, IconButton, Stack, Typography } from "@mui/material";
import Icon from "components/Icon";
import { ANAMNESE_STEPS, AnamneseSection } from "domain/anamneses/constants";

export type AnamneseStepDef = {
  key: string;
  label: string;
  icon: string;
  sections: readonly AnamneseSection[];
};

function CarouselSlot({
  item,
  index,
  active,
  onClick,
}: {
  item: AnamneseStepDef | null;
  index: number;
  active: boolean;
  onClick?: () => void;
}) {
  const size = active ? 56 : 40;
  const iconSize = active ? 28 : 20;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: item ? (active ? 1 : 0.35) : 0,
        transform: active ? "scale(1)" : "scale(0.88)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: item && !active ? "auto" : "none",
        cursor: item && !active ? "pointer" : "default",
      }}
      onClick={item && onClick ? onClick : undefined}
    >
      {item ? (
        <>
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: "50%",
              bgcolor: active ? "primary.main" : "secondary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.75,
              boxShadow: active ? "0 4px 14px rgba(0, 118, 243, 0.35)" : "none",
              transition: "width 0.25s ease, height 0.25s ease, background-color 0.25s ease",
            }}
          >
            <Icon name={item.icon} width={iconSize} height={iconSize} color="#fff" />
          </Box>
          <Typography
            variant="body2"
            fontWeight={active ? 700 : 500}
            color={active ? "primary.main" : "text.secondary"}
            textAlign="center"
            noWrap
            sx={{ maxWidth: "100%", px: 0.5 }}
          >
            {index + 1}. {item.label}
          </Typography>
        </>
      ) : (
        <Box sx={{ height: 56 + 8 + 24 }} />
      )}
    </Box>
  );
}

type Props = {
  steps?: readonly AnamneseStepDef[];
  step: number;
  onPrev: () => void;
  onNext: () => void;
  onStep: (next: number) => void;
};

export default function AnamneseStepCarousel({
  steps = ANAMNESE_STEPS,
  step,
  onPrev,
  onNext,
  onStep,
}: Props) {
  const prev = step > 0 ? steps[step - 1] : null;
  const current = steps[step];
  const next = step < steps.length - 1 ? steps[step + 1] : null;
  const last = step === steps.length - 1;

  return (
    <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
      <IconButton aria-label="Etapa anterior" onClick={onPrev} sx={{ flexShrink: 0 }}>
        <Icon name="mdi:chevron-left" width={28} height={28} />
      </IconButton>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 0.5, sm: 1 },
          overflow: "hidden",
          maskImage: "linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)",
        }}
      >
        <CarouselSlot item={prev ?? null} index={step - 1} active={false} onClick={() => onStep(step - 1)} />
        <CarouselSlot item={current} index={step} active />
        <CarouselSlot item={next ?? null} index={step + 1} active={false} onClick={() => onStep(step + 1)} />
      </Box>
      <IconButton aria-label="Próxima etapa" onClick={onNext} disabled={last} sx={{ flexShrink: 0 }}>
        <Icon name="mdi:chevron-right" width={28} height={28} />
      </IconButton>
    </Stack>
  );
}
