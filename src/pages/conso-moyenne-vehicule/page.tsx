import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useKpi4 } from "@/hooks/use-kpi-4"
import { Download, Loader2, Search, X } from "lucide-react"
import { daysAgo, toISODate } from "@/lib/utils"
import { exportToExcel } from "@/lib/export-excel"

type Row = {
  vehicule_id: number;
  immatriculation: string;
  km_total: number;
  conso_l_100km: number;
}

const chartConfig = {
  conso_l_100km: {
    label: "Conso (L/100km)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function formatFr(value: number, min = 2, max = 2) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}

export default function ConsoMoyenneVehiculePage() {
  const { kpi4, loading, error, page, setPage, dateStart, dateEnd, search, reset } = useKpi4()
  // console.log(kpi4);

  const rows = (kpi4?.kpi ?? []) as Row[]


  const [query, setQuery] = React.useState("")
  // const [minKm, setMinKm] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<
    "conso_desc" | "conso_asc" | "km_desc" | "vehicle_asc"
  >("conso_desc")

  const [localStart, setLocalStart] = React.useState(dateStart)
  const [localEnd, setLocalEnd] = React.useState(dateEnd)

  const [validationError, setValidationError] = React.useState<string | null>(null)

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = rows
      // .filter((r) => r.km_total >= minKm)
      // .filter((r) => (!q ? true : r.vehicule_id.toString().toLowerCase().includes(q)))
      .filter((r) => (!q ? true : r.immatriculation.toLowerCase().includes(q)))

    if (sortBy === "conso_asc") return [...base].sort((a, b) => a.conso_l_100km - b.conso_l_100km)
    if (sortBy === "km_desc") return [...base].sort((a, b) => b.km_total - a.km_total)
    // if (sortBy === "vehicle_asc") return [...base].sort((a, b) => a.vehicule_id.toString().localeCompare(b.vehicule_id))
    return [...base].sort((a, b) => b.conso_l_100km - a.conso_l_100km)
  }, [query, rows, sortBy])

  const avgConso =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.conso_l_100km, 0) / filteredRows.length
      : 0
  const totalKm = filteredRows.reduce((sum, r) => sum + r.km_total, 0)



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
  // Dans le composant :
  function handleExport() {
    exportToExcel(
      filteredRows,
      [
        {
          header: "Immatriculation",
          key: "immatriculation",
        },
        {
          header: "Conso (L/100km)",
          key: "conso_l_100km",
          format: (v) => Number(v.toFixed(2)),
        },
        {
          header: "Km total",
          key: "km_total",
          format: (v) => Number(v.toFixed(1)),
        },
      ],
      `conso-vehicule_${localStart}_${localEnd}`,
      "Conso par véhicule",
    )
  }

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
  }
  if (error) {
    return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardLayoutHeader title="Consommation moyenne par véhicule" breadcrumb="" />

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
            <CardTitle>Consommation moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(avgConso, 2, 2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total km</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(totalKm, 1, 1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI 4 – Consommation moyenne par véhicule</CardTitle>
          <CardDescription>Filtres BI + visualisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Véhicule</div>
                <Input
                  placeholder="Ex: AB-123-CD"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-[180px]"
                />
              </div>


              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Tri</div>
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "conso_desc" | "conso_asc" | "km_desc" | "vehicle_asc")
                  }
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conso_desc">Conso (décroissant)</SelectItem>
                    <SelectItem value="conso_asc">Conso (croissant)</SelectItem>
                    <SelectItem value="km_desc">Km (décroissant)</SelectItem>
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


                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExport}
                    disabled={filteredRows.length === 0}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exporter ({filteredRows.length})
                  </Button>
                </div>
              </form>

              {validationError && validationError}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Résultats: <span className="text-foreground font-medium">{filteredRows.length}</span>
            </div>

          </div>

          <div className="mt-4">
            <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart accessibilityLayer data={filteredRows} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="immatriculation"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => String(value)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value, payload) => {
                        const item = payload?.[0]?.payload as Row | undefined
                        const kmText = item
                          ? item.km_total.toLocaleString("fr-FR", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })
                          : "—"
                        return `Véhicule ${String(value)} • ${kmText} km`
                      }}
                      formatter={(value) => {
                        if (typeof value === "number") {
                          return (
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {value.toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              L/100km
                            </span>
                          )
                        }
                        return (
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {String(value)} L/100km
                          </span>
                        )
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Bar dataKey="conso_l_100km" fill="var(--color-conso_l_100km)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) =>
                      value.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
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
                <TableHead>Véhicule (GPS)</TableHead>
                <TableHead className="text-right">Conso (L/100km)</TableHead>
                <TableHead className="text-right">Km total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <TableRow key={row.vehicule_id}>
                    <TableCell className="font-medium">{row.immatriculation}</TableCell>
                    <TableCell className="text-right font-medium">
                      {row.conso_l_100km.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.km_total.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Aucune donnée sur la période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Pagination */}
      {kpi4?.meta && kpi4.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{kpi4.meta.current_page}</span>{" "}
            sur{" "}
            <span className="font-medium text-foreground">{kpi4.meta.last_page}</span>
            {" · "}
            <span className="font-medium text-foreground">{kpi4.meta.total}</span> résultats
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
              {Array.from({ length: kpi4.meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === kpi4.meta.last_page || Math.abs(p - page) <= 1)
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
              onClick={() => setPage((p) => Math.min(kpi4.meta.last_page, p + 1))}
              disabled={page >= kpi4.meta.last_page || loading}
            >
              Suivant →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

