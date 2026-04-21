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

    // conso_l_100km
    // :
    // 25
    // immatriculation
    // :
    // "3611LE01"
    // total_km
    // :
    // 300
    // vehicule_id
    // :
    // 8
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

type DashboardKpi1Response = {
  period?: { start?: string; end?: string };
  data?: {
    conso_l_100km: number;
    from_fuel_logs: number;
    total_litres: number;
    total_km: number;
  };
  series?: {
    date: string;
    conso_l_100km: number;
    total_litres: number;
    total_km: number;
    nb_voyages: number;
  }[];

  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type DashboardKpi1Normalized = {
  kpi: {
    conso_l_100km: number;
    date: string;
    nb_voyages: number;
    total_km: number;
    total_litres: number;
  }[];

  period: {
    start: string;
    end: string;
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export async function fetchDashboardKpi_1(
  token: string,
  // page = 1,
  params: {
    page?: number;
    start?: string;
    end?: string;
    per_page?: number;
  } = {},
): Promise<DashboardKpi1Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");

  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/1?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi1Response;

  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const series_journaliere = Array.isArray(json.series)
    ? json.series.map((p: any) => ({
        date: asString(p.date),
        conso_l_100km: toNumber(p.conso_l_100km),
        total_litres: toNumber(p.total_litres),
        total_km: toNumber(p.total_km),
        nb_voyages: toNumber(p.nb_voyages),
      }))
    : [];

  const meta = json.meta;

  const normalized: DashboardKpi1Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: series_journaliere,
    meta: meta,
  };

  return normalized;
}

type DashboardKpi2Response = {
  period?: { start?: string; end?: string };
  data?: {
    total_litres: number;
    from_fuel_logs: number;
  };
};

export type DashboardKpi2Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    total_litres: number;
    from_fuel_logs: number;
  };
};

export async function fetchDashboardKpi_2(
  token: string,
): Promise<DashboardKpi2Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/v1/kpis/2`, {
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
  const json = (await response.json()) as DashboardKpi2Response;

  const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const normalized: DashboardKpi2Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data,
  };

  return normalized;
}

type DashboardKpi3Response = {
  period?: { start?: string; end?: string };
  data?: {
    from_fuel_logs: number;
    total_fcfa: number;
  };
};

export type DashboardKpi3Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    from_fuel_logs: number;
    total_fcfa: number;
  };
};

export async function fetchDashboardKpi_3(
  token: string,
): Promise<DashboardKpi3Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/v1/kpis/3`, {
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
  const json = (await response.json()) as DashboardKpi3Response;

  const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const normalized: DashboardKpi3Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data,
  };

  return normalized;
}

type DashboardKpi4Response = {
  period?: { start?: string; end?: string };
  data?: {
    vehicule_id: number;
    immatriculation: string;
    total_km: number;
    conso_l_100km: number;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type DashboardKpi4Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    vehicule_id: number;
    immatriculation: string;
    km_total: number;
    conso_l_100km: number;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export async function fetchDashboardKpi_4(
  token: string,
  params: {
    page?: number;
    start?: string;
    end?: string;
    per_page?: number;
  } = {},
): Promise<DashboardKpi4Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");

  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/4?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi4Response;

  // const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = Array.isArray(json.data)
    ? json.data.map((p: any) => ({
        vehicule_id: toNumber(p.vehicule_id),
        immatriculation: asString(p.immatriculation),
        km_total: toNumber(p.total_km),
        conso_l_100km: toNumber(p.conso_l_100km),
      }))
    : [];

  const meta = json.meta;

  const normalized: DashboardKpi4Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
    meta: meta,
  };

  return normalized;
}

type DashboardKpi5Response = {
  period?: { start?: string; end?: string };
  summary?: {
    nb_anomalies: number;
    nb_pleins: number;
    pct_pleins_anormaux: number;
    seuil_ecart_pct: number;
  };
  data?: {
    fuel_log_id: number;
    vehicule_id: number;
    date_heure: string;
    ligne: string;
    conso_trajet_l: number;
    conso_attendue_l: number;
    ecart_pct: number;
    type: string;
    immatriculation: string;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type DashboardKpi5Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    fuel_log_id: number;
    vehicule_id: number;
    date_heure: string;
    ligne: string;
    conso_trajet_l: number;
    conso_attendue_l: number;
    ecart_pct: number;
    type: string;
    immatriculation: string;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export async function fetchDashboardKpi_5(
  token: string,
  params: {
    page?: number;
    start?: string;
    end?: string;
    per_page?: number;
  } = {},
): Promise<DashboardKpi5Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/5?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi5Response;

  // const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = Array.isArray(json.data)
    ? json.data.map((p: any) => ({
        fuel_log_id: p.fuel_log_id,
        vehicule_id: p.vehicule_id,
        date_heure: asString(p.date_heure),
        ligne: p.ligne,
        conso_trajet_l: p.conso_trajet_l,
        conso_attendue_l: p.conso_attendue_l,
        ecart_pct: p.ecart_pct,
        type: p.type,
        immatriculation: p.immatriculation,
      }))
    : [];

  const meta = json.meta;

  const normalized: DashboardKpi5Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
    meta: meta,
  };

  return normalized;
}

type DashboardKpi6Response = {
  period?: { start?: string; end?: string };
  data?: {
    vehicule_id: string;
    immatriculation: string;
    nb_pleins: number;
    nb_voyages: number;
    source: string;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type DashboardKpi6Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    vehicule_id: string;
    immatriculation: string;
    nb_pleins: number;
    nb_voyages: number;
    source: string;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export async function fetchDashboardKpi_6(
  token: string,
  params: {
    page?: number;
    start?: string;
    end?: string;
    per_page?: number;
  } = {},
): Promise<DashboardKpi6Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");

  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/6?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi6Response;

  // const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = Array.isArray(json.data)
    ? json.data.map((p: any) => ({
        vehicule_id: asString(p.vehicule_id),
        immatriculation: asString(p.immatriculation),
        nb_pleins: toNumber(p.nb_pleins),
        nb_voyages: toNumber(p.nb_voyages),
        source: asString(p.source),
      }))
    : [];

  const meta = json.meta;

  const normalized: DashboardKpi6Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
    meta: meta,
  };

  return normalized;
}

type DashboardKpi7Response = {
  period?: { start?: string; end?: string };
  data?: {
    mode: string;
    top: {
      driver_id: number;
      nom: string;
      avg_conso_l_100km: number;
      score: number;
    }[];
  };
};

export type DashboardKpi7Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    mode: string;
    top: {
      driver_id: number;
      nom: string;
      avg_conso_l_100km: number;
      score: number;
    }[];
  };
};

export async function fetchDashboardKpi_7(
  token: string,
  params: {
    start?: string;
    end?: string;
  } = {},
): Promise<DashboardKpi7Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");

  const query = new URLSearchParams();

  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/7?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi7Response;

  // const data = json.data!;

  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = json.data!;

  const normalized: DashboardKpi7Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
  };

  return normalized;
}

type DashboardKpi8Response = {
  period?: { start?: string; end?: string };
  data?: {
    vehicle_id: number;
    immatriculation: string;
    vitesse_max_kmh: number;
    alerte_vitesse: {
      code_couleur: string;
      statut: string;
      action_requise: string;
      severite: string;
    };
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type DashboardKpi8Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    vehicle_id: number;
    immatriculation: string;
    vitesse_max_kmh: number;
    alerte_vitesse: {
      code_couleur: string;
      statut: string;
      action_requise: string;
      severite: string;
    };
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export async function fetchDashboardKpi_8(
  token: string,
  // page = 1,
  params: {
    page?: number;
    start?: string;
    end?: string;
    per_page?: number;
  } = {},
): Promise<DashboardKpi8Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/8?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi8Response;

  // const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = Array.isArray(json.data)
    ? json.data.map((p: any) => ({
        vehicle_id: toNumber(p.vehicle_id),
        immatriculation: p.immatriculation,
        vitesse_max_kmh: toNumber(p.vitesse_max_kmh),
        alerte_vitesse: p?.alerte_vitesse,
      }))
    : [];

  const meta = json.meta;

  const normalized: DashboardKpi8Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
    meta: meta,
  };

  return normalized;
}

// a faire

type DashboardKpi9Response = {
  period?: { start?: string; end?: string };
  data?: {
    ligne_id: number;
    code_ligne: string;
    coefficient_charge_bagages: number;
    conso_brute_l_100km: number;
    conso_ponderee_l_100km: number;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type DashboardKpi9Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    ligne_id: number;
    code_ligne: string;
    coefficient_charge_bagages: number;
    conso_brute_l_100km: number;
    conso_ponderee_l_100km: number;
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export async function fetchDashboardKpi_9(
  token: string,
  params: {
    page?: number;
    start?: string;
    end?: string;
    per_page?: number;
  } = {},
): Promise<DashboardKpi9Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.start) query.set("start", params.start);
  if (params.end) query.set("end", params.end);

  const response = await fetch(`${base}/api/v1/kpis/9?${query.toString()}`, {
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
  const json = (await response.json()) as DashboardKpi9Response;

  // const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = Array.isArray(json.data)
    ? json.data.map((p: any) => ({
        // vehicle_id: toNumber(p.vehicle_id),
        // immatriculation: p.immatriculation,
        // vitesse_max_kmh: toNumber(p.vitesse_max_kmh),
        // alerte_vitesse: p?.alerte_vitesse,
        ligne_id: p.ligne_id,
        code_ligne: p.code_ligne,
        coefficient_charge_bagages: p.coefficient_charge_bagages,
        conso_brute_l_100km: p.conso_brute_l_100km,
        conso_ponderee_l_100km: p.conso_ponderee_l_100km,
      }))
    : [];

  const meta = json.meta;

  const normalized: DashboardKpi9Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
    meta: meta,
  };

  return normalized;
}

type DashboardKpi10Response = {
  period?: { start?: string; end?: string };
  data?: {
    taux_disponibilite_pct: number;
    nb_actifs: number;
    nb_total: number;
    nb_non_actifs: number;
  };
};

export type DashboardKpi10Normalized = {
  period: {
    start: string;
    end: string;
  };
  kpi: {
    taux_disponibilite_pct: number;
    nb_actifs: number;
    nb_total: number;
    nb_non_actifs: number;
  };
};

export async function fetchDashboardKpi_10(
  token: string,
): Promise<DashboardKpi10Normalized> {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/v1/kpis/10`, {
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
  const json = (await response.json()) as DashboardKpi10Response;

  // const data = json.data!;
  const periodStart = asString(json.period?.start);
  const periodEnd = asString(json.period?.end);

  const data_normalize = json.data!;

  const normalized: DashboardKpi10Normalized = {
    period: { start: periodStart, end: periodEnd },
    kpi: data_normalize,
  };

  return normalized;
}
