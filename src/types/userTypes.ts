export interface UserType {
  _id?: number;
  name: string;
  lastname: string;
  username: string;
  permissions: string[];
  kind: "STUDENT" | "ROOT" | "ADMIN";
  verified: boolean;
  createdAt?: string;
  password?: string;
}

// Función para obtener el color del usuario
export const getUserColor = (kind: string): string => {
  const userVariants: Record<string, string> = {
    ADMIN: "bg-blue-500",
    STUDENT: "bg-gray-500",
    ROOT: "bg-green-500",
  };
  return userVariants[kind];
};
