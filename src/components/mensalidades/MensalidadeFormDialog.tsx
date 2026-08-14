import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { addMensalidade, saveMensalidade } from "api/mensalidades";
import Input from "components/form/Input";
import Select from "components/form/Select";
import Icon from "components/Icon";
import { MENSALIDADE_STATUS, MENSALIDADE_STATUS_LABEL, Mensalidade } from "domain/mensalidades/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  academiaId?: number;
  initial?: Mensalidade | null;
};

type FormData = {
  id_pessoa: string;
  competencia: string;
  valor: string;
  vencimento: string;
  status: string;
};

export default function MensalidadeFormDialog({ open, onClose, academiaId, initial }: Props) {
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);
  const editing = !!initial?.id;
  const mobileDialog = useMobileDialog("sm");

  useEffect(() => {
    if (!open) return;
    formRef.current?.setData({
      id_pessoa: initial?.id_pessoa != null ? String(initial.id_pessoa) : "",
      competencia: initial?.competencia ?? "",
      valor: initial?.valor != null ? String(initial.valor) : "",
      vencimento: initial?.vencimento ?? "",
      status: initial?.status ?? MENSALIDADE_STATUS.PENDING,
    });
  }, [open, initial]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        id_pessoa: Number(data.id_pessoa),
        competencia: data.competencia,
        valor: Number(data.valor),
        vencimento: data.vencimento,
        status: data.status,
      };
      if (editing && initial) {
        return saveMensalidade(initial.id, body, academiaId);
      }
      return addMensalidade(body, academiaId);
    },
    onSuccess: async () => {
      toast.success(editing ? "Mensalidade atualizada." : "Mensalidade criada.");
      await queryClient.invalidateQueries({ queryKey: ["mensalidades"] });
      onClose();
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  return (
    <Dialog open={open} onClose={onClose} {...mobileDialog}>
      <Form
        ref={formRef}
        onSubmit={(data: FormData) => mutation.mutate(data)}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <DialogTitle>{editing ? "Editar mensalidade" : "Nova mensalidade"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Input name="id_pessoa" label="ID pessoa" required disabled={editing} />
            <Input name="competencia" label="Competência (YYYY-MM)" required placeholder="2026-08" />
            <Input
              name="valor"
              label="Valor"
              type="number"
              required
              inputProps={{ step: "0.01", min: "0.01" }}
            />
            <Input
              name="vencimento"
              label="Vencimento"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
            />
            <Select name="status" label="Status">
              {Object.values(MENSALIDADE_STATUS).map((s) => (
                <MenuItem key={s} value={s}>
                  {MENSALIDADE_STATUS_LABEL[s] ?? s}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={onClose} variant="contained" color="quinzel" sx={{ width: 140, height: 40 }}>
            <Icon name="undo" />
            Voltar
          </Button>
          <Button type="submit" variant="contained" color="info" disabled={mutation.isLoading} sx={{ width: 140, height: 40 }}>
            <Icon name="mdi:content-save-outline" />
            Salvar
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
