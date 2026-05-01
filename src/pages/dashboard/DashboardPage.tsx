import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, Bar, BarChart, LabelList } from "recharts"
import { Loader2, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { DashboardLayoutHeader } from '@/layouts/components/DashboardLayoutHeader'
import { handleApiError } from "@/helpers/handleapierror"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,

  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// import { useDashboardKpis } from "@/hooks/use-dashboard-kpis"
import { Button } from "@/components/ui/button"
import { useDashboardHome } from "@/hooks/use-dashboard-home"
import { useEffect } from "react"



const areaChartConfig = {
  conso_l_100km: {
    label: "Consommation moyenne (L/100km)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig


function ChartAreaInteractive({
  series,
  periodEnd,
}: {
  series?: Array<{ date: string; conso_l_100km: number }>
  periodEnd?: string
}) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const sourceData = series && series.length ? series : []
  const referenceDate = new Date(
    periodEnd ?? sourceData[sourceData.length - 1]?.date ?? "2024-06-30",
  )

  const filteredData = sourceData.filter((item) => {
    const date = new Date(item.date)
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Consommation Moyenne Flotte</CardTitle>
          <CardDescription>
            Consommation moyenne (L/100km) sur la période sélectionnée
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
        <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
          <Link to="/consommation-moyenne-flotte">Détails</Link>
        </Button>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={areaChartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillConso" x1="0" y1="0" x2="0" y2="1">
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
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    })
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
            <Area
              dataKey="conso_l_100km"
              type="natural"
              fill="url(#fillConso)"
              stroke="var(--color-conso_l_100km)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="secondary" size="sm" className="mx-auto">
          <Link to="/conso-ponderee-ligne">Détails</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}





function KPI5AnomalyTable({
  rows,
}: {
  rows?: Array<{
    fuel_log_id: number;
    vehicule_id: number;
    date_heure: string;
    ligne: string;
    conso_trajet_l: number;
    conso_attendue_l: number;
    ecart_pct: number;
    type: string;
    immatriculation: string;
  }>
}) {
  const data = rows ?? []

  // console.log(data)
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI 5 – Indice d’anomalie</CardTitle>
        <CardDescription>
          Trajets dont la conso s’écarte de &gt;20% de la moyenne du véhicule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Véhicule (GPS)</TableHead>
              {/* <TableHead>Trajet</TableHead> */}
              <TableHead>Date</TableHead>
              {/* <TableHead className="text-right">Km</TableHead> */}
              <TableHead className="text-right">Conso (L/100km)</TableHead>
              <TableHead className="text-right">Moy. véhicule</TableHead>
              <TableHead className="text-right">Écart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.slice(0, 12).map((t) => {
                // const deviationPct =
                //   t.vehicle_avg_l_100km > 0
                //     ? ((t.conso_l_100km - t.vehicle_avg_l_100km) /
                //       t.vehicle_avg_l_100km) *
                //     100
                //     : 0

                return (
                  <TableRow key={t.vehicule_id}>
                    <TableCell className="font-medium">{t.immatriculation}</TableCell>
                    {/* <TableCell>{t.trip_ref}s</TableCell> */}
                    <TableCell>
                      {t.date_heure ? new Date(t.date_heure).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }) : "—"}

                      {/* {new Date(t.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })} */}
                    </TableCell>
                    {/* <TableCell className="text-right">
                      {t.km.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </TableCell> */}
                    <TableCell className="text-right font-medium">
                      {t.conso_trajet_l.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.conso_attendue_l.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.ecart_pct.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucun trajet anormal sur la période
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}



function KPI6RefuelingFrequencyList({
  rows,
}: {
  rows?: Array<{
    vehicule_id: string
    immatriculation?: string
    nb_pleins: number
    nb_voyages: number
    source?: string
  }>
}) {
  const data = rows ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI 6 – Fréquence ravitaillements par véhicule</CardTitle>
        <CardDescription>Données mobile</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Véhicule (GPS)</TableHead>
              <TableHead className="text-right">Nb pleins</TableHead>
              <TableHead className="text-right">Nb voyages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row) => (
                <TableRow key={row.vehicule_id}>
                  <TableCell className="font-medium">{row.immatriculation}</TableCell>
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
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Aucun enregistrement sur la période
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="secondary" size="sm" className="mx-auto">
          <Link to="/frequence-ravitaillements">Détails</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}



function KPI7EcoScoreTop5List({
  rows,
}: {
  rows?: {
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
}) {
  const data = rows?.top.slice(0, 20) ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI 7 – Eco-score chauffeur (Top 5)</CardTitle>
        <CardDescription>Classement des chauffeurs les plus éco-responsables</CardDescription>
      </CardHeader>
      <CardContent>
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
            {data.length ? (
              data.map((row, idx) => (
                <TableRow key={`${row.driver_id}-${idx}`}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{row.nom}</TableCell>
                  <TableCell className="text-right font-medium">
                    {row.score.toLocaleString("fr-FR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.avg_conso_l_100km.toLocaleString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Aucun chauffeur disponible sur la période
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="secondary" size="sm" className="mx-auto">
          <Link to="/eco-score-chauffeurs">Détails</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


const kpi8MaxSpeedConfig = {
  vmax_kmh: {
    label: "Vitesse max (km/h)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function KPI8MaxSpeedBarLabel({
  rows,
}: {
  rows?: Array<{
    // vehicle: string
    // vmax_kmh: number

    vehicle_id: number;
    immatriculation: string;
    vitesse_max_kmh: number;
    alerte_vitesse: {
      code_couleur: string;
      statut: string;
      action_requise: string;
      severite: string;
    }

  }>
}) {
  const data = rows ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI 8 – Vitesse max par véhicule</CardTitle>
        <CardDescription>Source GPS, tous voyages confondus (période)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={kpi8MaxSpeedConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="immatriculation"
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
            <Bar dataKey="vitesse_max_kmh" fill="var(--color-vmax_kmh)" radius={8}>
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
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="secondary" size="sm" className="mx-auto">
          <Link to="/vitesse-max-vehicule">Détails</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}



function KPI9WeightedConsumptionByLineList({
  rows,
}: {
  rows?: Array<{
    ligne_id: number;
    code_ligne: string;
    coefficient_charge_bagages: number;
    conso_brute_l_100km: number;
    conso_ponderee_l_100km: number;
    // line: string
    // luggage_coeff: number
    // weighted_conso_l_100km: number
  }>
}) {
  const data = rows ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI 9 – Conso pondérée par ligne</CardTitle>
        <CardDescription>Avec coefficient de charge bagages</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ligne</TableHead>
              <TableHead className="text-right">Coeff. bagages</TableHead>
              <TableHead className="text-right">Conso pondérée (L/100km)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row) => (
                <TableRow key={row.ligne_id}>
                  <TableCell className="font-medium">{row.code_ligne}</TableCell>
                  <TableCell className="text-right">
                    {row.coefficient_charge_bagages.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.conso_ponderee_l_100km.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Aucune donnée de pondération
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ChartRadialShape({
  title,
  description,
  value,
  valueLabel,
  trend,
  trendDescription,
  color,
  maxValue,
  formatValue,

}: {
  title: string
  description: string
  value: number
  valueLabel: string
  trend: string
  trendDescription: string
  color?: string
  maxValue?: number
  formatValue?: (val: number) => string
  detailsHref?: string
}) {
  // Calculate percentage for visual display (RadialBarChart uses 0-100 scale)
  const percentage = maxValue ? Math.min((value / maxValue) * 100, 100) : 82

  const chartData = [
    { visitors: percentage, fill: color },
  ]

  const chartConfig = {
    visitors: {
      label: valueLabel,
    },
  } satisfies ChartConfig

  const formattedValue = formatValue ? formatValue(value) : value.toLocaleString()

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            // endAngle={100}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold text"
                        >
                          {formattedValue}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {valueLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trend} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground   text-center gap-2">
          {trendDescription}
        </div>
      </CardFooter>
    </Card>
  )
}



const kpi4ConsoByVehicleConfig = {
  conso_l_100km: {
    label: "Conso (L/100km)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig





function ChartBarLabel({
  rows,
}: {
  rows?: Array<{
    // vehicle_gps: string
    conso_l_100km: number
    km_total: number
    immatriculation: string
  }>
}) {
  const data = rows ?? []
  // console.log(data)
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI 4 – Consommation moyenne par véhicule</CardTitle>
        <CardDescription>Sur les ravitaillements </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={kpi4ConsoByVehicleConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
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
                    const item = payload?.[0]?.payload as
                      | { immatriculation?: string; km_total?: number }
                      | undefined
                    const km = item?.km_total
                    const kmText =
                      typeof km === "number"
                        ? km.toLocaleString("fr-FR", {
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
            <Bar
              dataKey="conso_l_100km"
              fill="var(--color-conso_l_100km)"
              radius={8}
            >
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
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Axe X: véhicule (derniers 6 chiffres). Labels: conso (L/100km).
        </div>
        <Button asChild variant="secondary" size="sm" className="mx-auto">
          <Link to="/conso-moyenne-vehicule">Détails</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


export function DashboardPage() {

  const { loading, errors, kpi1, kpi2, kpi3, kpi4, kpi5, kpi6, kpi7, kpi8, kpi9, kpi10 } = useDashboardHome()
  // console.log("ada", ada)
  // console.log("kpi4", kpi4)



  useEffect(() => {
    const has401 = Object.values(errors).some(
      (e: any) => e?.status === 401 || e?.response?.status === 401
    )
    if (has401) handleApiError({ status: 401 }, "/")
  }, [errors])

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground text-center items-center justify-center flex h-screen gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des KPI...</div>
  }



  return (
    <>
      <DashboardLayoutHeader title="Dashboard" breadcrumb="" />

      {/* Bandeau si certains KPIs ont échoué */}
      {Object.keys(errors).length > 0 && (
        <div className="mx-4 mb-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
          Certains indicateurs n'ont pas pu être chargés :{" "}
          {Object.keys(errors).join(", ")}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3 ">

          <ChartRadialShape
            title="Volume total consommé (période)"
            description="Somme des consommations calculées"
            value={kpi2?.kpi.total_litres ?? 0}
            valueLabel="L"
            trend="—"
            trendDescription="Somme des consommations calculées (consommation_calculee_l)"
            color="#535c68"
            maxValue={500}
            detailsHref="/volume-total-consomme-periode"
            formatValue={(val) =>
              `${val.toLocaleString("fr-FR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}`
            }
          />
          <ChartRadialShape
            title="Taux de disponibilité de la flotte"
            description="Basé sur le référentiel véhicules"
            // value={kpis?.kpi10_taux_disponibilite_flotte.taux_disponibilite_pct ?? 0}
            value={kpi10?.kpi?.taux_disponibilite_pct ?? 0}
            valueLabel="%"
            trend={`${kpi10?.kpi.nb_actifs ?? 0} / ${kpi10?.kpi.nb_total ?? 0
              } véhicules actifs`}
            trendDescription="Disponibilité sur la période"
            color="#535c68"
            maxValue={100}
            formatValue={(val) =>
              `${val.toLocaleString("fr-FR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}`
            }
          />

          <ChartRadialShape
            title="Coût carburant"
            description="Montant estimé des ravitaillements"
            value={kpi3?.kpi.total_fcfa ?? 0}
            valueLabel="FCFA"
            trend="—"
            trendDescription="Montant estimé des ravitaillements"
            color="#535c68"
            maxValue={500_000}
            formatValue={(val) =>
              `${val.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}`
            }
          />


        </div>

        <div className="">
          <ChartAreaInteractive
            series={kpi1?.kpi}
            periodEnd={kpi1?.period.end}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* <ChartBarMultiple /> */}
          <ChartBarLabel
            rows={kpi4?.kpi ?? []}
          />
          <KPI5AnomalyTable rows={kpi5?.kpi} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <KPI6RefuelingFrequencyList
            rows={kpi6?.kpi ?? []}
          />
          <KPI7EcoScoreTop5List rows={kpi7?.kpi} />
          <KPI8MaxSpeedBarLabel rows={kpi8?.kpi ?? []} />
          <KPI9WeightedConsumptionByLineList
            rows={kpi9?.kpi ?? []}
          />
        </div>
      </div>
    </>
  )
}
