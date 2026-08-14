import { Box, Button, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { listAcademias } from "api/academias";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import AddForm from "components/pessoas/AddForm";
import { MASTER_NIVEL_ID } from "domain/auth/constants";
import useAuth from "hooks/useAuth";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import useTenantBase from "hooks/useTenantBase";
import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { buildEmptyPessoaFormInitialData, submitPessoaCreate } from "utils/pessoas/form";

function PessoaAdd() {
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isMaster = (user?.nivel ?? 0) >= MASTER_NIVEL_ID;
  const formRef = useRef<FormHandles>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const fotoObjectUrlRef = useRef<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const initialData = useMemo(
    () => buildEmptyPessoaFormInitialData(user?.academia_id),
    [user?.academia_id],
  );

  const { data: academiasData } = useQuery({
    queryKey: ["academias"],
    queryFn: listAcademias,
    enabled: isMaster,
  });
  const academias = academiasData?.academias ?? [];

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

  function onFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyFotoFile(file);
  }

  function onFotoDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyFotoFile(file);
  }

  async function handleSubmit(data: Record<string, unknown>) {
    await submitPessoaCreate(data, {
      queryClient,
      navigate,
      listPath: `${base}/pessoas`,
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
        <AddForm
          formRef={formRef}
          catalogs={{ origens: allOrigens, etiquetas: allEtiquetas, niveis: allNiveis, academias }}
          fotoPreview={fotoPreview}
          onPickFoto={() => fotoInputRef.current?.click()}
          onFotoDrop={onFotoDrop}
        />
      </Form>
    </Fragment>
  );
}

export default PessoaAdd;
