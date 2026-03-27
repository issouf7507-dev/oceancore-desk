import * as React from "react"
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
import { Loader2 } from "lucide-react"

type Row = {
  driver: string
  eco_score: number
  trips: number
}

function formatFr(value: number, min = 1, max = 1) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}

export default function EcoScoreChauffeursPage() {
  const { kpis, loading, error } = useDashboardKpis()
  const rows = (kpis?.kpi7_eco_score_chauffeur_top ?? []) as Row[]

  const [query, setQuery] = React.useState("")
  const [minScore, setMinScore] = React.useState(0)
  const [minTrips, setMinTrips] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<"score_desc" | "trips_desc" | "driver_asc">("score_desc")

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    const base = rows
      .filter((r) => r.eco_score >= minScore && r.trips >= minTrips)
      .filter((r) => (!q ? true : r.driver.toLowerCase().includes(q)))

    if (sortBy === "driver_asc") {
      return [...base].sort((a, b) => a.driver.localeCompare(b.driver))
    }
    if (sortBy === "trips_desc") {
      return [...base].sort((a, b) => b.trips - a.trips)
    }
    return [...base].sort((a, b) => b.eco_score - a.eco_score)
  }, [minScore, minTrips, query, rows, sortBy])

  const avgScore =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.eco_score, 0) / filteredRows.length
      : 0
  const totalTrips = filteredRows.reduce((sum, r) => sum + r.trips, 0)

  if (loading && !kpis) {
    return <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardLayoutHeader title="Eco-score chauffeurs" breadcrumb="" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Chauffeurs filtrés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredRows.length.toLocaleString("fr-FR")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatFr(avgScore, 1, 1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nb trajets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTrips.toLocaleString("fr-FR")}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI 7 – Eco-score chauffeur</CardTitle>
          <CardDescription>Classement des chauffeurs (Top)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Score minimum</div>
                <Select
                  value={String(minScore)}
                  onValueChange={(v) => setMinScore(Number(v))}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="50">50+</SelectItem>
                    <SelectItem value="70">70+</SelectItem>
                    <SelectItem value="80">80+</SelectItem>
                    <SelectItem value="90">90+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Nb trajets minimum</div>
                <Select
                  value={String(minTrips)}
                  onValueChange={(v) => setMinTrips(Number(v))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="10">10+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Tri</div>
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "score_desc" | "trips_desc" | "driver_asc")
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score_desc">Eco-score (décroissant)</SelectItem>
                    <SelectItem value="trips_desc">Trajets (décroissant)</SelectItem>
                    <SelectItem value="driver_asc">Chauffeur (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1">
              <div className="text-sm text-muted-foreground">Recherche</div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom chauffeur..."
                className="w-full md:w-[320px]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Résultats:{" "}
              <span className="text-foreground font-medium">
                {filteredRows.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setMinScore(0)
                setMinTrips(0)
                setSortBy("score_desc")
              }}
            >
              Réinitialiser
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px]">#</TableHead>
                <TableHead>Chauffeur</TableHead>
                <TableHead className="text-right">Eco-score</TableHead>
                <TableHead className="text-right">Nb trajets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row, idx) => (
                  <TableRow key={`${row.driver}-${idx}`}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{row.driver}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatFr(row.eco_score, 1, 1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.trips.toLocaleString("fr-FR")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Aucun chauffeur disponible sur la période
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

