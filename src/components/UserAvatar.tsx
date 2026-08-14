import { Avatar, Box } from "@mui/material";
import { DragEvent, useEffect, useMemo, useState } from "react";
import { apiOrigin } from "services/api";
import Icon from "./Icon";

type UserAvatarProps = {
  foto?: string | null;
  instagram?: string | null;
  name?: string | null;
  size?: number;
  onClick?: () => void;
  onFotoDrop?: (file: File) => void;
  showUploadOnHover?: boolean;
  fallbackIcon?: string;
};

export default function UserAvatar({
  foto,
  instagram,
  size = 40,
  onClick,
  onFotoDrop,
  showUploadOnHover = false,
  fallbackIcon = "mdi:account",
}: UserAvatarProps) {
  const isLocalPreview = Boolean(foto?.startsWith("blob:") || foto?.startsWith("data:"));

  const instagramHandle = useMemo(() => {
    const raw = instagram?.trim();
    if (!raw) return null;

    let value = raw;
    if (value.includes("instagram.com")) {
      try {
        const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
        value = parsed.pathname;
      } catch {
        value = value.replace(/^https?:\/\/(www\.)?instagram\.com/i, "");
      }
    }

    const normalized = value
      .replace(/^@/, "")
      .replace(/^\/+/, "")
      .split(/[/?#]/)[0]
      ?.trim();
    return normalized || null;
  }, [instagram]);

  const instagramProxyUrl = instagramHandle
    ? `${apiOrigin()}/api/instagram-avatar/${encodeURIComponent(instagramHandle)}`
    : null;

  const uploadUrl = useMemo(() => {
    if (!foto) return null;
    if (foto.includes("unavatar.io")) return null;
    if (foto.startsWith("http") || foto.startsWith("blob:") || foto.startsWith("data:")) return foto;
    return `${apiOrigin()}${foto.startsWith("/") ? foto : `/${foto}`}`;
  }, [foto]);

  const sources = useMemo(() => {
    const orderedSources: string[] = [];
    if (uploadUrl) orderedSources.push(uploadUrl);
    // Arquivo local recém-escolhido: não cair no Instagram se o blob falhar/atrasar.
    if (!isLocalPreview && instagramProxyUrl) orderedSources.push(instagramProxyUrl);
    return orderedSources;
  }, [uploadUrl, instagramProxyUrl, isLocalPreview]);

  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => {
    setSourceIndex(0);
  }, [sources]);

  const src = sources[sourceIndex] ?? null;
  const [dragOver, setDragOver] = useState(false);
  const canUpload = Boolean(onClick || onFotoDrop);

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    if (!onFotoDrop) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!onFotoDrop) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    if (!onFotoDrop) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      onFotoDrop(file);
    }
  }

  return (
    <Box
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        cursor: canUpload ? "pointer" : "default",
        outline: "none",
        ...(dragOver && {
          outline: "2px dashed",
          outlineColor: "primary.light",
          outlineOffset: 2,
        }),
        "& .upload-overlay": {
          opacity: dragOver ? 1 : 0,
        },
        "&:hover .upload-overlay": {
          opacity: showUploadOnHover && canUpload ? 1 : 0,
        },
      }}
    >
      <Avatar
        key={src ?? "empty"}
        src={src ?? undefined}
        imgProps={{
          referrerPolicy: "no-referrer",
          onError: () => {
            setSourceIndex((current) => {
              if (isLocalPreview) return sources.length;
              return current + 1;
            });
          },
        }}
        sx={{
          width: size,
          height: size,
          bgcolor: "neutral.main",
          border: "none",
          boxShadow: "none",
          "& img": { border: "none" },
        }}
      >
        <Icon
          name={fallbackIcon}
          color="#fff"
          width={Math.max(16, Math.round(size * 0.4))}
          height={Math.max(16, Math.round(size * 0.4))}
        />
      </Avatar>

      {showUploadOnHover && canUpload ? (
        <Box
          className="upload-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            bgcolor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.2s ease",
          }}
        >
          <Icon name="mdi:upload" color="#fff" width="1.25em" height="1.25em" />
        </Box>
      ) : null}
    </Box>
  );
}
