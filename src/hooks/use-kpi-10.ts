import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_10,
  type DashboardKpi10Normalized,
} from "@/services/dashboardKpisService";

export function useKpi10() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpi10, setKpi10] = React.useState<DashboardKpi10Normalized | null>(
    null,
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const kpi_10 = await fetchDashboardKpi_10(token);
      setKpi10(kpi_10);
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
    kpi10,
    loading,
    error,
    refetch: load,
  };
}
