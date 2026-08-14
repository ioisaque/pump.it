import { Exercicio, ExercicioAnexo, ExercicioFormData } from "domain/exercicios/types";
import { api } from "services/api";

export async function listExercicios(): Promise<Exercicio[]> {
  const { data } = await api.get<{ exercicios: Exercicio[] }>("exercicios");
  return data.exercicios ?? [];
}

export async function findExercicio(id: number): Promise<Exercicio> {
  const { data } = await api.get<{ exercicio: Exercicio }>(`exercicios/${id}`);
  return data.exercicio;
}

export async function addExercicio(body: ExercicioFormData): Promise<Exercicio> {
  const { data } = await api.post<{ exercicio: Exercicio }>("exercicios/add", body);
  return data.exercicio;
}

export async function saveExercicio(id: number, body: ExercicioFormData): Promise<Exercicio> {
  const { data } = await api.patch<{ exercicio: Exercicio }>(`exercicios/${id}`, body);
  return data.exercicio;
}

export async function deleteExercicio(id: number): Promise<void> {
  await api.delete(`exercicios/${id}/delete`);
}

export async function uploadExercicioAnexo(id: number, file: File): Promise<ExercicioAnexo> {
  const formData = new FormData();
  formData.append("arquivo", file);
  const { data } = await api.post<{ anexo: ExercicioAnexo }>(`exercicios/${id}/anexos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.anexo;
}

export async function addExercicioYoutubeAnexo(id: number, url: string): Promise<ExercicioAnexo> {
  const { data } = await api.post<{ anexo: ExercicioAnexo }>(`exercicios/${id}/anexos/youtube`, { url });
  return data.anexo;
}

export async function reorderExercicioAnexos(id: number, ids: number[]): Promise<void> {
  await api.patch(`exercicios/${id}/anexos/ordem`, { ids });
}

export async function deleteExercicioAnexo(id: number, anexoId: number): Promise<void> {
  await api.delete(`exercicios/${id}/anexos/${anexoId}`);
}
