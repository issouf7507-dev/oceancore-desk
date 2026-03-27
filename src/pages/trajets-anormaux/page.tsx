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
import { Button } from "@/components/ui/button"
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
import { Loader2 } from "lucide-react"

function formatFrNumber(
    value: number,
    opts: { minFractionDigits: number; maxFractionDigits: number },
) {
    return value.toLocaleString("fr-FR", {
        minimumFractionDigits: opts.minFractionDigits,
        maximumFractionDigits: opts.maxFractionDigits,
    })
}

export default function TrajetsAnormauxPage() {
    const { kpis, loading, error } = useDashboardKpis()
    const rows = kpis?.kpi5_indice_anomalie_trips ?? []
    const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d")
    const [direction, setDirection] = React.useState<"all" | "over" | "under">("all")
    const [query, setQuery] = React.useState("")

    // console.log(rows)

    const referenceDate = React.useMemo(() => {
        const raw = kpis?.period?.end
        const parsed = raw ? new Date(raw) : undefined
        if (parsed && !Number.isNaN(parsed.getTime())) return parsed

        const timestamps = rows
            .map((r) => (r.date_heure ? new Date(r.date_heure).getTime() : NaN))
            .filter((t) => Number.isFinite(t))

        const max = timestamps.length ? Math.max(...timestamps) : undefined
        return max ? new Date(max) : new Date()
    }, [kpis?.period?.end, rows])

    const filteredRows = React.useMemo(() => {
        let daysToSubtract = 90
        if (timeRange === "30d") daysToSubtract = 30
        if (timeRange === "7d") daysToSubtract = 7

        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)

        const q = query.trim().toLowerCase()

        return rows
            .filter((t) => {
                if (!t.date_heure) return false
                const d = new Date(t.date_heure)
                return d.getTime() >= startDate.getTime()
            })
            .filter((t) => {
                if (!q) return true
                return (
                    t.vehicule_id.toLowerCase().includes(q) ||
                    (t.refueling_id ?? "").toLowerCase().includes(q)
                )
            })
            .filter((t) => {
                const vehicleAvg = t.conso_attendue_l
                const deviationPct =
                    vehicleAvg > 0 ? ((t.conso_trajet_l - vehicleAvg) / vehicleAvg) * 100 : 0
                const absOk = Math.abs(deviationPct) > 20 - 1e-9
                if (direction === "all") return absOk
                if (direction === "over") return absOk && deviationPct >= 20
                return absOk && deviationPct <= -20
            })
    }, [direction, query, referenceDate, rows, timeRange])

    if (loading && !kpis) {
        return (
            <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
        )
    }

    if (error) {
        return <div className="p-4 text-sm text-red-500">Erreur: {error}</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardLayoutHeader title="Trajets anormaux" breadcrumb="" />

            <Card>
                <CardHeader>
                    <CardTitle>KPI 5 – Indice d’anomalie</CardTitle>
                    <CardDescription>
                        Trajets dont la conso s’écarte de plus de 20% de la moyenne du
                        véhicule
                    </CardDescription>
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
                                <div className="text-sm text-muted-foreground">Type</div>
                                <Select
                                    value={direction}
                                    onValueChange={(v) => setDirection(v as any)}
                                >
                                    <SelectTrigger className="w-[220px]">
                                        <SelectValue placeholder="Tous" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous (|écart| &gt; 20%)</SelectItem>
                                        <SelectItem value="over">Conso supérieure</SelectItem>
                                        <SelectItem value="under">Conso inférieure</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <div className="text-sm text-muted-foreground">Recherche</div>
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="GPS véhicule ou trajet..."
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
                                setDirection("all")
                                setTimeRange("90d")
                            }}
                            className="self-end"
                        >
                            Réinitialiser
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Véhicule (GPS)</TableHead>
                                {/* <TableHead>Trajet</TableHead> */}
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Km</TableHead>
                                <TableHead className="text-right">
                                    Conso (L/100km)
                                </TableHead>
                                <TableHead className="text-right">
                                    Moy. véhicule
                                </TableHead>
                                <TableHead className="text-right">Écart</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.length ? (
                                filteredRows.map((t) => {
                                    const deviationPct =
                                        t.conso_attendue_l > 0
                                            ? ((t.conso_trajet_l - t.conso_attendue_l) /
                                                t.conso_attendue_l) *
                                            100
                                            : 0

                                    return (
                                        <TableRow key={t.refueling_id}>
                                            <TableCell className="font-medium">
                                                {t.immatriculation}
                                            </TableCell>
                                            {/* <TableCell>{t.refueling_id}</TableCell> */}
                                            <TableCell>
                                                {t.date_heure
                                                    ? new Date(t.date_heure).toLocaleDateString("fr-FR")
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatFrNumber(t.conso_trajet_l, {
                                                    minFractionDigits: 1,
                                                    maxFractionDigits: 1,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatFrNumber(t.conso_trajet_l, {
                                                    minFractionDigits: 2,
                                                    maxFractionDigits: 2,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatFrNumber(t.conso_attendue_l, {
                                                    minFractionDigits: 2,
                                                    maxFractionDigits: 2,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatFrNumber(deviationPct, {
                                                    minFractionDigits: 1,
                                                    maxFractionDigits: 1,
                                                })}
                                                %
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucun trajet anormal sur la période
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