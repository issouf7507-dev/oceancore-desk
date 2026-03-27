import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { Loader2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Row = {
  vehicle: string
  vmax_kmh: number
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
  const { kpis, loading, error } = useDashboardKpis()
  const rows = (kpis?.kpi8_vitesse_max_par_vehicule ?? []) as Row[]

  const [query, setQuery] = React.useState("")
  const [minSpeed, setMinSpeed] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<"speed_desc" | "speed_asc" | "vehicle_asc">("speed_desc")

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = rows
      .filter((r) => r.vmax_kmh >= minSpeed)
      .filter((r) => (!q ? true : (r.vehicle ?? "").toLowerCase().includes(q)))

    if (sortBy === "speed_asc") return [...base].sort((a, b) => a.vmax_kmh - b.vmax_kmh)
    if (sortBy === "vehicle_asc") return [...base].sort((a, b) => a.vehicle.localeCompare(b.vehicle))
    return [...base].sort((a, b) => b.vmax_kmh - a.vmax_kmh)
  }, [minSpeed, query, rows, sortBy])

  const maxSpeed = filteredRows.length ? Math.max(...filteredRows.map((r) => r.vmax_kmh)) : 0
  const avgSpeed =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.vmax_kmh, 0) / filteredRows.length
      : 0

  if (loading && !kpis) {
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
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Immatriculation véhicule..."
                className="w-full md:w-[320px]"
              />
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
                <Bar dataKey="vmax_kmh" fill="var(--color-vmax_kmh)" radius={8}>
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
                filteredRows.map((row) => (
                  <TableRow key={row.vehicle}>
                    <TableCell className="font-medium">{row.vehicle}</TableCell>
                    <TableCell className="text-right font-medium">
                      {row.vmax_kmh.toLocaleString("fr-FR", {
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
    </div>
  )
}

