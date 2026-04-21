import * as React from "react";
import { useAuth } from "@/modules/auth";
import {
  fetchDashboardKpi_4,
  type DashboardKpi4Normalized,
} from "@/services/dashboardKpisService";
import { daysAgo, toISODate } from "@/lib/utils";

export function useKpi4() {
  const { auth } = useAuth();
  const token = auth?.api_token;

  const [kpi4, setKpi4] = React.useState<DashboardKpi4Normalized | null>(null);
  // const [page, setPage] = React.useState(4);
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
        const result = await fetchDashboardKpi_4(token, {
          page: p,
          start,
          end,
          per_page: 20,
        });
        setKpi4(result);
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
    kpi4,
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

// import * as React from "react";
// import { useAuth } from "@/modules/auth";
// import {
//   fetchDashboardKpi_4,
//   type DashboardKpi4Normalized,
// } from "@/services/dashboardKpisService";

// export function useKpi4() {
//   const { auth } = useAuth();
//   const token = auth?.api_token;

//   const [kpi4, setKpi4] = React.useState<DashboardKpi4Normalized | null>(null);
//   const [page, setPage] = React.useState(4);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const load = React.useCallback(
//     async (p: number) => {
//       if (!token) return;

//       setLoading(true);
//       setError(null);
//       try {
//         const kpi_4 = await fetchDashboardKpi_4(token, p);
//         setKpi4(kpi_4);
//       } catch (e: any) {
//         const message = e?.message
//           ? String(e.message)
//           : "Erreur lors du chargement des KPI";
//         setError(message);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [token, page],
//   );

//   React.useEffect(() => {
//     void load(page);
//   }, [load, page]);

//   return {
//     kpi4,
//     loading,
//     error,
//     page,
//     setPage,
//     refetch: () => load(page),
//   };
// }
