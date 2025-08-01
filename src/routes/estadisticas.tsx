import { useState } from "react";
// Components
import Loader from "@/components/loader";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import {
  Pie,
  PieChart,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Sun, Moon, X } from "lucide-react";
//Types
import { Period } from "@/types/solicitudesTypes";
import {
  PERIOD_OPTIONS,
  FRANJAS_TOTALES,
  DAYS_AND_SHIFTS,
} from "@/types/estadisticasTypes";
import { useEstadisticas } from "@/hooks/use-estadisticas";
import { calcularTiempoPromedioRespuesta } from "@/utils/estadisticasCalculations";

export default function EstadisticasRoute() {
  const [selectedPeriods, setSelectedPeriods] = useState<Period[]>([
    { year: 2025, term: 2 },
  ]);
  const {
    isLoading,
    solicitudes,
    solicitudesAtendidas,
    solicitudesSinAtender,
    solicitudesPorGrupo,
    solicitudesPorTipo,
    solicitudesPorIntentos,
    solicitudesPorFranja,
    tiempoRespuestaFranja,
    horaCreacionSolicitud,
  } = useEstadisticas(selectedPeriods);

  // Cálculos derivados
  const tiempoPromedio = calcularTiempoPromedioRespuesta(solicitudesAtendidas);
  const porcentajeAtendidas =
    solicitudes.length > 0
      ? (solicitudesAtendidas.length / solicitudes.length) * 100
      : 0;

  // Handlers para períodos
  const handlePeriodChange = (period: Period) => {
    if (
      !selectedPeriods.some(
        (p) => p.year === period.year && p.term === period.term
      )
    ) {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  const removePeriod = (periodToRemove: Period) => {
    setSelectedPeriods(
      selectedPeriods.filter(
        (period) =>
          !(
            period.year === periodToRemove.year &&
            period.term === periodToRemove.term
          )
      )
    );
  };

  const clearPeriods = () => {
    setSelectedPeriods([]);
  };

  return (
    <div className="container mx-auto">
      <Loader isLoading={isLoading} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Estadísticas de solicitudes</h1>
      </div>

      {/* Period Selector */}
      <div className="flex flex-col md:flex-row items-center gap-4 my-4">
        <Select
          onValueChange={(value) => {
            const [year, term] = value.split("-");
            handlePeriodChange({
              year: parseInt(year),
              term: parseInt(term),
            });
          }}
          value={
            selectedPeriods.length > 0
              ? `${selectedPeriods[0].year}-${selectedPeriods[0].term}`
              : ""
          }
          name="periodo"
        >
          <SelectTrigger className="w-full md:w-2/6">
            <SelectValue placeholder="Seleccionar Periodos" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((period) => (
              <SelectItem
                key={`${period.year}-${period.term}`}
                value={`${period.year}-${period.term}`}
                disabled={selectedPeriods.some(
                  (p) => p.year === period.year && p.term === period.term
                )}
              >
                {`${period.year} - ${period.term}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Periods Display */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {selectedPeriods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPeriods.map((period) => (
              <Badge
                key={`${period.year}-${period.term}`}
                variant="secondary"
                className="px-2 py-1 text-xs md:px-3 md:py-1"
              >
                {`${period.year} - ${period.term}`}
                <button
                  onClick={() => removePeriod(period)}
                  className="ml-1 md:ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPeriods}
              className="h-6 md:h-7 text-xs md:text-sm"
            >
              Limpiar periodos
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-6">
        {/* Stats Cards */}
        <div className="flex flex-col md:flex-row justify-between gap-y-2 gap-x-6 pt-2 md:pt-6">
          <Card className="flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Solicitudes totales</h3>
            <p className="text-2xl font-semibold ml-4">{solicitudes.length}</p>
            <span className="opacity-50">
              solicitudes registradas en el sistema
            </span>
          </Card>

          <Card className="flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Tiempo promedio de respuesta</h3>
            <p className="text-2xl font-semibold ml-4">
              {tiempoPromedio.toFixed(1)} h
            </p>
            <span className="opacity-50">
              en {solicitudesAtendidas.length} solicitudes atendidas
            </span>
          </Card>

          <Card className="flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Atendidas VS sin atender</h3>
            <p className="text-2xl font-semibold ml-4">
              {porcentajeAtendidas.toFixed(1)}% atendidas
            </p>
            <span className="opacity-50">
              {solicitudesAtendidas.length} atendidas /{" "}
              {solicitudesSinAtender.length} sin atender
            </span>
          </Card>
        </div>

        {/* Traffic Chart */}
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 py-2 md:px-6 md:py-4">
            <h3>Tráfico de creación de solicitudes</h3>
            <ChartContainer config={{}} className="w-full min-h-[80px] h-80">
              <AreaChart data={horaCreacionSolicitud}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickMargin={8} />
                <YAxis tickLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-template p-2 border rounded shadow">
                          <p className="text-primary">
                            Hora: {payload[0].payload.status}:00
                          </p>
                          <p className="text-primary">
                            Solicitudes: {payload[0].payload.count}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="hsl(var(--chart-1))"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </Card>
        </div>

        {/* Response Time by Shift */}
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Tiempo promedio de respuesta por franja horaria</h3>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-center">
              {DAYS_AND_SHIFTS.map(({ day, label }) => (
                <Card key={day} className="w-full">
                  <CardHeader className="text-center !py-2 md:!py-4">
                    <CardTitle>{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-2">
                    {FRANJAS_TOTALES.filter((franja) => franja.day === day).map(
                      (franja) => {
                        const franjaData = tiempoRespuestaFranja.find(
                          (f) => f.status === franja.label
                        );
                        return (
                          <div
                            key={franja.label}
                            className="flex justify-between items-center bg-template rounded-md px-4 py-2"
                          >
                            {franja.time === "AM" ? <Sun /> : <Moon />}
                            <span>{franja.time}</span>
                            <span>{franjaData?.tiempoPromedio || "0"}</span>
                          </div>
                        );
                      }
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Pie Charts Row */}
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Estado de solicitudes</h3>
            <span className="opacity-50">Estado de todas las solicitudes</span>
            <ChartContainer config={{}} className="mx-auto w-full min-h-[80px]">
              <PieChart margin={{ top: 15 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={solicitudesPorGrupo}
                  dataKey="count"
                  nameKey="status"
                  label={({ count, percent }) =>
                    `${count} (${(percent * 100).toFixed(0)}%)`
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          </Card>

          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Solicitudes por numero de intentos</h3>
            <span className="opacity-50">
              Numero de solicitudes por estudiante
            </span>
            <ChartContainer config={{}} className="mx-auto w-full min-h-[80px]">
              <PieChart margin={{ top: 15 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={solicitudesPorIntentos}
                  dataKey="count"
                  nameKey="status"
                  label={({ count, percent }) =>
                    `${count} (${(percent * 100).toFixed(0)}%)`
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          </Card>

          <Card className="w-full flex flex-col gap-y-2 flex-1 px-3 py-2 md:px-6 md:py-4">
            <h3>Tipos de solicitudes</h3>
            <span className="opacity-50">
              Distribucion de solicitudes por tipo
            </span>
            <ChartContainer config={{}} className="mx-auto w-full min-h-[80px]">
              <PieChart margin={{ top: 15 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={solicitudesPorTipo}
                  dataKey="count"
                  nameKey="status"
                  label={({ count, percent }) =>
                    `${count} (${(percent * 100).toFixed(0)}%)`
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ChartContainer>
          </Card>
        </div>

        {/* Bar Chart */}
        <div className="flex flex-col md:flex-row w-full justify-between gap-y-2 gap-x-6">
          <Card className="w-full flex flex-col gap-y-2 flex-1 py-2 md:px-6 md:py-4">
            <h3>Solicitudes completadas por franja horaria del estudiante</h3>
            <span className="opacity-50">Solicitudes por franja horaria</span>
            <ChartContainer
              config={{}}
              className="mx-auto w-full min-h-[80px] h-80"
            >
              <BarChart data={solicitudesPorFranja} margin={{ top: 15 }}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      return (
                        <div className="bg-background border p-2 rounded-md">
                          <p>{payload[0].payload.status}</p>
                          <p className="font-semibold">{payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ChartContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
