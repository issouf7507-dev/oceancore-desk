import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { DashboardLayoutHeader } from "@/layouts/components/DashboardLayoutHeader"
import { useDashboardKpis } from "@/hooks/use-dashboard-kpis"
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

type Row = {
  vehicle_gps: string
  conso_l_100km: number
  km_total: number
  immatriculation: string
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
  const { kpis, loading, error } = useDashboardKpis()
  const rows = (kpis?.kpi4_ecart_kilometrage_excel_vs_gps ?? []) as Row[]

  const [query, setQuery] = React.useState("")
  const [minKm, setMinKm] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<
    "conso_desc" | "conso_asc" | "km_desc" | "vehicle_asc"
  >("conso_desc")

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = rows
      .filter((r) => r.km_total >= minKm)
      .filter((r) => (!q ? true : r.vehicle_gps.toLowerCase().includes(q)))

    if (sortBy === "conso_asc") return [...base].sort((a, b) => a.conso_l_100km - b.conso_l_100km)
    if (sortBy === "km_desc") return [...base].sort((a, b) => b.km_total - a.km_total)
    if (sortBy === "vehicle_asc") return [...base].sort((a, b) => a.vehicle_gps.localeCompare(b.vehicle_gps))
    return [...base].sort((a, b) => b.conso_l_100km - a.conso_l_100km)
  }, [minKm, query, rows, sortBy])

  const avgConso =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.conso_l_100km, 0) / filteredRows.length
      : 0
  const totalKm = filteredRows.reduce((sum, r) => sum + r.km_total, 0)

  if (loading && !kpis) {
    return <div className="p-4 text-sm text-muted-foreground">Chargement des KPI...</div>
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
                <div className="text-sm text-muted-foreground">Km minimum</div>
                <Select value={String(minKm)} onValueChange={(v) => setMinKm(Number(v))}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="100">100+</SelectItem>
                    <SelectItem value="200">200+</SelectItem>
                    <SelectItem value="400">400+</SelectItem>
                  </SelectContent>
                </Select>
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
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="GPS véhicule..."
                className="w-full md:w-[320px]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Résultats: <span className="text-foreground font-medium">{filteredRows.length}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setMinKm(0)
                setSortBy("conso_desc")
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
                  <TableRow key={row.vehicle_gps}>
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
    </div>
  )
}

