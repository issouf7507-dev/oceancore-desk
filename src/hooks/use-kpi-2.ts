import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_2,
  type DashboardKpi2Normalized,
} from "@/services/dashboardKpisService";

export function useKpi2() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpi2, setKpi2] = React.useState<DashboardKpi2Normalized | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const kpi_2 = await fetchDashboardKpi_2(token);
      setKpi2(kpi_2);
    } catch (e: any) {
      const message = e?.message
        ? String(e.message)
        : "Erreur lors du chargement des KPI";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    kpi2,
    loading,
    error,
    refetch: load,
  };
}
