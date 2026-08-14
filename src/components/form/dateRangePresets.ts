import { addDays, endOfMonth, endOfYear, startOfMonth, startOfYear } from "date-fns";
import { TODAY } from "domain/datahora/types";
import { createStaticRanges } from "react-date-range";

export const dateRangeStaticRanges = createStaticRanges([
  {
    label: "Hoje",
    range: () => {
      const t = TODAY();
      return { startDate: t, endDate: t };
    },
  },
  {
    label: "Este ano",
    range: () => {
      const t = TODAY();
      return { startDate: startOfYear(t), endDate: endOfYear(t) };
    },
  },
  {
    label: "Este mês",
    range: () => {
      const t = TODAY();
      return { startDate: startOfMonth(t), endDate: endOfMonth(t) };
    },
  },
  {
    label: "Mês passado",
    range: () => {
      const t = TODAY();
      const prev = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      return { startDate: startOfMonth(prev), endDate: endOfMonth(prev) };
    },
  },
  {
    label: "Últimos 7 dias",
    range: () => {
      const t = TODAY();
      return { startDate: addDays(t, -6), endDate: t };
    },
  },
  {
    label: "Últimos 30 dias",
    range: () => {
      const t = TODAY();
      return { startDate: addDays(t, -29), endDate: t };
    },
  },
]);
