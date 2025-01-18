// Tipos de datos
export interface Solicitud {
  _id?: string;
  student?: {
    name: string;
    lastname: string;
    username: string;
    identification: string;
  };
  requests: {
    from: {
      group: string;
      sku: string;
      name: string;
    } | null;
    to: {
      group: string[];
      sku: string;
      name: string;
    } | null;
    status?: RequestStatus;
    reason?: string | null;
  }[];
  status?: "PENDING" | "REVIEW" | "PARTIAL_REJECTED" | "REJECTED" | "APPROVED";
  observation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

// Función para obtener el texto del estado
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
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
    PARTIAL_REJECTED: "bg-blue-500",
    REJECTED: "bg-red-500",
    APPROVED: "bg-green-500",
  };
  return statusVariants[status];
};
