import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack } from "@mui/material";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Icon from "components/Icon";
import { ACESSO_TIPO_LABEL } from "domain/acessos/labels";
import { ACESSO_TIPOS, Acesso, AcessoFormValues, AcessoTipo } from "domain/acessos/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  initial?: Partial<Acesso> | null;
  defaultTipo?: AcessoTipo;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: AcessoFormValues) => void;
};

export default function AcessoFormDialog({
  open,
  title,
  initial,
  defaultTipo = "ENTRADA",
  saving,
  onClose,
  onSubmit,
}: Props) {
  const formRef = useRef<FormHandles>(null);
  const mobileDialog = useMobileDialog("xs");

  useEffect(() => {
    if (!open) return;
    formRef.current?.setData({
      id_pessoa: initial?.id_pessoa != null ? String(initial.id_pessoa) : "",
      tipo: (initial?.tipo as AcessoTipo) || defaultTipo,
      criado_em: initial?.criado_em ?? "",
      origem: initial?.origem ?? "",
    });
  }, [open, initial, defaultTipo]);

  function handleSubmit(data: Record<string, string>) {
    const idPessoa = Number(data.id_pessoa);
    if (!idPessoa) return;
    onSubmit({
      id_pessoa: idPessoa,
      tipo: (data.tipo as AcessoTipo) || defaultTipo,
      criado_em: data.criado_em || "",
      origem: data.origem || "",
    });
  }

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialog}>
      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Input name="id_pessoa" label="ID pessoa" type="number" required inputProps={{ min: 1 }} />
            <Select name="tipo" label="Tipo" required>
              {ACESSO_TIPOS.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {ACESSO_TIPO_LABEL[tipo]}
                </MenuItem>
              ))}
            </Select>
            <Input
              name="criado_em"
              label="Criado em"
              placeholder="YYYY-MM-DD HH:mm:ss"
              helperText="Vazio = agora (servidor)"
            />
            <Input name="origem" label="Origem" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={!!saving} variant="contained" color="quinzel" sx={{ width: 140, height: 40 }}>
            <Icon name="undo" />
            Voltar
          </Button>
          <Button type="submit" variant="contained" color="info" disabled={!!saving} sx={{ width: 140, height: 40 }}>
            <Icon name="mdi:content-save-outline" />
            Salvar
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
