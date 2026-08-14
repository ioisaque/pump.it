import { Box } from "@mui/material";

type GoogleMapEmbedProps = {
  latitude?: number | null;
  longitude?: number | null;
  /** Fallback search query when coords are missing (e.g. address). */
  query?: string | null;
  height?: number | string;
};

function hasUsableCoords(latitude?: number | null, longitude?: number | null): boolean {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    !(Number(latitude) === 0 && Number(longitude) === 0)
  );
}

/** Lightweight map embed (sistema clone shape; no reverse-geocode). */
export default function GoogleMapEmbed({
  latitude,
  longitude,
  query,
  height = 220,
}: GoogleMapEmbedProps) {
  const usable = hasUsableCoords(latitude, longitude);
  const q = usable ? `${latitude},${longitude}` : query?.trim() || "Brasil";
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${usable ? 14 : query?.trim() ? 14 : 4}&output=embed`;

  return (
    <Box
      sx={{
        width: "100%",
        height,
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        component="iframe"
        title="Mapa"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sx={{ border: 0, width: "100%", height: "100%" }}
      />
    </Box>
  );
}
