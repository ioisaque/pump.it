import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import Icon from "components/Icon";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

GlobalWorkerOptions.workerSrc = pdfWorker;

type FitMode = "width" | "height";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 1.25;
const PAD = 32;

function pdfFilename(title: string): string {
  const base = title.trim() || "documento";
  return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
}

async function fetchPdfBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Falha ao obter o arquivo.");
  return res.blob();
}

function PdfPage({
  pdf,
  pageNumber,
  fitMode,
  zoom,
  availW,
  availH,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  fitMode: FitMode;
  zoom: number;
  availW: number;
  availH: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderLockRef = useRef(Promise.resolve());

  useEffect(() => {
    if (!availW || !availH || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    const work = (async () => {
      await renderLockRef.current.catch(() => undefined);
      if (cancelled || canvasRef.current !== canvas) return;

      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled || canvasRef.current !== canvas) return;

        const base = page.getViewport({ scale: 1 });
        const fitScale = fitMode === "height" ? availH / base.height : availW / base.width;
        const scale = fitScale * zoom;
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (cancelled) return;

        const task = page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        renderTask = task;
        if (cancelled) {
          task.cancel();
          try {
            await task.promise;
          } catch {
            // ignore
          }
          return;
        }
        await task.promise;
      } catch {
        // Cancelled or aborted render — ignore.
      }
    })();

    renderLockRef.current = work.then(
      () => undefined,
      () => undefined,
    );

    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch {
        // ignore
      }
    };
  }, [pdf, pageNumber, fitMode, zoom, availW, availH]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      sx={{
        display: "block",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    />
  );
}

type Props = {
  url: string;
  title: string;
};

export default function AnexoPdfPreview({ url, title }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [availW, setAvailW] = useState(0);
  const [availH, setAvailH] = useState(0);
  const [fitMode, setFitMode] = useState<FitMode>("height");
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nextW = Math.max(0, Math.floor(el.clientWidth - PAD));
        const nextH = Math.max(0, Math.floor(el.clientHeight - PAD));
        setAvailW((prev) => (Math.abs(prev - nextW) < 2 ? prev : nextW));
        setAvailH((prev) => (Math.abs(prev - nextH) < 2 ? prev : nextH));
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setPdf(null);
    setNumPages(0);
    setZoom(1);
    setFitMode("height");

    void getDocument(url)
      .promise.then((doc) => {
        if (cancelled) {
          void doc.destroy();
          return;
        }
        setPdf(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    return () => {
      void pdf?.destroy();
    };
  }, [pdf]);

  const setFit = (mode: FitMode) => {
    setFitMode(mode);
    setZoom(1);
  };

  const zoomBy = (factor: number) => {
    setZoom((prev) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(prev * factor * 100) / 100)));
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await fetchPdfBlob(url);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = pdfFilename(title);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Não foi possível baixar o PDF.");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await fetchPdfBlob(url);
      const filename = pdfFilename(title);
      const file = new File([blob], filename, { type: "application/pdf" });

      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text: title });
        return;
      }
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text: title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Link copiado. Compartilhamento nativo indisponível neste dispositivo.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Não foi possível compartilhar o PDF.");
    } finally {
      setBusy(false);
    }
  };

  if (failed) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: "100%", px: 3 }}>
        <Icon name="mdi:file-pdf-box" color="error.main" width={64} />
        <Typography color="text.secondary" textAlign="center">
          Não foi possível pré-visualizar o PDF.
        </Typography>
        <Button
          variant="contained"
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<Icon name="mdi:open-in-new" width={18} />}
        >
          Abrir em nova aba
        </Button>
      </Stack>
    );
  }

  const ready = !loading && pdf && availW > 0 && availH > 0;

  return (
    <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box
        ref={wrapRef}
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          overflow: "auto",
          bgcolor: "grey.300",
          p: 2,
          boxSizing: "border-box",
        }}
      >
        {!ready ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "40vh" }}>
            <CircularProgress size={36} />
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center" aria-label={title}>
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={`${url}-${i + 1}`}
                pdf={pdf}
                pageNumber={i + 1}
                fitMode={fitMode}
                zoom={zoom}
                availW={availW}
                availH={availH}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap={0.5}
        sx={{
          flexShrink: 0,
          px: 1.5,
          py: 1,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Tooltip title="Diminuir zoom">
          <span>
            <IconButton size="large" disabled={!ready || zoom <= ZOOM_MIN} onClick={() => zoomBy(1 / ZOOM_STEP)}>
              <Icon name="mdi:magnify-minus-outline" width={28} />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 52, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="Aumentar zoom">
          <span>
            <IconButton size="large" disabled={!ready || zoom >= ZOOM_MAX} onClick={() => zoomBy(ZOOM_STEP)}>
              <Icon name="mdi:magnify-plus-outline" width={28} />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 0.75 }} />

        <Tooltip title="Ajustar à largura">
          <IconButton
            size="large"
            color={fitMode === "width" ? "primary" : "default"}
            disabled={!ready}
            onClick={() => setFit("width")}
          >
            <Icon name="mdi:arrow-expand-horizontal" width={28} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ajustar à altura">
          <IconButton
            size="large"
            color={fitMode === "height" ? "primary" : "default"}
            disabled={!ready}
            onClick={() => setFit("height")}
          >
            <Icon name="mdi:arrow-expand-vertical" width={28} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 0.75 }} />

        <Tooltip title="Baixar">
          <span>
            <IconButton size="large" disabled={!ready || busy} onClick={() => void handleDownload()}>
              <Icon name="mdi:download" width={28} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Compartilhar / enviar cópia">
          <span>
            <IconButton size="large" disabled={!ready || busy} onClick={() => void handleShare()}>
              <Icon name="mdi:share-variant" width={28} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
