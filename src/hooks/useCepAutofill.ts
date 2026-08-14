import { FormHandles } from "@unform/core";
import { ChangeEvent, RefObject, useCallback, useRef, useState } from "react";
import { handleBuscarCep } from "domain/shared/formatters";
import { digitsOnly } from "utils/ideyou-masks";

export function useCepAutofill(formRef: RefObject<FormHandles | null>) {
  const [cepLoading, setCepLoading] = useState(false);
  const lastFetchedCepRef = useRef<string | null>(null);

  const buscarCep = useCallback(
    async (force = false) => {
      if (cepLoading) return;

      const raw = digitsOnly(String(formRef.current?.getData().cep ?? ""));
      if (raw.length !== 8) {
        if (force) {
          await handleBuscarCep(formRef.current);
        }
        return;
      }

      if (!force && lastFetchedCepRef.current === raw) {
        return;
      }

      setCepLoading(true);
      try {
        await handleBuscarCep(formRef.current);
        lastFetchedCepRef.current = raw;
      } finally {
        setCepLoading(false);
      }
    },
    [cepLoading, formRef],
  );

  const onCepChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = digitsOnly(event.target.value);
      if (raw.length === 8) {
        void buscarCep(false);
      }
    },
    [buscarCep],
  );

  return { cepLoading, buscarCep, onCepChange };
}
