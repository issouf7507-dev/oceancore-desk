import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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
import { Loader2, Search, X } from "lucide-react"
import { useKpi1 } from "@/hooks/use-kpi-1"
import { daysAgo, toISODate } from "@/lib/utils"

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






export default function ConsommationMoyenneFlottePage() {
  // const { kpi1, loading, error, page, setPage } = useKpi1()
  const { kpi1, loading, error, page, setPage, dateStart, dateEnd, search, reset } = useKpi1()
  const rows = kpi1?.kpi ?? []
  // console.log(kpi1);

  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d")
  // const [query, setQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"date_desc" | "conso_desc" | "conso_asc">("date_desc")
  const [localStart, setLocalStart] = React.useState(dateStart)
  const [localEnd, setLocalEnd] = React.useState(dateEnd)
  const [validationError, setValidationError] = React.useState<string | null>(null)


  const referenceDate = React.useMemo(() => {
    const raw = kpi1?.period?.end
    const parsed = raw ? new Date(raw) : undefined
    if (parsed && !Number.isNaN(parsed.getTime())) return parsed
    const lastDate = rows.length ? rows[rows.length - 1]?.date : undefined
    return lastDate ? new Date(lastDate) : new Date()
  }, [kpi1?.period?.end, rows])

  const filteredRows = React.useMemo(() => {
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    if (timeRange === "7d") daysToSubtract = 7

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // const q = query.trim().toLowerCase()
    const base = rows
      .filter((r) => new Date(r.date).getTime() >= startDate.getTime())


    if (sortBy === "conso_desc") {
      return [...base].sort((a, b) => b.conso_l_100km - a.conso_l_100km)
    }
    if (sortBy === "conso_asc") {
      return [...base].sort((a, b) => a.conso_l_100km - b.conso_l_100km)
    }
    return [...base].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [, referenceDate, rows, sortBy, timeRange])

  const avgConso =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.conso_l_100km, 0) / filteredRows.length
      : 0
  const totalLitres = filteredRows.reduce((sum, r) => sum + r.total_litres, 0)
  const totalKm = filteredRows.reduce((sum, r) => sum + r.total_km, 0)


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
    return <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardLayoutHeader title="Consommation Moyenne Flotte" breadcrumb="" />


      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Consommation moyenne</CardTitle>
            <CardDescription>L/100km sur filtre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(avgConso, 2, 2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total litres</CardTitle>
            <CardDescription>Sur filtre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(totalLitres, 1, 1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total km</CardTitle>
            <CardDescription>Sur filtre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(totalKm, 1, 1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails KPI 1</CardTitle>
          <CardDescription>Vue BI avec filtres</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Période</div>
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="90d" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90d">90 jours</SelectItem>
                    <SelectItem value="30d">30 jours</SelectItem>
                    <SelectItem value="7d">7 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Tri</div>
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "date_desc" | "conso_desc" | "conso_asc")
                  }
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Date (plus récent)</SelectItem>
                    <SelectItem value="conso_desc">Conso (décroissant)</SelectItem>
                    <SelectItem value="conso_asc">Conso (croissant)</SelectItem>
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

                {validationError && validationError}
              </form>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Résultats:{" "}
              <span className="text-foreground font-medium">{filteredRows.length}</span>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setSortBy("date_desc")
                setTimeRange("90d")
              }}
            >
              Réinitialiser
            </Button> */}
          </div>

          <div className="mt-4">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[260px] w-full"
            >
              <AreaChart data={filteredRows}>
                <defs>
                  <linearGradient id="fillKpi1Conso" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-conso_l_100km)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-conso_l_100km)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const d = new Date(value)
                    return d.toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("fr-FR", {
                          month: "short",
                          day: "numeric",
                        })
                      }
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
                <Area
                  dataKey="conso_l_100km"
                  type="natural"
                  fill="url(#fillKpi1Conso)"
                  stroke="var(--color-conso_l_100km)"
                />
              </AreaChart>
            </ChartContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Conso (L/100km)</TableHead>
                <TableHead className="text-right">Total litres</TableHead>
                <TableHead className="text-right">Total km</TableHead>
                <TableHead className="text-right">Nb voyages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{new Date(row.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatFr(row.conso_l_100km, 2, 2)}
                    </TableCell>
                    <TableCell className="text-right">{formatFr(row.total_litres, 1, 1)}</TableCell>
                    <TableCell className="text-right">{formatFr(row.total_km, 1, 1)}</TableCell>
                    <TableCell className="text-right">{row.nb_voyages.toLocaleString("fr-FR")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucune donnée sur la période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Pagination */}
      {kpi1?.meta && kpi1.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{kpi1.meta.current_page}</span>{" "}
            sur{" "}
            <span className="font-medium text-foreground">{kpi1.meta.last_page}</span>
            {" · "}
            <span className="font-medium text-foreground">{kpi1.meta.total}</span> résultats
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
              {Array.from({ length: kpi1.meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === kpi1.meta.last_page || Math.abs(p - page) <= 1)
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
              onClick={() => setPage((p) => Math.min(kpi1.meta.last_page, p + 1))}
              disabled={page >= kpi1.meta.last_page || loading}
            >
              Suivant →
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

