import { Solicitud, Period } from "@/types/solicitudesTypes";
import { Shift } from "./userTypes";

export interface SolicitudesChart {
  status: string;
  count: number;
  fill?: string;
  tiempoPromedio?: string;
}

export interface EstadisticasState {
  solicitudes: Solicitud[];
  solicitudesAtendidas: Solicitud[];
  solicitudesSinAtender: Solicitud[];
  solicitudesPorGrupo: SolicitudesChart[];
  solicitudesPorTipo: SolicitudesChart[];
  solicitudesPorIntentos: SolicitudesChart[];
  solicitudesPorFranja: SolicitudesChart[];
  tiempoRespuestaFranja: SolicitudesChart[];
  horaCreacionSolicitud: SolicitudesChart[];
}

export interface DayShift {
  day: string;
  label: string;
}

export const DAYS_AND_SHIFTS: DayShift[] = [
  { day: "WEDNESDAY", label: "Miércoles" },
  { day: "THURSDAY", label: "Jueves" },
  { day: "FRIDAY", label: "Viernes" },
];

export const FRANJAS_TOTALES: Shift[] = [
  { day: "MONDAY", time: "AM", label: "Extemporánea" },
  { day: "WEDNESDAY", time: "AM", label: "Mie AM" },
  { day: "WEDNESDAY", time: "PM", label: "Mie PM" },
  { day: "THURSDAY", time: "AM", label: "Jue AM" },
  { day: "THURSDAY", time: "PM", label: "Jue PM" },
  { day: "FRIDAY", time: "AM", label: "Vie AM" },
  { day: "FRIDAY", time: "PM", label: "Vie PM" },
];

export const HORAS_TOTALES: string[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "22",
  "23",
];

export const PERIOD_OPTIONS: Period[] = [
  { year: 2025, term: 1 },
  { year: 2025, term: 2 },
];
