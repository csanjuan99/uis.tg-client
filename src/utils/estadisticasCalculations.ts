import {
  Solicitud,
  getStatusLabel,
  convertToColombianTime,
  getShiftDate,
} from "@/types/solicitudesTypes";
import { dayType, Shift } from "@/types/userTypes";
import {
  SolicitudesChart,
  FRANJAS_TOTALES,
  HORAS_TOTALES,
} from "@/types/estadisticasTypes";

export const getTipoRequest = (request: Solicitud["requests"][0]): string => {
  if (!request) return "Sin tipo";

  if (request.from && !request.to) {
    return "Cancelación";
  } else if (!request.from && request.to) {
    return "Inclusión";
  } else if (request.from && request.to) {
    return "Cambio de grupo";
  }

  return "Otro";
};

export const generateChartColor = (index: number): string => {
  return `hsl(var(--chart-${index + 1}))`;
};

export const calcularSolicitudesPorGrupo = (
  solicitudes: Solicitud[]
): SolicitudesChart[] => {
  const grouped = solicitudes.reduce((acc, solicitud) => {
    const status = getStatusLabel(solicitud.status || "PENDING");
    const existing = acc.find((item) => item.status === status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        status,
        count: 1,
        fill: generateChartColor(acc.length),
      });
    }
    return acc;
  }, [] as SolicitudesChart[]);

  return grouped;
};

export const calcularSolicitudesPorTipo = (
  solicitudes: Solicitud[]
): SolicitudesChart[] => {
  const grouped = solicitudes.reduce((acc, solicitud) => {
    solicitud.requests.forEach((request) => {
      const tipo = getTipoRequest(request);
      const existing = acc.find((item) => item.status === tipo);

      if (existing) {
        existing.count++;
      } else {
        acc.push({
          status: tipo,
          count: 1,
          fill: generateChartColor(acc.length),
        });
      }
    });
    return acc;
  }, [] as SolicitudesChart[]);

  return grouped;
};

export const calcularSolicitudesPorIntentos = (
  solicitudes: Solicitud[]
): SolicitudesChart[] => {
  const conteosPorEstudiante = solicitudes.reduce((acc, solicitud) => {
    const studentId = solicitud.student?.identification;
    if (!studentId) return acc;
    acc[studentId] = (acc[studentId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const grouped = Object.entries(conteosPorEstudiante)
    .reduce((acc, [, intentos]) => {
      const label = `${intentos} ${intentos === 1 ? "intento" : "intentos"}`;
      const existing = acc.find((item) => item.status === label);

      if (existing) {
        existing.count++;
      } else {
        acc.push({
          status: label,
          count: 1,
          fill: generateChartColor(acc.length),
        });
      }
      return acc;
    }, [] as SolicitudesChart[])
    .sort((a, b) => parseInt(a.status) - parseInt(b.status));

  return grouped;
};

export const obtenerFechasFranja = (franja: Shift) => {
  let fechaInicioFranja: Date, fechaFinFranja: Date;

  if (franja.day === "MONDAY" && franja.time === "AM") {
    const fechaViernes = new Date(getShiftDate({ day: "FRIDAY", time: "PM" }));
    fechaInicioFranja = new Date(fechaViernes);
    fechaInicioFranja.setDate(fechaInicioFranja.getDate() + 1);
    fechaFinFranja = new Date(2099, 11, 31);
  } else {
    fechaInicioFranja = new Date(
      getShiftDate({ day: franja.day, time: franja.time })
    );
    fechaFinFranja = new Date(fechaInicioFranja);

    if (franja.time === "AM") {
      fechaFinFranja.setHours(12, 0, 0, 0);
    } else {
      fechaFinFranja.setHours(24, 0, 0, 0);
    }
  }

  return { fechaInicioFranja, fechaFinFranja };
};

export const obtenerSiguienteFranja = (franja: Shift): Date => {
  const { fechaFinFranja } = obtenerFechasFranja(franja);

  if (franja.day === "MONDAY" && franja.time === "AM") {
    return fechaFinFranja;
  }

  const siguientesFranjas = {
    "WEDNESDAY-AM": { day: "WEDNESDAY", time: "PM" },
    "WEDNESDAY-PM": { day: "THURSDAY", time: "AM" },
    "THURSDAY-AM": { day: "THURSDAY", time: "PM" },
    "THURSDAY-PM": { day: "FRIDAY", time: "AM" },
    "FRIDAY-AM": { day: "FRIDAY", time: "PM" },
  } as const;

  const key = `${franja.day}-${franja.time}` as keyof typeof siguientesFranjas;
  const siguiente = siguientesFranjas[key];

  if (siguiente) {
    return new Date(
      getShiftDate({ day: siguiente.day as dayType, time: siguiente.time })
    );
  }

  // Para viernes PM
  const fechaSiguiente = new Date(fechaFinFranja);
  fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
  return fechaSiguiente;
};

export const calcularTiempoRespuestaFranja = (
  solicitudesAtendidas: Solicitud[]
): SolicitudesChart[] => {
  return FRANJAS_TOTALES.map((franja, index) => {
    const { fechaInicioFranja } = obtenerFechasFranja(franja);
    const fechaInicioSiguienteFranja = obtenerSiguienteFranja(franja);

    const solicitudesFranja = solicitudesAtendidas.filter((solicitud) => {
      if (!solicitud.updatedAt || !solicitud.createdAt) return false;

      const fechaUpdate = new Date(solicitud.updatedAt);
      const fechaMiercoles = new Date(
        getShiftDate({ day: "WEDNESDAY", time: "AM" })
      );
      const fechaViernes = new Date(
        getShiftDate({ day: "FRIDAY", time: "PM" })
      );
      const fechaSabado = new Date(fechaViernes);
      fechaSabado.setDate(fechaSabado.getDate() + 1);

      if (franja.day === "MONDAY" && franja.time === "AM") {
        return fechaUpdate >= fechaSabado;
      }

      if (
        franja.day === "WEDNESDAY" &&
        franja.time === "AM" &&
        fechaUpdate < fechaMiercoles
      ) {
        return true;
      }

      return (
        fechaUpdate >= fechaInicioFranja &&
        fechaUpdate < fechaInicioSiguienteFranja
      );
    });

    const tiempoTotal = solicitudesFranja.reduce((acc, solicitud) => {
      if (!solicitud.createdAt || !solicitud.updatedAt) return acc;

      const createdAt = new Date(solicitud.createdAt);
      const updatedAt = new Date(solicitud.updatedAt);

      if (createdAt < fechaInicioFranja) {
        return acc + (updatedAt.getTime() - fechaInicioFranja.getTime());
      } else {
        return acc + (updatedAt.getTime() - createdAt.getTime());
      }
    }, 0);

    const tiempoPromedio = solicitudesFranja.length
      ? tiempoTotal / solicitudesFranja.length / 1000 / 60 / 60
      : 0;

    return {
      status: franja.label ?? "",
      count: solicitudesFranja.length,
      fill: generateChartColor(index),
      tiempoPromedio: tiempoPromedio ? `${tiempoPromedio.toFixed(2)} h` : "n/a",
    };
  });
};

export const calcularSolicitudesPorFranja = (
  solicitudesAtendidas: Solicitud[]
): SolicitudesChart[] => {
  return FRANJAS_TOTALES.map((franja, index) => {
    const solicitudesFranja = solicitudesAtendidas.filter((solicitud) => {
      if (!solicitud.updatedAt) return false;

      const fechaMiercoles = new Date(
        getShiftDate({ day: "WEDNESDAY", time: "AM" })
      );
      const fechaJueves = new Date(
        getShiftDate({ day: "THURSDAY", time: "AM" })
      );
      const fechaViernes = new Date(
        getShiftDate({ day: "FRIDAY", time: "AM" })
      );
      const fechaSabado = new Date(fechaViernes);
      fechaSabado.setDate(fechaSabado.getDate() + 1);

      const fechaUpdate = new Date(solicitud.updatedAt);
      let dia: dayType;

      if (fechaUpdate < fechaMiercoles) {
        return franja.day === "WEDNESDAY" && franja.time === "AM";
      } else if (fechaUpdate < fechaJueves) {
        dia = "WEDNESDAY";
      } else if (fechaUpdate < fechaViernes) {
        dia = "THURSDAY";
      } else if (fechaUpdate < fechaSabado) {
        dia = "FRIDAY";
      } else {
        dia = "MONDAY";
      }

      const hora = convertToColombianTime(solicitud.updatedAt);
      const turno = hora >= 14 && dia !== "MONDAY" ? "PM" : "AM";

      return franja.day === dia && franja.time === turno;
    });

    return {
      status: franja.label ?? "",
      count: solicitudesFranja.length,
      fill: generateChartColor(index),
    };
  });
};

export const calcularHoraCreacionSolicitud = (
  solicitudes: Solicitud[]
): SolicitudesChart[] => {
  const conteo = HORAS_TOTALES.map((hora) => ({
    status: hora,
    count: 0,
  }));

  solicitudes.forEach((solicitud) => {
    if (solicitud.createdAt) {
      const colombianHour = convertToColombianTime(solicitud.createdAt);
      const timeSlot = colombianHour.toString();
      const slotIndex = HORAS_TOTALES.findIndex((slot) => slot === timeSlot);

      if (slotIndex !== -1) {
        conteo[slotIndex].count++;
      }
    }
  });

  return conteo;
};

export const calcularTiempoPromedioRespuesta = (
  solicitudesAtendidas: Solicitud[]
): number => {
  if (solicitudesAtendidas.length === 0) return 0;

  const datosTabla: {
    franja: string;
    fechaInicioFranja: string;
    createdAt: string;
    updatedAt: string;
    tiempoHoras: number;
  }[] = [];

  const tiempoTotal = solicitudesAtendidas.reduce((acc, solicitud) => {
    if (
      !solicitud.createdAt ||
      !solicitud.updatedAt ||
      !solicitud.student?.shift
    ) {
      return acc;
    }

    let tiempo = 0;
    const { fechaInicioFranja } = obtenerFechasFranja(solicitud.student.shift);
    const createdAt = new Date(solicitud.createdAt);
    const updatedAt = new Date(solicitud.updatedAt);

    if (createdAt < fechaInicioFranja) {
      tiempo = updatedAt.getTime() - fechaInicioFranja.getTime();
      // En caso de que la franja sea incorrecta y de negativo, se calculo con cerated time
      if (tiempo < 0) {
        tiempo = updatedAt.getTime() - createdAt.getTime();
      }
    } else {
      tiempo = updatedAt.getTime() - createdAt.getTime();
    }

    const tiempoHoras = tiempo / 1000 / 60 / 60;

    datosTabla.push({
      franja: JSON.stringify(solicitud.student.shift),
      fechaInicioFranja: fechaInicioFranja.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      tiempoHoras: parseFloat(tiempoHoras.toFixed(2)),
    });

    return acc + tiempo;
  }, 0);

  console.table(datosTabla);

  return tiempoTotal / solicitudesAtendidas.length / 1000 / 60 / 60;
};
