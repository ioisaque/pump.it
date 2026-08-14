import { Box, Grid, MenuItem, Typography } from "@mui/material";
import { FormHandles } from "@unform/core";
import Input from "components/form/Input";
import Select from "components/form/Select";
import GoogleMapEmbed from "components/GoogleMapEmbed";
import UserAvatar from "components/UserAvatar";
import { BR_UF } from "constants/brazil";
import { useCepAutofill } from "hooks/useCepAutofill";
import { Fragment, RefObject, useEffect, useState } from "react";
import { academiaAddressQuery } from "utils/academias/form";
import { pessoaSectionSx } from "utils/pessoas/styles";

type AcademiaFormProps = {
  formRef: RefObject<FormHandles | null>;
  logoPreview?: string | null;
  onPickLogo?: () => void;
  onLogoDrop?: (file: File) => void;
  showStatus?: boolean;
  mapQuery?: string | null;
};

export default function AcademiaForm({
  formRef,
  logoPreview,
  onPickLogo,
  onLogoDrop,
  showStatus = false,
  mapQuery = null,
}: AcademiaFormProps) {
  const { cepLoading, buscarCep, onCepChange } = useCepAutofill(formRef);
  const [liveMapQuery, setLiveMapQuery] = useState<string | null>(null);

  useEffect(() => {
    if (cepLoading) return;
    const data = formRef.current?.getData?.() as Parameters<typeof academiaAddressQuery>[0] | undefined;
    if (!data) return;
    const q = academiaAddressQuery(data);
    if (q) setLiveMapQuery(q);
  }, [cepLoading, formRef]);

  return (
    <Fragment>
      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Identidade
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid
            item
            xs={12}
            md={1}
            sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "center" } }}
          >
            <UserAvatar
              foto={logoPreview}
              size={47}
              onClick={onPickLogo}
              onFotoDrop={onLogoDrop}
              showUploadOnHover
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Input name="nome" label="Nome fantasia" />
          </Grid>
          <Grid item xs={12} md={3}>
            <Input name="razao_social" label="Razão social" />
          </Grid>
          <Grid item xs={12} md={2}>
            <Input name="cnpj" label="CNPJ" />
          </Grid>
          <Grid item xs={12} md={showStatus ? 2 : 3}>
            <Input name="slug" label="Slug" />
          </Grid>
          {showStatus ? (
            <Grid item xs={12} md={1}>
              <Select name="status" label="Status">
                <MenuItem value="ACTIVE">Ativa</MenuItem>
                <MenuItem value="BLOCKED">Bloqueada</MenuItem>
              </Select>
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Input type="email" name="email" label="E-mail" prepend={{ icon: "line-md:email", color: "#d32f2f" }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Input name="contato" label="Contato" prepend={{ icon: "logos:whatsapp-icon", color: "#25d366" }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Input name="instagram" label="Instagram" prepend={{ icon: "line-md:instagram", color: "#c13584" }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Input name="site" label="Site" prepend={{ icon: "mdi:web", color: "info.main" }} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Endereço
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Input
              type="text"
              inputMode="numeric"
              name="cep"
              label="CEP"
              placeholder="00000-000"
              onChange={onCepChange}
              append={{
                icon: "fa:send",
                bgcolor: "success.dark",
                disabled: cepLoading,
                onClick: () => void buscarCep(true),
                tooltip: cepLoading ? "Consultando CEP…" : "Buscar endereço pelo CEP (ViaCEP)",
                ariaLabel: "Preencher pelo CEP",
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Select name="estado" label="Estado (UF)" native>
              <option value="" />
              {BR_UF.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Input type="text" name="cidade" label="Cidade" inputMode="text" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input type="text" name="bairro" label="Bairro" inputMode="text" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input type="text" name="logradouro" label="Logradouro" inputMode="text" />
          </Grid>
          <Grid item xs={12} md={2}>
            <Input type="number" name="numero" label="Número" inputMode="numeric" />
          </Grid>
          <Grid item xs={12}>
            <Input name="complemento" label="Complemento" />
          </Grid>
        </Grid>
      </Box>

      <Box sx={pessoaSectionSx}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Localização
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          O mapa usa o endereço preenchido acima quando disponível.
        </Typography>
        <GoogleMapEmbed query={liveMapQuery ?? mapQuery} />
      </Box>
    </Fragment>
  );
}
