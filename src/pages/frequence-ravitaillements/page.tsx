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
import { useKpi6 } from "@/hooks/use-kpi-6"
import { daysAgo, toISODate } from "@/lib/utils"

type Row = {
  vehicule_id: string;
  immatriculation: string;
  nb_pleins: number;
  nb_voyages: number;
  source: string;
}

export default function FrequenceRavitaillementsPage() {
  const { kpi6, loading, error, page, setPage, dateStart, dateEnd, search, reset } = useKpi6()
  const rows = (kpi6?.kpi ?? []) as Row[]

  // console.log(kpi6);


  const [query, setQuery] = React.useState("")
  const [minPleins, setMinPleins] = React.useState(0)
  const [minVoyages, setMinVoyages] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<"pleins_desc" | "voyages_desc" | "vehicle_asc">("pleins_desc")
  const [localStart, setLocalStart] = React.useState(dateStart)
  const [localEnd, setLocalEnd] = React.useState(dateEnd)
  const [validationError, setValidationError] = React.useState<string | null>(null)



  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = rows
      .filter((r) => r.nb_pleins >= minPleins && r.nb_voyages >= minVoyages)
      .filter((r) => {
        if (!q) return true
        return (
          r.vehicule_id.toString().toLowerCase().includes(q) ||
          (r.immatriculation ?? "").toLowerCase().includes(q)
        )
      })

    if (sortBy === "vehicle_asc") {
      return [...list].sort((a, b) => a.vehicule_id.localeCompare(b.vehicule_id))
    }
    if (sortBy === "voyages_desc") {
      return [...list].sort((a, b) => b.nb_voyages - a.nb_voyages)
    }
    return [...list].sort((a, b) => b.nb_pleins - a.nb_pleins)
  }, [minPleins, minVoyages, query, rows, sortBy])

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
      <DashboardLayoutHeader
        title="Fréquence ravitaillements"
        breadcrumb=""
      />

      <Card>
        <CardHeader>
          <CardTitle>KPI 6 – Fréquence ravitaillements par véhicule</CardTitle>
          <CardDescription>Données mobile </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Min pleins</div>
                <Select
                  value={String(minPleins)}
                  onValueChange={(v) => setMinPleins(Number(v))}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Min voyages</div>
                <Select
                  value={String(minVoyages)}
                  onValueChange={(v) => setMinVoyages(Number(v))}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0+</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <div className="text-sm text-muted-foreground">Tri</div>
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "pleins_desc" | "voyages_desc" | "vehicle_asc")
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pleins_desc">Pleins (décroissant)</SelectItem>
                    <SelectItem value="voyages_desc">Voyages (décroissant)</SelectItem>
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
                setMinPleins(0)
                setMinVoyages(0)
                setSortBy("pleins_desc")
              }}
            >
              Réinitialiser
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule (GPS)</TableHead>
                <TableHead>Immatriculation</TableHead>
                <TableHead className="text-right">Nb pleins</TableHead>
                <TableHead className="text-right">Nb voyages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <TableRow key={`${row.vehicule_id}-${row.source}`}>
                    <TableCell className="font-medium">{row.immatriculation}</TableCell>
                    <TableCell>{row.immatriculation || "—"}</TableCell>
                    <TableCell className="text-right">
                      {row.nb_pleins.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.nb_voyages.toLocaleString("fr-FR")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucun enregistrement sur la période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Pagination */}
      {kpi6?.meta && kpi6.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{kpi6.meta.current_page}</span>{" "}
            sur{" "}
            <span className="font-medium text-foreground">{kpi6.meta.last_page}</span>
            {" · "}
            <span className="font-medium text-foreground">{kpi6.meta.total}</span> résultats
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
              {Array.from({ length: kpi6.meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === kpi6.meta.last_page || Math.abs(p - page) <= 1)
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
              onClick={() => setPage((p) => Math.min(kpi6.meta.last_page, p + 1))}
              disabled={page >= kpi6.meta.last_page || loading}
            >
              Suivant →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

