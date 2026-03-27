export type DashboardKpisNormalized = {
  period: {
    start: string;
    end: string;
  };
  kpi1_conso_moyenne_flotte_l_100km: {
    conso_l_100km: number;
    total_litres: number;
    total_km: number;
  };
  kpi1_series_journaliere: Array<{
    date: string;
    conso_l_100km: number;
    total_litres: number;
    total_km: number;
    nb_voyages: number;
  }>;
  kpi2_volume_total_litres: number;
  kpi3_cout_carburant_fcfa: number;
  kpi4_ecart_kilometrage_excel_vs_gps: Array<{
    vehicle_gps: string;
    conso_l_100km: number;
    km_total: number;
    immatriculation: string;
  }>;
  kpi5_indice_anomalie_trips: Array<{
    nb_anomalies: number;
    nb_pleins: number;
    refueling_id: string;
    vehicule_id: string;
    date_heure: string;
    ligne: string;
    conso_trajet_l: number;
    conso_attendue_l: number;
    ecart_pct: number;
    type: string;
    immatriculation: string;
  }>;
  kpi6_frequence_ravitaillement_par_vehicule: Array<{
    vehicle_gps: string;
    immatriculation: string;
    nb_pleins: number;
    nb_voyages: number;
    source: string;
  }>;
  kpi7_eco_score_chauffeur_top: Array<{
    driver: string;
    eco_score: number;
    trips: number;
  }>;
  kpi8_vitesse_max_par_vehicule: Array<{
    vehicle: string;
    vmax_kmh: number;
  }>;
  kpi9_conso_ponderee_par_ligne: Array<{
    line: string;
    luggage_coeff: number;
    weighted_conso_l_100km: number;
  }>;
  kpi10_taux_disponibilite_flotte: {
    taux_disponibilite_pct: number;
    nb_actifs: number;
    nb_total: number;
    nb_non_actifs: number;
  };
};

type DashboardKpisResponse = {
  period?: { start?: string; end?: string };
  kpis?: Record<string, unknown>;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function normalizeKpi5Trips(
  voyagesAnormaux: unknown,
): DashboardKpisNormalized["kpi5_indice_anomalie_trips"] {
  const list = Array.isArray(voyagesAnormaux) ? voyagesAnormaux : [];

  return list.map(
    (item: {
      nb_anomalies: number;
      nb_pleins: number;
      refueling_id: string;
      vehicule_id: string;
      date_heure: string;
      ligne: string;
      conso_trajet_l: number;
      conso_attendue_l: number;
      ecart_pct: number;
      type: string;
      immatriculation: string;
    }) => {
      const nb_anomalies = toNumber(item.nb_anomalies);
      const nb_pleins = toNumber(item.nb_pleins);
      const refueling_id = asString(item.refueling_id);
      const vehicule_id = asString(item.vehicule_id);
      const date_heure = asString(item.date_heure);
      const ligne = asString(item.ligne);
      const conso_trajet_l = toNumber(item.conso_trajet_l);
      const conso_attendue_l = toNumber(item.conso_attendue_l);
      const ecart_pct = toNumber(item.ecart_pct);
      const type = asString(item.type);
      const immatriculation = asString(item.immatriculation);
      return {
        nb_anomalies,
        nb_pleins,
        refueling_id,
        vehicule_id,
        date_heure,
        ligne,
        conso_trajet_l,
        conso_attendue_l,
        ecart_pct,
        type,
        immatriculation,
      };
    },
  );
}

export async function fetchDashboardKpis(
  token: string,
): Promise<DashboardKpisNormalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/v1/kpis`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch KPIs (${response.status}). ${text ? `Details: ${text}` : ""}`.trim(),
    );
  }

  const json = (await response.json()) as DashboardKpisResponse;
  const kpis = (json.kpis ?? {}) as Record<string, any>;

  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const kpi1 = kpis.kpi1_conso_moyenne_flotte_l_100km ?? {};

  const kpi1_conso_moyenne_flotte_l_100km = {
    conso_l_100km: toNumber(kpi1.conso_l_100km),
    total_litres: toNumber(kpi1.total_litres),
    total_km: toNumber(kpi1.total_km),
  };

  const series_journaliere = Array.isArray(kpi1.series_journaliere)
    ? kpi1.series_journaliere.map((p: any) => ({
        date: asString(p.date),
        conso_l_100km: toNumber(p.conso_l_100km),
        total_litres: toNumber(p.total_litres),
        total_km: toNumber(p.total_km),
        nb_voyages: toNumber(p.nb_voyages),
      }))
    : [];

  const kpi2 = kpis.kpi2_volume_total_litres ?? {};
  const kpi3 = kpis.kpi3_cout_carburant_fcfa ?? {};

  const kpi4 = Array.isArray(kpis.kpi4_ecart_kilometrage_excel_vs_gps)
    ? (kpis.kpi4_ecart_kilometrage_excel_vs_gps as any[]).map((r) => ({
        vehicle_gps: asString(r.vehicule_id),
        conso_l_100km: toNumber(r.conso_l_100km),
        km_total: toNumber(r.total_km),
        immatriculation: asString(r.immatriculation),
      }))
    : [];

  const kpi5 = kpis.kpi5_indice_anomalie ?? {};
  const kpi5_trips = normalizeKpi5Trips(kpi5.voyages_anormaux);

  const kpi6 = kpis.kpi6_frequence_ravitaillement_par_vehicule ?? {};
  const kpi6_from_refueling = Array.isArray(kpi6.from_refueling)
    ? kpi6.from_refueling.map((r: any) => ({
        vehicle_gps: asString(r.vehicule_id),
        immatriculation: asString(r.immatriculation),
        nb_pleins: toNumber(r.nb_pleins),
        nb_voyages: toNumber(r.nb_voyages),
        source: asString(r.source),
      }))
    : [];

  const kpi7 = kpis.kpi7_eco_score_chauffeur ?? {};
  const kpi7_top = Array.isArray(kpi7.top)
    ? kpi7.top.map((r: any) => ({
        driver: asString(r.nom ?? r.driver_key ?? r.driver_id ?? ""),
        eco_score: toNumber(r.score),
        trips: toNumber(r.nb_trajets),
      }))
    : [];

  const kpi8 = Array.isArray(kpis.kpi8_vitesse_max_par_vehicule)
    ? (kpis.kpi8_vitesse_max_par_vehicule as any[])
    : [];
  // Default: show the first 10 entries (assumed sorted by speed desc by backend)
  const kpi8_limited = kpi8.slice(0, 10);
  const kpi8_rows = kpi8_limited.map((r: any) => ({
    vehicle: asString(r.immatriculation ?? r.vehicle_id ?? ""),
    vmax_kmh: toNumber(r.vitesse_max_kmh),
  }));

  const kpi9 = Array.isArray(kpis.kpi9_conso_ponderee_par_ligne)
    ? (kpis.kpi9_conso_ponderee_par_ligne as any[])
    : [];
  const kpi9_rows = kpi9.map((r: any) => ({
    line: asString(r.code_ligne),
    luggage_coeff: toNumber(r.coefficient_charge_bagages),
    weighted_conso_l_100km: toNumber(r.conso_ponderee_l_100km),
  }));

  const kpi10 = kpis.kpi10_taux_disponibilite_flotte ?? {};
  const normalized: DashboardKpisNormalized = {
    period: { start: periodStart, end: periodEnd },
    kpi1_conso_moyenne_flotte_l_100km,
    kpi1_series_journaliere: series_journaliere,
    kpi2_volume_total_litres: toNumber(kpi2.total_litres),
    kpi3_cout_carburant_fcfa: toNumber(kpi3.total_fcfa),
    kpi4_ecart_kilometrage_excel_vs_gps: kpi4,
    kpi5_indice_anomalie_trips: kpi5_trips,
    kpi6_frequence_ravitaillement_par_vehicule: kpi6_from_refueling,
    kpi7_eco_score_chauffeur_top: kpi7_top,
    kpi8_vitesse_max_par_vehicule: kpi8_rows,
    kpi9_conso_ponderee_par_ligne: kpi9_rows,
    kpi10_taux_disponibilite_flotte: {
      taux_disponibilite_pct: toNumber(kpi10.taux_disponibilite_pct),
      nb_actifs: toNumber(kpi10.nb_actifs),
      nb_total: toNumber(kpi10.nb_total),
      nb_non_actifs: toNumber(kpi10.nb_non_actifs),
    },
  };

  return normalized;
}
