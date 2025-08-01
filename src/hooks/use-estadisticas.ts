import { useState, useEffect } from "react";

import { useAxios } from "../providers/AxiosContext";
import { useToast } from "@/hooks/use-toast";
import { buildFilterQuery } from "@/utils/filterQuery";
import { Solicitud, Period } from "@/types/solicitudesTypes";
import { EstadisticasState } from "@/types/estadisticasTypes";
import {
  calcularSolicitudesPorGrupo,
  calcularSolicitudesPorTipo,
  calcularSolicitudesPorIntentos,
  calcularTiempoRespuestaFranja,
  calcularSolicitudesPorFranja,
  calcularHoraCreacionSolicitud,
} from "@/utils/estadisticasCalculations";

export const useEstadisticas = (selectedPeriods: Period[]) => {
  const [isLoading, setIsLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasState>({
    solicitudes: [],
    solicitudesAtendidas: [],
    solicitudesSinAtender: [],
    solicitudesPorGrupo: [],
    solicitudesPorTipo: [],
    solicitudesPorIntentos: [],
    solicitudesPorFranja: [],
    tiempoRespuestaFranja: [],
    horaCreacionSolicitud: [],
  });

  const axios = useAxios();
  const { toast } = useToast();

  // Fetch solicitudes
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          filter: JSON.stringify(buildFilterQuery("", [], [], selectedPeriods)),
        });
        const { data } = await axios.get(`/api/appeal`, { params });

        setEstadisticas((prev) => ({ ...prev, solicitudes: data }));
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ||
          (error as Error).message ||
          "Ha ocurrido un error inesperado";

        toast({
          variant: "destructive",
          title: "Estadisticas fallidas",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitudes();
  }, [axios, toast, selectedPeriods]);

  // Calculate statistics when solicitudes change
  useEffect(() => {
    const { solicitudes } = estadisticas;

    const solicitudesAtendidas = solicitudes.filter(
      (solicitud: Solicitud) =>
        solicitud.status !== "PENDING" && solicitud.status !== "REVIEW"
    );

    const solicitudesSinAtender = solicitudes.filter(
      (solicitud: Solicitud) =>
        solicitud.status === "PENDING" || solicitud.status === "REVIEW"
    );

    const newEstadisticas: EstadisticasState = {
      solicitudes,
      solicitudesAtendidas,
      solicitudesSinAtender,
      solicitudesPorGrupo: calcularSolicitudesPorGrupo(solicitudes),
      solicitudesPorTipo: calcularSolicitudesPorTipo(solicitudes),
      solicitudesPorIntentos: calcularSolicitudesPorIntentos(solicitudes),
      solicitudesPorFranja: calcularSolicitudesPorFranja(solicitudesAtendidas),
      tiempoRespuestaFranja:
        calcularTiempoRespuestaFranja(solicitudesAtendidas),
      horaCreacionSolicitud: calcularHoraCreacionSolicitud(solicitudes),
    };

    setEstadisticas(newEstadisticas);
  }, [estadisticas.solicitudes]);

  return { isLoading, ...estadisticas };
};
