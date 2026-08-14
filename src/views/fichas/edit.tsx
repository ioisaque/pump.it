import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { findFicha, saveFicha } from "api/fichas";
import FichaForm from "components/fichas/FichaForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { fichaQueryKey, fichasQueryKey } from "domain/fichas/constants";
import { FichaPayload } from "domain/fichas/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import useTenantBase from "hooks/useTenantBase";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const BTN_140 = { width: 140, height: 40 } as const;

export default function FichaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fichaId = Number(id);
  const { base } = useTenantBase();
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const pessoaId = Number(searchParams.get("pessoa"));
  const [pending, setPending] = useState<FichaPayload | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: fichaQueryKey(fichaId),
    queryFn: () => findFicha(fichaId),
    enabled: Number.isFinite(fichaId) && fichaId > 0,
    retry: 1,
  });

  async function persist(payload: FichaPayload) {
    const saved = await saveFicha(fichaId, payload);
    toast.success("Ficha salva.");
    await queryClient.invalidateQueries({ queryKey: fichasQueryKey });
    await queryClient.invalidateQueries({ queryKey: fichaQueryKey(fichaId) });
    if (saved.id !== fichaId) {
      await queryClient.invalidateQueries({ queryKey: fichaQueryKey(saved.id) });
    }
    if (Number.isFinite(pessoaId) && pessoaId > 0) {
      navigate(`${base}/pessoas/${pessoaId}`, { replace: true });
      return;
    }
    navigate(`${base}/fichas`, { replace: true });
  }

  async function handleSubmit(payload: FichaPayload) {
    if (isCliente) return;
    const shared = (Boolean(data?.modelo) && (data?.alunos_count ?? 0) >= 1) || (data?.alunos_count ?? 0) > 1;
    if (shared) {
      setPending(payload);
      return;
    }
    try {
      await persist(payload);
    } catch {
      toast.error("Não foi possível salvar a ficha.");
    }
  }

  async function confirmSave(salvar_como: "todos" | "novo") {
    if (!pending) return;
    try {
      await persist({
        ...pending,
        salvar_como,
        id_pessoa: salvar_como === "novo" && pessoaId > 0 ? pessoaId : pending.id_pessoa,
      });
      setPending(null);
    } catch {
      toast.error("Não foi possível salvar a ficha.");
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">Ficha não encontrada.</Alert>
        <Button
          sx={{ mt: 2, width: 140, height: 40 }}
          variant="contained"
          color="quinzel"
          onClick={() => navigate(`${base}/fichas`)}
        >
          <Icon name="undo" />
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:clipboard-list-outline" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Ficha: #{String(data.id).padStart(5, "0")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.nome}
                {data.modelo ? " · modelo" : ""}
                {(data.alunos_count ?? 0) > 0 ? ` · ${data.alunos_count} aluno(s)` : ""}
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            {isCliente ? null : (
              <Button type="submit" form="editFicha" variant="contained" color="info" sx={BTN_140}>
                <Icon name="mdi:content-save-outline" />
                Salvar
              </Button>
            )}
            <Button onClick={() => navigate(-1)} variant="contained" color="quinzel" sx={BTN_140}>
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />
      <FichaForm formId="editFicha" initial={data} onSubmit={handleSubmit} />

      <Dialog open={Boolean(pending)} onClose={() => setPending(null)}>
        <DialogTitle>Esta ficha é compartilhada</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {data.modelo
              ? "Este é um modelo. Alterar para todos os alunos vinculados, ou criar uma cópia só para este aluno?"
              : `Esta ficha está vinculada a ${data.alunos_count} alunos. Alterar para todos ou criar uma nova só para este aluno?`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, flexWrap: "wrap", gap: 1 }}>
          <Button variant="contained" color="quinzel" onClick={() => setPending(null)}>
            Cancelar
          </Button>
          <Button variant="contained" color="info" onClick={() => confirmSave("todos")}>
            Alterar para todos
          </Button>
          {pessoaId > 0 ? (
            <Button variant="contained" color="success" onClick={() => confirmSave("novo")}>
              Criar nova só para este aluno
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
