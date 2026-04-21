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
} from "@/services/dashboardKpisService";
import React from "react";

// hooks/use-dashboard-home.ts
export function useDashboardHome() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [state, setState] = React.useState<{
    //   kpis: DashboardKpisNormalized | null;
    kpi1: DashboardKpi1Normalized | null;
    kpi2: DashboardKpi2Normalized | null;
    kpi3: DashboardKpi3Normalized | null;
    kpi4: DashboardKpi4Normalized | null;
    kpi5: DashboardKpi5Normalized | null;
    kpi6: DashboardKpi6Normalized | null;
    kpi7: DashboardKpi7Normalized | null;
    kpi8: DashboardKpi8Normalized | null;
    kpi9: DashboardKpi9Normalized | null;
    kpi10: DashboardKpi10Normalized | null;

    // ... tous les kpis
    errors: Record<string, string>;
    loading: boolean;
  }>({
    kpi1: null,
    kpi2: null,
    kpi3: null,
    kpi4: null,
    kpi5: null,
    kpi6: null,
    kpi7: null,
    kpi8: null,
    kpi9: null,
    kpi10: null,

    /* ... */ errors: {},
    loading: false,
  });

  const load = React.useCallback(async () => {
    if (!token) return;
    setState((s) => ({ ...s, loading: true }));

    const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10] = await Promise.allSettled([
      fetchDashboardKpi_1(token),
      fetchDashboardKpi_2(token),
      fetchDashboardKpi_3(token),
      fetchDashboardKpi_4(token),
      fetchDashboardKpi_5(token),
      fetchDashboardKpi_6(token),
      fetchDashboardKpi_7(token),
      fetchDashboardKpi_8(token),
      fetchDashboardKpi_9(token),
      fetchDashboardKpi_10(token),
      // ...
    ]);

    const errs: Record<string, string> = {};
    if (r1.status === "rejected") errs.kpi1 = r1.reason?.message;
    // ...

    setState({
      loading: false,
      errors: errs,
      kpi1: r1.status === "fulfilled" ? r1.value : null,
      kpi2: r2.status === "fulfilled" ? r2.value : null,
      kpi3: r3.status === "fulfilled" ? r3.value : null,
      kpi4: r4.status === "fulfilled" ? r4.value : null,
      kpi5: r5.status === "fulfilled" ? r5.value : null,
      kpi6: r6.status === "fulfilled" ? r6.value : null,
      kpi7: r7.status === "fulfilled" ? r7.value : null,
      kpi8: r8.status === "fulfilled" ? r8.value : null,
      kpi9: r9.status === "fulfilled" ? r9.value : null,
      kpi10: r10.status === "fulfilled" ? r10.value : null,
    });
  }, [token]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refetch: load };
}
