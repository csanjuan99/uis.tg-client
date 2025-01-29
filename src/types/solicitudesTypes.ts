// Tipos de datos
export interface Solicitud {
  _id?: string;
  student?: {
    name: string;
    lastname: string;
    username: string;
    identification: string;
    shift?: {
      day: dayType;
      time: "AM" | "PM";
    } | null;
  };
  requests: {
    from: {
      group: string;
      sku: string;
      name: string;
      approved?: boolean | null;
    } | null;
    to:
      | {
          group: string;
          sku: string;
          name: string;
          approved: boolean | null;
        }[]
      | null;
    status?: RequestStatus;
    reason?: string | null;
  }[];
  status?: "PENDING" | "REVIEW" | "PARTIAL_REJECTED" | "REJECTED" | "APPROVED";
  ask?: string;
  observation?: string;
  attended?: {
    name: string;
    lastname: string;
    _id: string;
  };
  logs?: {
    message: string;
    user: {
      name: string;
      lastname: string;
    };
  }[];
  createdAt?: string;
  updatedAt?: string;
}

type dayType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

//Funcion para obtener el dia y jornada del shift
export const getShiftLabel = (shift: {
  day: dayType;
  time: "AM" | "PM";
}): string => {
  const days: Record<dayType, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
  };

  return `${days[shift.day]} - ${shift.time === "AM" ? "Mañana" : "Tarde"}`;
};

// Función para obtener el texto del estado
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    REVIEW: "En Revisión",
    PARTIAL_REJECTED: "Parcialmente Completada",
    REJECTED: "Fallida",
    APPROVED: "Completada",
  };
  return statusLabels[status] || "Desconocido";
};

// Función para obtener el color del estado
export const getBadgeColor = (status: string): string => {
  const statusVariants: Record<string, string> = {
    PENDING: "bg-yellow-500",
    REVIEW: "bg-blue-500",
    PARTIAL_REJECTED: "bg-orange-500",
    REJECTED: "bg-red-500",
    APPROVED: "bg-green-500",
  };
  return statusVariants[status];
};
