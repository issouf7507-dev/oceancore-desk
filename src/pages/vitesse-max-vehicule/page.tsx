import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Loader2, Search, X } from "lucide-react"
import { DashboardLayoutHeader } from "@/layouts/components/DashboardLayoutHeader"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useKpi8 } from "@/hooks/use-kpi-8"
import { daysAgo, toISODate } from "@/lib/utils"

type Row = {
  vehicle_id: number;
  immatriculation: string;
  vitesse_max_kmh: number;
  alerte_vitesse: {
    code_couleur: string;
    statut: string;
    action_requise: string;
    severite: string;
  };
}

const chartConfig = {
  vmax_kmh: {
    label: "Vitesse max (km/h)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function formatFr(value: number, min = 1, max = 1) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}

export default function VitesseMaxVehiculePage() {
  const { kpi8, loading, error, page, setPage, dateEnd, reset, search, dateStart } = useKpi8()
  const rows = (kpi8?.kpi ?? []) as Row[]
  // console.log(kpi8);


  const [query, setQuery] = React.useState("")
  const [minSpeed, setMinSpeed] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<"speed_desc" | "speed_asc" | "vehicle_asc">("speed_desc")
  const [localStart, setLocalStart] = React.useState(dateStart)
  const [localEnd, setLocalEnd] = React.useState(dateEnd)
  const [validationError, setValidationError] = React.useState<string | null>(null)


  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = rows
      .filter((r) => r.vitesse_max_kmh >= minSpeed)
      .filter((r) => (!q ? true : (r.immatriculation ?? "").toLowerCase().includes(q)))

    if (sortBy === "speed_asc") return [...base].sort((a, b) => a.vitesse_max_kmh - b.vitesse_max_kmh)
    if (sortBy === "vehicle_asc") return [...base].sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
    return [...base].sort((a, b) => b.vitesse_max_kmh - a.vitesse_max_kmh)
  }, [minSpeed, query, rows, sortBy])

  const maxSpeed = filteredRows.length ? Math.max(...filteredRows.map((r) => r.vitesse_max_kmh)) : 0
  const avgSpeed =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.vitesse_max_kmh, 0) / filteredRows.length
      : 0



  // -------------------------------------------------------------------------
  // Soumission du formulaire de dates
  // -------------------------------------------------------------------------
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!localStart || !localEnd) {
      setValidationError("Veuillez renseigner les deux dates.")
      return
    }
    if (localStart > localEnd) {
      setValidationError("La date de début doit être antérieure à la date de fin.")
      return
    }
    setValidationError(null)
    search(localStart, localEnd) // ← appelle le hook
  }

  function handleReset() {
    reset() // ← appelle le hook
    setLocalStart(daysAgo(90))
    setLocalEnd(toISODate(new Date()))
    setValidationError(null)
  }

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...
      </div>
    )
  }
  if (error) {
    return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardLayoutHeader title="Vitesse max par véhicule" breadcrumb="" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Véhicules filtrés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredRows.length.toLocaleString("fr-FR")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vitesse max</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(maxSpeed, 1, 1)} km/h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vitesse moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(avgSpeed, 1, 1)} km/h</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI 8 – Vitesse max par véhicule</CardTitle>
          <CardDescription>Filtres BI + visualisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Vitesse minimum</div>
                <Select value={String(minSpeed)} onValueChange={(v) => setMinSpeed(Number(v))}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="20">20+</SelectItem>
                    <SelectItem value="40">40+</SelectItem>
                    <SelectItem value="60">60+</SelectItem>
                    <SelectItem value="80">80+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Tri</div>
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "speed_desc" | "speed_asc" | "vehicle_asc")
                  }
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speed_desc">Vitesse (décroissant)</SelectItem>
                    <SelectItem value="speed_asc">Vitesse (croissant)</SelectItem>
                    <SelectItem value="vehicle_asc">Véhicule (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1">
              <div className="text-sm text-muted-foreground">Recherche</div>
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-4 md:flex-row md:items-end"
              >
                {/* Date début */}
                <div className="grid gap-1.5">
                  <label
                    htmlFor="date-start"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Date de début
                  </label>
                  <Input
                    id="date-start"
                    type="date"
                    value={localStart}        // ← local
                    max={localEnd}
                    onChange={(e) => {
                      setLocalStart(e.target.value)  // ← local
                      setValidationError(null)
                    }}
                    className="w-full md:w-[200px]"
                  />
                </div>

                {/* Séparateur visuel */}
                <span className="hidden text-muted-foreground md:block md:pb-2">→</span>

                {/* Date fin */}
                <div className="grid gap-1.5">
                  <label
                    htmlFor="date-end"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Date de fin
                  </label>
                  <Input
                    id="date-end"
                    type="date"
                    value={localEnd}          // ← local
                    min={localStart}
                    max={toISODate(new Date())}
                    onChange={(e) => {
                      setLocalEnd(e.target.value)    // ← local
                      setValidationError(null)
                    }}
                    className="w-full md:w-[200px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:pb-0">
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {loading ? "Chargement…" : "Rechercher"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
              </form>

              {validationError && validationError}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Résultats:{" "}
              <span className="text-foreground font-medium">{filteredRows.length}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setMinSpeed(0)
                setSortBy("speed_desc")
              }}
            >
              Réinitialiser
            </Button>
          </div>

          <div className="mt-4">
            <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart accessibilityLayer data={filteredRows} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="vehicle"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `Véhicule ${String(value)}`}
                      formatter={(value) => {
                        if (typeof value === "number") {
                          return (
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {value.toLocaleString("fr-FR", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              })}{" "}
                              km/h
                            </span>
                          )
                        }
                        return (
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {String(value)} km/h
                          </span>
                        )
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Bar dataKey="vitesse_max_kmh" fill="var(--color-vmax_kmh)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) =>
                      value.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead className="text-right">Vitesse max (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row, index) => (
                  <TableRow key={`${row.vehicle_id}-${index}`}>
                    <TableCell className="font-medium">{row.immatriculation}</TableCell>
                    <TableCell className="text-right font-medium">
                      {row.vitesse_max_kmh.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Aucune donnée sur la période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Pagination */}
      {kpi8?.meta && kpi8.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{kpi8.meta.current_page}</span>{" "}
            sur{" "}
            <span className="font-medium text-foreground">{kpi8.meta.last_page}</span>
            {" · "}
            <span className="font-medium text-foreground">{kpi8.meta.total}</span> résultats
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              ← Précédent
            </Button>

            {/* Pages numérotées */}
            <div className="flex items-center gap-1">
              {Array.from({ length: kpi8.meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === kpi8.meta.last_page || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 px-0"
                      onClick={() => setPage(p as number)}
                      disabled={loading}
                    >
                      {p}
                    </Button>
                  )
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(kpi8.meta.last_page, p + 1))}
              disabled={page >= kpi8.meta.last_page || loading}
            >
              Suivant →
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

