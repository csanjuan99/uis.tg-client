export const buildFilterQuery = (
  search: string,
  params: string[],
  statuses?: string[],
  periods?: { year: number; term: number }[],
  levels?: string[]
) => {
  const conditions = [];

  // Añadir condiciones de búsqueda si existe un término
  if (search && search !== "") {
    const searchConditions = params.map((param) => ({
      [param]: { $regex: search, $options: "i" },
    }));

    conditions.push({
      $or: searchConditions,
    });
  }

  // Añadir condiciones de estado si hay estados seleccionados
  if (statuses && statuses.length > 0) {
    conditions.push({
      status: { $in: statuses },
    });
  }

  // Añadir condiciones de periodo si hay periodos seleccionados
  if (periods && periods.length > 0) {
    const periodConditions = periods.map((period) => ({
      year: period.year,
      term: period.term,
    }));

    conditions.push({
      period: { $in: periodConditions },
    });
  }

  // Añadir condiciones de nivel si hay niveles seleccionados
  if (levels && levels.length > 0) {
    conditions.push({
      level: { $in: levels },
    });
  }

  // Combinar todas las condiciones con $and
  return conditions.length > 0 ? { $and: conditions } : {};
};
