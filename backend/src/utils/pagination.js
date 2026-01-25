/**
 * Utilidad de paginación para endpoints
 * Facilita la implementación consistente de paginación en toda la API
 */

/**
 * Construye opciones de paginación para Sequelize
 * @param {Object} query - Query parameters del request
 * @returns {Object} - Opciones de paginación y metadatos
 */
const getPaginationOptions = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 10, 100); // Máximo 100 items
  const offset = (page - 1) * limit;

  return {
    limit,
    offset,
    page
  };
};

/**
 * Formatea la respuesta paginada
 * @param {Array} data - Datos a devolver
 * @param {Number} count - Total de registros
 * @param {Object} pagination - Opciones de paginación usadas
 * @returns {Object} - Respuesta formateada con metadatos de paginación
 */
const formatPaginatedResponse = (data, count, pagination) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(count / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Middleware para agregar paginación a requests
 */
const paginationMiddleware = (req, res, next) => {
  req.pagination = getPaginationOptions(req.query);
  next();
};

module.exports = {
  getPaginationOptions,
  formatPaginatedResponse,
  paginationMiddleware
};
