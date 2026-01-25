/**
 * Sistema de caché en memoria para mejorar rendimiento
 * Útil para datos que cambian con poca frecuencia
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Obtener valor del caché
   * @param {String} key - Clave del caché
   * @returns {*} - Valor almacenado o null si no existe/expiró
   */
  get(key) {
    const ttl = this.ttls.get(key);
    
    if (ttl && Date.now() > ttl) {
      // Caché expirado
      this.delete(key);
      return null;
    }

    return this.cache.get(key) || null;
  }

  /**
   * Guardar valor en caché
   * @param {String} key - Clave del caché
   * @param {*} value - Valor a almacenar
   * @param {Number} ttl - Tiempo de vida en segundos (default: 5 minutos)
   */
  set(key, value, ttl = 300) {
    this.cache.set(key, value);
    if (ttl) {
      this.ttls.set(key, Date.now() + (ttl * 1000));
    }
  }

  /**
   * Eliminar valor del caché
   * @param {String} key - Clave del caché
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Invalidar caché por patrón
   * @param {String} pattern - Patrón de clave (regex)
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.cache.keys());
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.delete(key);
      }
    });
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Crear instancia única de caché
const cache = new MemoryCache();

/**
 * Middleware de caché para endpoints
 * @param {String} keyPrefix - Prefijo para la clave del caché
 * @param {Number} ttl - Tiempo de vida en segundos
 */
const cacheMiddleware = (keyPrefix, ttl = 300) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl}:${req.user?.id || 'public'}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log(`📦 Cache HIT: ${cacheKey}`);
      return res.json(cachedData);
    }

    // Guardar la función json original
    const originalJson = res.json.bind(res);

    // Sobrescribir json para cachear la respuesta
    res.json = (data) => {
      cache.set(cacheKey, data, ttl);
      console.log(`💾 Cache SET: ${cacheKey}`);
      return originalJson(data);
    };

    next();
  };
};

module.exports = {
  cache,
  cacheMiddleware
};
