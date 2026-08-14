import { RequireStaff } from "components/auth/RequireAuth";
import { lazy } from "react";
import { Navigate, Route, useParams, useSearchParams } from "react-router-dom";
import { LINK, LinkQuery } from "utils/link";

const FichasList = lazy(() => import("views/fichas/list"));
const FichaAdd = lazy(() => import("views/fichas/add"));
const FichaEdit = lazy(() => import("views/fichas/edit"));
const FichaTreino = lazy(() => import("views/fichas/treino"));

function searchQuery(search: URLSearchParams): LinkQuery {
  const query: LinkQuery = {};
  search.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

function RedirectFichasIndex() {
  const [search] = useSearchParams();
  return <Navigate to={LINK("/workout-plans", searchQuery(search))} replace />;
}

function RedirectFichasAdd() {
  const [search] = useSearchParams();
  return <Navigate to={LINK("/workout-plans/add", searchQuery(search))} replace />;
}

function RedirectFichasEdit() {
  const { id } = useParams();
  const [search] = useSearchParams();
  return <Navigate to={LINK(`/workout-plans/${id}/edit`, searchQuery(search))} replace />;
}

function RedirectFichasTreino() {
  const { id } = useParams();
  const [search] = useSearchParams();
  return <Navigate to={LINK(`/workout-plans/${id}/treino`, searchQuery(search))} replace />;
}

export const fichasRoutes = (
  <>
    <Route path="workout-plans" element={<FichasList />} />
    <Route path="workout-plans/:id/treino" element={<FichaTreino />} />
    <Route element={<RequireStaff />}>
      <Route path="workout-plans/add" element={<FichaAdd />} />
      <Route path="workout-plans/:id/edit" element={<FichaEdit />} />
    </Route>
    <Route path="fichas" element={<RedirectFichasIndex />} />
    <Route path="fichas/add" element={<RedirectFichasAdd />} />
    <Route path="fichas/:id/edit" element={<RedirectFichasEdit />} />
    <Route path="fichas/:id/treino" element={<RedirectFichasTreino />} />
  </>
);
