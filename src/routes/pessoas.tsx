import { lazy } from "react";
import { Route } from "react-router-dom";

const PessoaList = lazy(() => import("views/pessoas/list"));
const PessoaAdd = lazy(() => import("views/pessoas/add"));
const PessoaEdit = lazy(() => import("views/pessoas/edit"));

export const pessoasRoutes = (
  <>
    <Route path="pessoas" element={<PessoaList />} />
    <Route path="pessoas/add" element={<PessoaAdd />} />
    <Route path="pessoas/:id/edit" element={<PessoaEdit />} />
  </>
);
