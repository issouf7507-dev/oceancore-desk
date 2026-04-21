import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_1,
  fetchDashboardKpi_10,
  fetchDashboardKpi_2,
  fetchDashboardKpi_3,
  fetchDashboardKpi_4,
  fetchDashboardKpi_5,
  fetchDashboardKpi_6,
  fetchDashboardKpi_7,
  fetchDashboardKpi_8,
  fetchDashboardKpi_9,
  fetchDashboardKpis,
  type DashboardKpi10Normalized,
  type DashboardKpi1Normalized,
  type DashboardKpi2Normalized,
  type DashboardKpi3Normalized,
  type DashboardKpi4Normalized,
  type DashboardKpi5Normalized,
  type DashboardKpi6Normalized,
  type DashboardKpi7Normalized,
  type DashboardKpi8Normalized,
  type DashboardKpi9Normalized,
  type DashboardKpisNormalized,
} from "@/services/dashboardKpisService";

export function useDashboardKpis() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpis, setKpis] = React.useState<DashboardKpisNormalized | null>(null);
  const [kpi1, setKpi1] = React.useState<DashboardKpi1Normalized | null>(null);
  const [kpi2, setKpi2] = React.useState<DashboardKpi2Normalized | null>(null);
  const [kpi3, setKpi3] = React.useState<DashboardKpi3Normalized | null>(null);
  const [kpi4, setKpi4] = React.useState<DashboardKpi4Normalized | null>(null);
  const [kpi5, setKpi5] = React.useState<DashboardKpi5Normalized | null>(null);
  const [kpi6, setKpi6] = React.useState<DashboardKpi6Normalized | null>(null);
  const [kpi7, setKpi7] = React.useState<DashboardKpi7Normalized | null>(null);
  const [kpi8, setKpi8] = React.useState<DashboardKpi8Normalized | null>(null);
  const [kpi9, setKpi9] = React.useState<DashboardKpi9Normalized | null>(null);
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
      const data = await fetchDashboardKpis(token);
      const kpi_1 = await fetchDashboardKpi_1(token);
      const kpi_2 = await fetchDashboardKpi_2(token);
      const kpi_3 = await fetchDashboardKpi_3(token);
      const kpi_4 = await fetchDashboardKpi_4(token);
      // ss
      const kpi_5 = await fetchDashboardKpi_5(token);
      const kpi_6 = await fetchDashboardKpi_6(token);
      // ss
      const kpi_7 = await fetchDashboardKpi_7(token);
      const kpi_8 = await fetchDashboardKpi_8(token);
      // ss
      const kpi_9 = await fetchDashboardKpi_9(token);
      const kpi_10 = await fetchDashboardKpi_10(token);

      setKpis(data);
      setKpi1(kpi_1);
      setKpi2(kpi_2);
      setKpi3(kpi_3);
      setKpi4(kpi_4);
      setKpi5(kpi_5);
      setKpi6(kpi_6);
      setKpi7(kpi_7);
      setKpi8(kpi_8);
      setKpi9(kpi_9);
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
    kpis,
    kpi1,
    kpi2,
    kpi3,
    kpi4,
    kpi5,
    kpi6,
    kpi7,
    kpi8,
    kpi9,
    kpi10,
    loading,
    error,
    refetch: load,
  };
}
