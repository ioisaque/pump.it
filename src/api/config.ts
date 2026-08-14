import { api } from "services/api";

export type AppConfigResponse = {
  timezone: string;
  current_date: string;
  current_date_override: string | null;
  now: string;
  academia_id: number | null;
};

export async function getAppConfig(): Promise<AppConfigResponse> {
  const { data } = await api.get<AppConfigResponse>("app/config");
  return data;
}

export async function saveAppConfig(body: {
  timezone?: string;
  current_date?: string | null;
  academia_id?: number | null;
}): Promise<AppConfigResponse> {
  const { data } = await api.patch<AppConfigResponse>("app/config", body);
  return data;
}
