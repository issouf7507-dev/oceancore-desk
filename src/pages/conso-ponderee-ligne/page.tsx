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
  line: string
  luggage_coeff: number
  weighted_conso_l_100km: number
}

const chartConfig = {
  weighted_conso_l_100km: {
    label: "Conso pondérée (L/100km)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

function formatFr(value: number, min = 2, max = 2) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}

export default function ConsoPondereeLignePage() {
  const { kpis, loading, error } = useDashboardKpis()
  const rows = (kpis?.kpi9_conso_ponderee_par_ligne ?? []) as Row[]

  const [query, setQuery] = React.useState("")
  const [minCoeff, setMinCoeff] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<"conso_desc" | "conso_asc" | "line_asc">("conso_desc")

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = rows
      .filter((r) => r.luggage_coeff >= minCoeff)
      .filter((r) => (!q ? true : r.line.toLowerCase().includes(q)))

    if (sortBy === "conso_asc") return [...base].sort((a, b) => a.weighted_conso_l_100km - b.weighted_conso_l_100km)
    if (sortBy === "line_asc") return [...base].sort((a, b) => a.line.localeCompare(b.line))
    return [...base].sort((a, b) => b.weighted_conso_l_100km - a.weighted_conso_l_100km)
  }, [minCoeff, query, rows, sortBy])

  const avgWeighted =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.weighted_conso_l_100km, 0) / filteredRows.length
      : 0
  const avgCoeff =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.luggage_coeff, 0) / filteredRows.length
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
      <DashboardLayoutHeader title="Conso pondérée par ligne" breadcrumb="" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Lignes filtrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredRows.length.toLocaleString("fr-FR")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conso pondérée moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(avgWeighted, 2, 2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coeff. bagages moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(avgCoeff, 2, 2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI 9 – Conso pondérée par ligne</CardTitle>
          <CardDescription>Filtres BI + visualisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Coeff. minimum</div>
                <Select value={String(minCoeff)} onValueChange={(v) => setMinCoeff(Number(v))}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="0.5">0.5+</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="1.5">1.5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Tri</div>
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "conso_desc" | "conso_asc" | "line_asc")
                  }
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conso_desc">Conso pondérée (décroissant)</SelectItem>
                    <SelectItem value="conso_asc">Conso pondérée (croissant)</SelectItem>
                    <SelectItem value="line_asc">Ligne (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1">
              <div className="text-sm text-muted-foreground">Recherche</div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Code ligne..."
                className="w-full md:w-[280px]"
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
                setMinCoeff(0)
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
                <XAxis dataKey="line" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `Ligne ${String(value)}`}
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
                <Bar dataKey="weighted_conso_l_100km" fill="var(--color-weighted_conso_l_100km)" radius={8}>
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
                <TableHead>Ligne</TableHead>
                <TableHead className="text-right">Coeff. bagages</TableHead>
                <TableHead className="text-right">Conso pondérée (L/100km)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <TableRow key={row.line}>
                    <TableCell className="font-medium">{row.line}</TableCell>
                    <TableCell className="text-right">
                      {row.luggage_coeff.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {row.weighted_conso_l_100km.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
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

