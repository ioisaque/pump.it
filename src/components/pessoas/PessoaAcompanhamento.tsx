import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import Icon from "components/Icon";
import PessoaAnamnese from "components/pessoas/PessoaAnamnese";
import { PessoaAnexosDialog, type PessoaAnexo } from "components/pessoas/PessoaAnexos";
import PessoaAvaliacoes from "components/pessoas/PessoaAvaliacoes";
import PessoaFichas from "components/pessoas/PessoaFichas";
import { useState, type ReactNode } from "react";
import { pessoaSectionSx } from "utils/pessoas/styles";

function TabPanel({ value, index, children }: { value: number; index: number; children: ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function PessoaAcompanhamento({ pessoaId }: { pessoaId: number }) {
  const [tab, setTab] = useState(0);
  const [anexosOpen, setAnexosOpen] = useState(false);
  const [anexos, setAnexos] = useState<PessoaAnexo[]>([]);

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
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setAnexosOpen(true)}
          startIcon={<Icon name="mdi:paperclip" />}
          sx={{ height: 40, textTransform: "none", flexShrink: 0 }}
        >
          Anexos{anexos.length ? ` (${anexos.length})` : ""}
        </Button>
      </Stack>

      <PessoaAnexosDialog
        open={anexosOpen}
        onClose={() => setAnexosOpen(false)}
        saved={anexos}
        onSave={setAnexos}
      />

      <TabPanel value={tab} index={0}>
        <PessoaAnamnese pessoaId={pessoaId} anexos={anexos} />
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
