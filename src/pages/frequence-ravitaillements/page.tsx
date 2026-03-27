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
  vehicle_gps: string
  immatriculation: string
  nb_pleins: number
  nb_voyages: number
  source: string
}

export default function FrequenceRavitaillementsPage() {
  const { kpis, loading, error } = useDashboardKpis()
  const rows = (kpis?.kpi6_frequence_ravitaillement_par_vehicule ?? []) as Row[]

  const [query, setQuery] = React.useState("")
  const [minPleins, setMinPleins] = React.useState(0)
  const [minVoyages, setMinVoyages] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<"pleins_desc" | "voyages_desc" | "vehicle_asc">("pleins_desc")

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = rows
      .filter((r) => r.nb_pleins >= minPleins && r.nb_voyages >= minVoyages)
      .filter((r) => {
        if (!q) return true
        return (
          r.vehicle_gps.toLowerCase().includes(q) ||
          (r.immatriculation ?? "").toLowerCase().includes(q)
        )
      })

    if (sortBy === "vehicle_asc") {
      return [...list].sort((a, b) => a.vehicle_gps.localeCompare(b.vehicle_gps))
    }
    if (sortBy === "voyages_desc") {
      return [...list].sort((a, b) => b.nb_voyages - a.nb_voyages)
    }
    return [...list].sort((a, b) => b.nb_pleins - a.nb_pleins)
  }, [minPleins, minVoyages, query, rows, sortBy])

  if (loading && !kpis) {
    return <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
  }
  if (error) {
    return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
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
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="GPS ou immatriculation..."
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
                  <TableRow key={`${row.vehicle_gps}-${row.source}`}>
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
    </div>
  )
}

