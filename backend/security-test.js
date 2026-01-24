const axios = require('axios');

// Configuración de la API
const API_BASE = 'http://localhost:5000/api';

// Función para probar inyección SQL básica
async function testSQLInjection() {
  console.log('\n🔍 Probando inyección SQL...');

  const payloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1' OR '1' = '1"
  ];

  for (const payload of payloads) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: payload,
        password: 'test'
      });
      console.log(`❌ Posible vulnerabilidad SQLi con payload: ${payload}`);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.log(`⚠️  Respuesta inusual con payload: ${payload} - Status: ${error.response?.status}`);
      }
    }
  }
}

// Función para probar rate limiting
async function testRateLimiting() {
  console.log('\n🔍 Probando rate limiting...');

  const promises = [];
  for (let i = 0; i < 150; i++) {
    promises.push(
      axios.post(`${API_BASE}/auth/login`, {
        email: 'test@test.com',
        password: 'test'
      }).catch(error => error)
    );
  }

  const results = await Promise.all(promises);
  const blockedRequests = results.filter(result =>
    result.response?.status === 429 ||
    result.response?.data?.includes('Demasiadas solicitudes')
  );

  if (blockedRequests.length > 0) {
    console.log(`✅ Rate limiting funcionando - ${blockedRequests.length} solicitudes bloqueadas`);
  } else {
    console.log('❌ Rate limiting no detectado - posible vulnerabilidad DoS');
  }
}

// Función para probar XSS básico
async function testXSS() {
  console.log('\n🔍 Probando XSS básico...');

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ];

  // Intentar registro con payloads XSS
  for (const payload of xssPayloads) {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        name: payload,
        email: `test${Date.now()}@test.com`,
        password: 'test123456'
      });
      console.log(`❌ Posible vulnerabilidad XSS en registro con payload: ${payload}`);
    } catch (error) {
      // Error esperado en validación
    }
  }
}

// Función para probar exposición de información
async function testInformationDisclosure() {
  console.log('\n🔍 Probando exposición de información...');

  const endpoints = [
    '/api/users',
    '/api/customers',
    '/api/products',
    '/api/orders',
    '/api/payments'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE}${endpoint}`);
      if (response.status === 200) {
        console.log(`❌ Endpoint ${endpoint} accesible sin autenticación`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ Endpoint ${endpoint} protegido correctamente`);
      } else if (error.response?.status === 403) {
        console.log(`✅ Endpoint ${endpoint} requiere permisos específicos`);
      }
    }
  }
}

// Función para probar configuración CORS
async function testCORS() {
  console.log('\n🔍 Probando configuración CORS...');

  try {
    const response = await axios.get(`${API_BASE}/auth/login`, {
      headers: {
        'Origin': 'https://evil.com'
      }
    });
    console.log('⚠️  Verificar headers CORS en respuesta');
  } catch (error) {
    // Error esperado
  }
}

// Función para probar headers de seguridad
async function testSecurityHeaders() {
  console.log('\n🔍 Probando headers de seguridad...');

  try {
    const response = await axios.get(`${API_BASE}/auth/login`);

    const headers = response.headers;
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy'
    ];

    securityHeaders.forEach(header => {
      if (headers[header.toLowerCase()]) {
        console.log(`✅ Header de seguridad presente: ${header}`);
      } else {
        console.log(`❌ Header de seguridad faltante: ${header}`);
      }
    });

  } catch (error) {
    console.log('⚠️  No se pudo verificar headers de seguridad');
  }
}

// Función principal
async function runSecurityTests() {
  console.log('🚨 INICIANDO ESCANEO DE SEGURIDAD DEL CRM');
  console.log('=' .repeat(50));

  try {
    await testSQLInjection();
    await testRateLimiting();
    await testXSS();
    await testInformationDisclosure();
    await testCORS();
    await testSecurityHeaders();

    console.log('\n' + '=' .repeat(50));
    console.log('✅ ESCANEO COMPLETADO');
    console.log('Revisar los resultados arriba para identificar vulnerabilidades');

  } catch (error) {
    console.error('❌ Error durante el escaneo:', error.message);
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  runSecurityTests();
}

module.exports = {
  runSecurityTests,
  testSQLInjection,
  testRateLimiting,
  testXSS,
  testInformationDisclosure,
  testCORS,
  testSecurityHeaders
};