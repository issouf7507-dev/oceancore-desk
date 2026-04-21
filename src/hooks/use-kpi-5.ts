import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_5,
  type DashboardKpi5Normalized,
} from "@/services/dashboardKpisService";
import { daysAgo, toISODate } from "@/lib/utils";
export function useKpi5() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpi5, setKpi5] = React.useState<DashboardKpi5Normalized | null>(null);
  const [page, setPage] = React.useState(1);
  const [dateStart, setDateStart] = React.useState(daysAgo(90));
  const [dateEnd, setDateEnd] = React.useState(toISODate(new Date()));

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(
    async (p: number, start: string, end: string) => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        // const kpi_5 = await fetchDashboardKpi_5(token, p);
        // setKpi5(kpi_5);
        const result = await fetchDashboardKpi_5(token, {
          page: p,
          start,
          end,
          per_page: 20,
        });
        setKpi5(result);
      } catch (e: any) {
        const message = e?.message
          ? String(e.message)
          : "Erreur lors du chargement des KPI";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  React.useEffect(() => {
    void load(page, dateStart, dateEnd);
  }, [load, page, dateStart, dateEnd]);

  function search(start: string, end: string) {
    setDateStart(start);
    setDateEnd(end);
    setPage(1); // reset page à chaque nouvelle recherche
  }

  function reset() {
    const start = daysAgo(90);
    const end = toISODate(new Date());
    setDateStart(start);
    setDateEnd(end);
    setPage(1);
  }

  return {
    kpi5,
    loading,
    error,
    page,
    setPage,
    dateStart,
    dateEnd,
    search, // appelé depuis la page au submit
    reset, // appelé depuis le bouton réinitialiser
    refetch: () => load(page, dateStart, dateEnd),
  };
}
