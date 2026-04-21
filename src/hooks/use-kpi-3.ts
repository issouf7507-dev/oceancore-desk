import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_3,
  type DashboardKpi3Normalized,
} from "@/services/dashboardKpisService";

export function useKpi3() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpi3, setKpi3] = React.useState<DashboardKpi3Normalized | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const kpi_3 = await fetchDashboardKpi_3(token);
      setKpi3(kpi_3);
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
    kpi3,
    loading,
    error,
    refetch: load,
  };
}
