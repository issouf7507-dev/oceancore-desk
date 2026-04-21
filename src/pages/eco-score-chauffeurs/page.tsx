import * as React from "react"
import { DashboardLayoutHeader } from "@/layouts/components/DashboardLayoutHeader"

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
import { Loader2, Search, X } from "lucide-react"
import { useKpi7 } from "@/hooks/use-kpi-7"
import { daysAgo, toISODate } from "@/lib/utils"

type Row = {
  // driver: string
  // eco_score: number
  // trips: number
  mode: string;
  top: {
    driver_id: number;
    nom: string;
    avg_conso_l_100km: number;
    score: number;
  }[];
}

function formatFr(value: number, min = 1, max = 1) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}

export default function EcoScoreChauffeursPage() {
  const { kpi7, loading, error, reset, dateEnd, dateStart, search } = useKpi7()
  const rows = (kpi7?.kpi) as Row

  const [query, setQuery] = React.useState("")
  const [minScore, setMinScore] = React.useState(0)

  const [sortBy, setSortBy] = React.useState<"score_desc" | "trips_desc" | "driver_asc">("score_desc")
  const [localStart, setLocalStart] = React.useState(dateStart)
  const [localEnd, setLocalEnd] = React.useState(dateEnd)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  const filteredRows = React.useMemo(() => {
    const top = rows?.top ?? [] // ✅ fallback
    const q = query.trim().toLowerCase()

    const base = top
      .filter((r) => r.score >= minScore)
      .filter((r) => (!q ? true : r.nom.toLowerCase().includes(q)))

    if (sortBy === "driver_asc") {
      return [...base].sort((a, b) => a.nom.localeCompare(b.nom))
    }
    return [...base].sort((a, b) => b.score - a.score)
  }, [minScore, query, rows, sortBy])


  const avgScore =
    filteredRows.length > 0
      ? filteredRows.reduce((sum, r) => sum + r.score, 0) / filteredRows.length
      : 0
  // const totalTrips = filteredRows.reduce((sum, r) => sum + r.trips, 0)

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
  }

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
        {/* <Card>
          <CardHeader>
            <CardTitle>Nb trajets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTrips.toLocaleString("fr-FR")}</div>
          </CardContent>
        </Card> */}
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
                <TableHead className="text-right">Vitesse max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row, idx) => (
                  <TableRow key={`${row.driver_id}-${idx}`}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{row.nom}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatFr(row.score, 1, 1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.avg_conso_l_100km.toLocaleString("fr-FR")}
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

