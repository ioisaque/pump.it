import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Slider,
    Stack,
    Typography,
} from "@mui/material";
import GridColorPicker from "components/data-table/GridColorPicker";
import Icon from "components/Icon";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type FotoCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
};

const FUNDO_ATALHOS = ["#ffffff", "#000000", "#FF5356", "#33CC66", "#0076F3", "#FFD22B", "#9900CC", "#F5617F"];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function rotatedBounds(width: number, height: number, rotation: number) {
  const rad = toRadians(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

async function imageHasAlpha(src: string): Promise<boolean> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  const w = Math.min(image.width, 256);
  const h = Math.min(image.height, 256);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(image, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

async function cropToJpegFile(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  fileName: string,
  fillColor?: string,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");

  const { width: bBoxWidth, height: bBoxHeight } = rotatedBounds(image.width, image.height, rotation);
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, bBoxWidth, bBoxHeight);
  }

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(toRadians(rotation));
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const cropped = document.createElement("canvas");
  const croppedCtx = cropped.getContext("2d");
  if (!croppedCtx) throw new Error("Canvas indisponível.");

  cropped.width = pixelCrop.width;
  cropped.height = pixelCrop.height;
  if (fillColor) {
    croppedCtx.fillStyle = fillColor;
    croppedCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);
  }
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const base = fileName.replace(/\.[^/.]+$/, "") || "foto";
  const blob = await new Promise<Blob>((resolve, reject) => {
    cropped.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Falha ao gerar a imagem."))),
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export default function FotoCropDialog({
  open,
  imageSrc,
  fileName = "foto.jpg",
  onClose,
  onConfirm,
}: FotoCropDialogProps) {
  const mobileDialog = useMobileDialog("xs");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasAlpha, setHasAlpha] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setBusy(false);
    setHasAlpha(false);
    setBgColor("#ffffff");
    if (!imageSrc) return;
    let cancelled = false;
    imageHasAlpha(imageSrc)
      .then((alpha) => {
        if (!cancelled) setHasAlpha(alpha);
      })
      .catch(() => {
        if (!cancelled) setHasAlpha(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels || busy) return;
    setBusy(true);
    try {
      const file = await cropToJpegFile(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileName,
        hasAlpha ? bgColor : undefined,
      );
      onConfirm(file);
      onClose();
    } catch {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} {...mobileDialog}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        Ajustar foto
        <IconButton aria-label="Fechar" onClick={onClose} disabled={busy} edge="end" size="small">
          <Icon name="mdi:close" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: mobileDialog.fullScreen ? "min(60vh, 420px)" : 280,
            bgcolor: hasAlpha ? bgColor : "#111",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              style={{
                containerStyle: {
                  background: hasAlpha ? bgColor : "#111",
                },
              }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </Box>

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {hasAlpha ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fundo
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                <Box sx={{ width: 28, height: 28, flexShrink: 0 }}>
                  <GridColorPicker value={bgColor} onChange={setBgColor} readOnly={busy} />
                </Box>
                {FUNDO_ATALHOS.map((hex) => (
                  <Box
                    key={hex}
                    component="button"
                    type="button"
                    aria-label={`Fundo ${hex}`}
                    disabled={busy}
                    onClick={() => setBgColor(hex)}
                    sx={{
                      width: 28,
                      height: 28,
                      p: 0,
                      bgcolor: hex,
                      border: "1px solid",
                      borderColor: bgColor.toLowerCase() === hex.toLowerCase() ? "success.main" : "text.secondary",
                      borderRadius: 1,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : null}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(_, value) => setZoom(value as number)}
              disabled={busy}
              size="small"
            />
          </Box>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<Icon name="mdi:rotate-left" width={18} />}
              onClick={() => setRotation((r) => r - 90)}
              disabled={busy}
            >
              −90°
            </Button>
            <Button
              variant="outlined"
              startIcon={<Icon name="mdi:rotate-right" width={18} />}
              onClick={() => setRotation((r) => r + 90)}
              disabled={busy}
            >
              +90°
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} disabled={busy} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={busy || !croppedAreaPixels} variant="contained" color="success">
          {busy ? "Aplicando…" : "Usar foto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
