import { api } from "services/api";

export type DashboardStats = {
  alunos: number;
  acessos_hoje: number;
  mensalidades_atraso: number;
  fichas: number;
  scope: "academia" | "self";
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("dashboard/stats");
  return data;
}
