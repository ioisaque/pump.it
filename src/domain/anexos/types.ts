export type ArquivoAnexo = {
  id: number;
  path: string;
  nome: string;
  criado_por?: number;
  criado_em?: string | null;
};

export function anexoListKey(anexo: ArquivoAnexo): string {
  return String(anexo.id);
}

export function anexoDisplayName(nome: string): string {
  const i = nome.lastIndexOf(".");
  return i > 0 ? nome.slice(0, i) : nome;
}

export function anexoExtIcon(nome: string): string {
  const ext = nome.includes(".") ? nome.slice(nome.lastIndexOf(".") + 1).toLowerCase() : "";
  if (ext === "pdf") return "mdi:file-pdf-box";
  if (ext === "doc" || ext === "docx") return "mdi:file-word-box";
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return "mdi:file-excel-box";
  if (ext === "ppt" || ext === "pptx") return "mdi:file-powerpoint-box";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"].includes(ext)) return "mdi:file-image";
  if (["zip", "rar", "7z", "gz"].includes(ext)) return "mdi:folder-zip";
  if (["mp3", "wav", "m4a", "ogg"].includes(ext)) return "mdi:file-music";
  if (["mp4", "mov", "webm"].includes(ext)) return "mdi:file-video";
  if (["txt", "md", "rtf"].includes(ext)) return "mdi:file-document-outline";
  return "mdi:file-outline";
}
