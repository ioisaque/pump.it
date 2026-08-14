import { Box, Button, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { addAcademia } from "api/academias";
import axios from "axios";
import AcademiaForm from "components/academias/AcademiaForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    academiaToFormData,
    buildAcademiaPayload,
    buildEmptyAcademiaFormInitialData,
} from "utils/academias/form";

export default function AcademiaAddPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoObjectUrlRef = useRef<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialData = useMemo(() => buildEmptyAcademiaFormInitialData(), []);

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current);
        logoObjectUrlRef.current = null;
      }
    };
  }, []);

  function applyLogoFile(file: File) {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = null;
    }
    const objectUrl = URL.createObjectURL(file);
    logoObjectUrlRef.current = objectUrl;
    setLogoFile(file);
    setLogoPreview(objectUrl);
  }

  function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyLogoFile(file);
  }

  function onLogoDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyLogoFile(file);
  }

  async function handleSubmit(data: Record<string, unknown>) {
    const nome = String(data.nome ?? "").trim();
    const slug = String(data.slug ?? "").trim();
    if (!nome || !slug) {
      toast.error("Informe nome e slug.");
      return;
    }
    setSaving(true);
    try {
      const payload = buildAcademiaPayload(data);
      const formData = academiaToFormData(payload, logoFile);
      const res = await addAcademia(formData);
      toast.success("Academia criada");
      await queryClient.invalidateQueries({ queryKey: ["academias"] });
      const id = res.academia?.id;
      if (id) navigate(`/plataforma/academias/${id}/edit`, { replace: true });
      else navigate("/plataforma/academias", { replace: true });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(typeof msg === "string" && msg.trim() ? msg : "Falha ao criar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:dumbbell" color="primary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                Nova academia
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preencha os dados para cadastrar
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button
              type="submit"
              form="addAcademia"
              variant="contained"
              color="info"
              disabled={saving}
              sx={{ width: 140, height: 40 }}
            >
              <Icon name="mdi:content-save-outline" />
              Salvar
            </Button>
            <Button
              onClick={() => navigate("/plataforma/academias")}
              variant="contained"
              color="quinzel"
              sx={{ width: 140, height: 40 }}
            >
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />

      <Form
        ref={formRef}
        id="addAcademia"
        initialData={initialData}
        onSubmit={handleSubmit}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={onLogoChange} />
        <AcademiaForm
          formRef={formRef}
          logoPreview={logoPreview}
          onPickLogo={() => logoInputRef.current?.click()}
          onLogoDrop={onLogoDrop}
        />
      </Form>
    </Fragment>
  );
}
