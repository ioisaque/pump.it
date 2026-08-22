import { Box, Button, MenuItem, Select, Stack, Tab, Tabs } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listFichas, vincularFichaAluno } from "api/fichas";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import Icon from "components/Icon";
import PessoaAnamnese from "components/pessoas/PessoaAnamnese";
import PessoaAvaliacoes from "components/pessoas/PessoaAvaliacoes";
import PessoaFichas from "components/pessoas/PessoaFichas";
import { formatPadraoLabel } from "domain/fichas/formatters";
import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";
import { pessoaSectionSx } from "utils/pessoas/styles";

const ACTION_BTN = { height: 40, textTransform: "none", flexShrink: 0 } as const;

function TabPanel({ value, index, children }: { value: number; index: number; children: ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function PessoaAcompanhamento({ pessoaId }: { pessoaId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [modeloId, setModeloId] = useState("");

  const { data: fichas = [] } = useQuery({
    queryKey: ["fichas", "pessoa", pessoaId],
    queryFn: () => listFichas({ id_pessoa: pessoaId }),
    enabled: tab === 2,
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ["fichas", "modelos"],
    queryFn: () => listFichas({ escopo: "modelos" }),
    enabled: tab === 2,
  });

  const vincular = useMutation({
    mutationFn: (fichaId: number) => vincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Plano vinculado.");
      setModeloId("");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível vincular o plano."),
  });

  const jaVinculados = new Set(fichas.map((f) => f.id));
  const disponiveis = modelos.filter((m) => !jaVinculados.has(m.id));

  return (
    <Box sx={{ ...pessoaSectionSx, minWidth: 0, width: "100%" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, next: number) => setTab(next)}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ flex: 1, minWidth: 0, minHeight: 40, "& .MuiTab-root": { minHeight: 40, textTransform: "none" } }}
        >
          <Tab label="Triagem & Histórico" />
          <Tab label="Avaliações Físicas" />
          <Tab label="Prescrição de Treino" />
        </Tabs>

        {tab === 1 ? (
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate(LINK("/avaliacoes/add", { pessoa: pessoaId }))}
            startIcon={<Icon name="mdi:plus" />}
            sx={ACTION_BTN}
          >
            Nova avaliação
          </Button>
        ) : null}

        {tab === 2 ? (
          <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
            <Select
              size="small"
              displayEmpty
              value={modeloId}
              onChange={(e) => setModeloId(String(e.target.value))}
              sx={{ minWidth: 160, height: 40, ...compactInputRootSx() }}
            >
              <MenuItem value="">
                <em>Escolher modelo</em>
              </MenuItem>
              {disponiveis.map((m) => (
                <MenuItem key={m.id} value={String(m.id)}>
                  {m.nome} ({formatPadraoLabel(String(m.padrao))})
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              color="success"
              disabled={!modeloId || vincular.isLoading}
              onClick={() => vincular.mutate(Number(modeloId))}
              sx={ACTION_BTN}
            >
              Vincular
            </Button>
          </Stack>
        ) : null}
      </Stack>

      <TabPanel value={tab} index={0}>
        <PessoaAnamnese pessoaId={pessoaId} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <PessoaAvaliacoes pessoaId={pessoaId} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <PessoaFichas pessoaId={pessoaId} />
      </TabPanel>
    </Box>
  );
}
