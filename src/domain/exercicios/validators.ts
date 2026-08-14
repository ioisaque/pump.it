import { ExercicioFormData } from "./types";

export function validateExercicioForm(data: ExercicioFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.nome?.trim()) {
    errors.nome = "Informe o nome.";
  } else if (data.nome.trim().length > 128) {
    errors.nome = "Nome com no máximo 128 caracteres.";
  }
  return errors;
}
