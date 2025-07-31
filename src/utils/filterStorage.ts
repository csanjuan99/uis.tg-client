// hooks/usePersistentState.ts
import { useState, useEffect } from "react";
import { SortingState } from "../types/tableTypes";
import { Shift } from "../types/solicitudesTypes";

interface Period {
  year: number;
  term: number;
}

// Hook genérico para persistir estado en localStorage/sessionStorage
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  storage: "localStorage" | "sessionStorage" = "sessionStorage"
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storageObj =
        storage === "localStorage" ? localStorage : sessionStorage;
      const item = storageObj.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading ${storage} key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      const storageObj =
        storage === "localStorage" ? localStorage : sessionStorage;
      storageObj.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting ${storage} key "${key}":`, error);
    }
  }, [key, state, storage]);

  return [state, setState];
}

// Hook específico para los filtros de solicitudes
export function useFilterStorage() {
  const [page, setPage] = usePersistentState("solicitudes_page", 0);
  const [filter, setFilter] = usePersistentState("solicitudes_filter", "");
  const [selectedStatuses, setSelectedStatuses] = usePersistentState<string[]>(
    "solicitudes_statuses",
    []
  );
  const [selectedShifts, setSelectedShifts] = usePersistentState<Shift[]>(
    "solicitudes_shifts",
    []
  );
  const [selectedPeriods, setSelectedPeriods] = usePersistentState<Period[]>(
    "solicitudes_periods",
    [{ year: 2025, term: 2 }]
  );
  const [selectedLevels, setSelectedLevels] = usePersistentState<string[]>(
    "solicitudes_levels",
    []
  );
  const [sorting, setSorting] = usePersistentState<SortingState>(
    "solicitudes_sorting",
    {
      sortBy: "",
      sort: "asc",
    }
  );

  return {
    page,
    setPage,
    filter,
    setFilter,
    selectedStatuses,
    setSelectedStatuses,
    selectedShifts,
    setSelectedShifts,
    selectedPeriods,
    setSelectedPeriods,
    selectedLevels,
    setSelectedLevels,
    sorting,
    setSorting,
  };
}
