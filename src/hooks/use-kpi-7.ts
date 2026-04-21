import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_7,
  type DashboardKpi7Normalized,
} from "@/services/dashboardKpisService";
import { daysAgo, toISODate } from "@/lib/utils";

export function useKpi7() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpi7, setKpi7] = React.useState<DashboardKpi7Normalized | null>(null);
  const [dateStart, setDateStart] = React.useState(daysAgo(90));
  const [dateEnd, setDateEnd] = React.useState(toISODate(new Date()));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(
    async (start: string, end: string) => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const kpi_7 = await fetchDashboardKpi_7(token, {
          start,
          end,
        });
        setKpi7(kpi_7);
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
    void load(dateStart, dateEnd);
  }, [load, dateStart, dateEnd]);

  function search(start: string, end: string) {
    setDateStart(start);
    setDateEnd(end);
  }

  function reset() {
    const start = daysAgo(90);
    const end = toISODate(new Date());
    setDateStart(start);
    setDateEnd(end);
  }

  return {
    kpi7,
    loading,
    error,
    dateStart,
    dateEnd,
    search, // appelé depuis la page au submit
    reset, // appelé depuis le bouton réinitialiser
    refetch: () => load(dateStart, dateEnd),
  };
}
