import { Box, Grid, MenuItem, Chip as MuiChip, TextField, Typography } from "@mui/material";
import { FormHandles } from "@unform/core";
import { Academia } from "api/academias";
import Chip from "components/Chip";
import FormDateInput from "components/form/FormDateInput";
import Input from "components/form/Input";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import Select from "components/form/Select";
import GoogleMapEmbed from "components/GoogleMapEmbed";
import EntityHeader from "components/layout/EntityHeader";
import UserAvatar from "components/UserAvatar";
import { BR_UF } from "constants/brazil";
import { PessoaDetail } from "domain/pessoas/types";
import { Flag } from "domain/tabelas/types";
import { useCepAutofill } from "hooks/useCepAutofill";
import { Fragment, ReactNode, RefObject } from "react";
import { pessoaSectionSx } from "utils/pessoas/styles";

export type PessoaFormCatalogs = {
  origens?: Flag[];
  etiquetas?: Flag[];
  niveis?: Flag[];
  academias?: Academia[];
  academiaNome?: string | null;
  academiaRequired?: boolean;
};

type EditFormProps = {
  formRef: RefObject<FormHandles | null>;
  catalogs: PessoaFormCatalogs;
  pessoa: PessoaDetail;
  fotoPreview?: string | null;
  onPickFoto?: () => void;
  onFotoDrop?: (file: File) => void;
  /** Conteúdo entre o card de dados pessoais e o de endereço (ex. abas de acompanhamento). */
  afterDados?: ReactNode;
};

export default function EditForm({
  formRef,
  catalogs,
  pessoa,
  fotoPreview,
  onPickFoto,
  onFotoDrop,
  afterDados,
}: EditFormProps) {
  const { origens = [], etiquetas = [], niveis = [], academias = [], academiaNome, academiaRequired = true } = catalogs;
  const { cepLoading, buscarCep, onCepChange } = useCepAutofill(formRef);

  return (
    <Fragment>
      <Box sx={pessoaSectionSx}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid
            item
            xs={12}
            md={1}
            sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "center" } }}
          >
            <UserAvatar
              foto={fotoPreview}
              instagram={pessoa.instagram}
              name={pessoa.nome}
              size={47}
              onClick={onPickFoto}
              onFotoDrop={onFotoDrop}
              showUploadOnHover
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Input name="nome" label="Nome" />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormDateInput name="data_nasc" label="Data de nascimento" />
          </Grid>
          <Grid item xs={12} md={2}>
            <Input name="cpf_cnpj" label="CPF/CNPJ" />
          </Grid>
          <Grid item xs={12} md={2}>
            <Input name="contato" label="Contato" prepend={{ icon: "logos:whatsapp-icon", color: "#25d366" }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Select name="nivel" label="Nível" catalogOptions={niveis}>
              {niveis.map((n) => (
                <MenuItem key={n.id} value={String(n.id)}>
                  {n.nome}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Input type="email" name="email" label="E-mail" prepend={{ icon: "line-md:email", color: "#d32f2f" }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Select name="origem" label="Origem" catalogOptions={origens}>
              {origens.map((o) => (
                <MenuItem key={o.id} value={String(o.id)}>
                  {o.nome}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <Select name="etiqueta" label="Etiqueta" catalogOptions={etiquetas}>
              {etiquetas.map((e) => (
                <MenuItem key={e.id} value={String(e.id)}>
                  {e.nome}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <Input name="instagram" label="Instagram" prepend={{ icon: "line-md:instagram", color: "#c13584" }} />
          </Grid>
          <Grid item xs={12} md={2}>
            {academiaNome ? (
              <>
                <Box sx={{ display: "none" }}>
                  <Input name="academia_id" />
                </Box>
                <TextField
                  label="Academia"
                  value={academiaNome}
                  disabled
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={compactInputRootSx()}
                />
              </>
            ) : (
              <Select name="academia_id" label="Academia" required={academiaRequired}>
                <MenuItem value="">
                  <em>Selecione</em>
                </MenuItem>
                {academias.map((a) => (
                  <MenuItem key={a.id} value={String(a.id)}>
                    {a.nome}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Grid>
        </Grid>
      </Box>

      {afterDados}

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
          Acesso
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Input
              name="pin"
              type="number"
              inputMode="numeric"
              label="PIN (deixe em branco para não alterar)"
              autoComplete="off"
              prepend={{ icon: "pin", color: "primary.main" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input
              type="password"
              name="senha1"
              label="Nova senha (opcional)"
              autoComplete="new-password"
              prepend={{ icon: "streamline-plump:password-lock", color: "error.main" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Input
              type="password"
              name="senha2"
              label="Repita a nova senha"
              autoComplete="new-password"
              prepend={{ icon: "streamline-plump:password-lock", color: "error.dark" }}
            />
          </Grid>
        </Grid>

        <EntityHeader
          left={
            <Fragment>
              {pessoa.device ? (
                <Chip
                  icon={pessoa.device.icon}
                  text={`${pessoa.device.HW} - ${pessoa.device.OS}`}
                  color={pessoa.device.color}
                />
              ) : null}
              {pessoa.ip ? (
                <MuiChip
                  size="small"
                  sx={(theme) => ({
                    color: theme.palette.neutral.contrastText,
                    backgroundColor: theme.palette.neutral.dark,
                  })}
                  label={pessoa.ip !== "::1" ? String(pessoa.ip) : "LocalHost"}
                />
              ) : null}
            </Fragment>
          }
          right={
            <Grid container spacing={2} sx={{ flex: 1, maxWidth: { md: "100%" } }}>
              <Grid item xs={12} md={4}>
                <Input name="ip" label="IP" prepend={{ icon: "line-md:my-location-loop", color: "#4caf50" }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Input name="latitude" label="Latitude" type="number" />
              </Grid>
              <Grid item xs={12} md={4}>
                <Input name="longitude" label="Longitude" type="number" />
              </Grid>
            </Grid>
          }
        />
        <GoogleMapEmbed latitude={pessoa.latitude} longitude={pessoa.longitude} />
      </Box>
    </Fragment>
  );
}
