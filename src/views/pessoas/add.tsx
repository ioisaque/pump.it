import { Box, Button, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { findAcademia, findAcademiaPublic, listAcademias } from "api/academias";
import FotoCropDialog from "components/FotoCropDialog";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import AddForm from "components/pessoas/AddForm";
import { PESSOA_NIVEL } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import useTenantBase from "hooks/useTenantBase";
import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";
import { buildEmptyPessoaFormInitialData, submitPessoaCreate } from "utils/pessoas/form";

function PessoaAdd() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { academiaSlug } = useTenantBase();
  const boundAcademiaId = user?.academia_id && user.academia_id > 0 ? user.academia_id : undefined;
  const lockAcademia = Boolean(academiaSlug);
  const academiaRequired = lockAcademia || (user?.nivel ?? 0) < PESSOA_NIVEL.APP;
  const canListAcademias = !lockAcademia && (user?.nivel ?? 0) >= PESSOA_NIVEL.APP;
  const formRef = useRef<FormHandles>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const fotoObjectUrlRef = useRef<string | null>(null);
  const cropSrcRef = useRef<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("foto.jpg");

  const initialData = useMemo(
    () => buildEmptyPessoaFormInitialData(user?.academia_id),
    [user?.academia_id],
  );

  const { data: academiasData } = useQuery({
    queryKey: ["academias"],
    queryFn: listAcademias,
    enabled: canListAcademias,
  });
  const academias = academiasData?.academias ?? [];

  const { data: tenantAcademia } = useQuery({
    queryKey: ["academia", "self", boundAcademiaId],
    queryFn: () => findAcademia(boundAcademiaId as number),
    enabled: lockAcademia && boundAcademiaId != null,
  });
  const { data: publicAcademia } = useQuery({
    queryKey: ["academia", "public", academiaSlug],
    queryFn: () => findAcademiaPublic(academiaSlug as string),
    enabled: lockAcademia && !tenantAcademia?.academia.nome,
  });
  const academiaNome = lockAcademia
    ? tenantAcademia?.academia.nome || publicAcademia?.nome || academiaSlug || ""
    : null;

  const { origens: allOrigens, etiquetas: allEtiquetas, niveis: allNiveis } = useFlagCatalogs([
    "origens",
    "etiquetas",
    "niveis",
  ]);

  useEffect(() => {
    return () => {
      if (fotoObjectUrlRef.current) {
        URL.revokeObjectURL(fotoObjectUrlRef.current);
        fotoObjectUrlRef.current = null;
      }
      if (cropSrcRef.current) {
        URL.revokeObjectURL(cropSrcRef.current);
        cropSrcRef.current = null;
      }
    };
  }, []);

  function applyFotoFile(file: File) {
    if (fotoObjectUrlRef.current) {
      URL.revokeObjectURL(fotoObjectUrlRef.current);
      fotoObjectUrlRef.current = null;
    }
    const objectUrl = URL.createObjectURL(file);
    fotoObjectUrlRef.current = objectUrl;
    setFotoFile(file);
    setFotoPreview(objectUrl);
  }

  function openFotoCrop(file: File) {
    if (cropSrcRef.current) {
      URL.revokeObjectURL(cropSrcRef.current);
      cropSrcRef.current = null;
    }
    const url = URL.createObjectURL(file);
    cropSrcRef.current = url;
    setCropSrc(url);
    setCropFileName(file.name || "foto.jpg");
  }

  function closeFotoCrop() {
    if (cropSrcRef.current) {
      URL.revokeObjectURL(cropSrcRef.current);
      cropSrcRef.current = null;
    }
    setCropSrc(null);
  }

  function onFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    openFotoCrop(file);
  }

  function onFotoDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    openFotoCrop(file);
  }

  async function handleSubmit(data: Record<string, unknown>) {
    await submitPessoaCreate(data, {
      queryClient,
      navigate,
      listPath: LINK("/pessoas"),
      fotoFile,
    });
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="person_add" color="primary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                Nova pessoa
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preencha os dados para cadastrar
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button type="submit" form="addPessoa" variant="contained" color="info" sx={{ width: 140, height: 40 }}>
              <Icon name="mdi:content-save-outline" />
              Salvar
            </Button>
            <Button onClick={() => navigate(-1)} variant="contained" color="quinzel" sx={{ width: 140, height: 40 }}>
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />

      <Form
        ref={formRef}
        id="addPessoa"
        initialData={initialData}
        onSubmit={handleSubmit}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <input ref={fotoInputRef} type="file" accept="image/*" hidden onChange={onFotoChange} />
        <FotoCropDialog
          open={Boolean(cropSrc)}
          imageSrc={cropSrc}
          fileName={cropFileName}
          onClose={closeFotoCrop}
          onConfirm={applyFotoFile}
        />
        <AddForm
          formRef={formRef}
          catalogs={{ origens: allOrigens, etiquetas: allEtiquetas, niveis: allNiveis, academias, academiaNome, academiaRequired }}
          fotoPreview={fotoPreview}
          onPickFoto={() => fotoInputRef.current?.click()}
          onFotoDrop={onFotoDrop}
        />
      </Form>
    </Fragment>
  );
}

export default PessoaAdd;
