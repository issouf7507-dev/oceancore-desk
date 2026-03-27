import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpis,
  type DashboardKpisNormalized,
} from "@/services/dashboardKpisService";

export function useDashboardKpis() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpis, setKpis] = React.useState<DashboardKpisNormalized | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardKpis(token);
      setKpis(data);
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

  return { kpis, loading, error, refetch: load };
}
