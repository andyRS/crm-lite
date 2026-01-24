#!/usr/bin/env node

/**
 * Script de Validación de Seguridad
 * Verifica que todas las configuraciones de seguridad estén correctamente implementadas
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 VALIDACIÓN DE SEGURIDAD - CRM Lite');
console.log('=' .repeat(50));

// Función para verificar existencia de archivos
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'Presente' : 'Faltante'}`);
  return exists;
}

// Función para verificar contenido de archivos
function checkFileContent(filePath, patterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = patterns.map(pattern => ({
      pattern: pattern.description,
      found: pattern.regex.test(content)
    }));

    const allFound = results.every(r => r.found);
    console.log(`${allFound ? '✅' : '❌'} ${description}:`);

    results.forEach(result => {
      console.log(`   ${result.found ? '✅' : '❌'} ${result.pattern}`);
    });

    return allFound;
  } catch (error) {
    console.log(`❌ ${description}: Error al leer archivo - ${error.message}`);
    return false;
  }
}

// Función para validar JWT secret desde archivo .env
function validateJWTSecret() {
  try {
    const envPath = path.join(__dirname, 'backend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);

    if (!jwtMatch) {
      console.log('❌ JWT_SECRET: No configurado en .env');
      return false;
    }

    const jwtSecret = jwtMatch[1].trim();
    const isLongEnough = jwtSecret.length >= 32; // Mínimo 32 para desarrollo
    const isNotDefault = !jwtSecret.includes('supersecreto123') && !jwtSecret.includes('tu_jwt_secret');

    console.log(`✅ JWT_SECRET: Configurado en .env`);
    console.log(`   ${isLongEnough ? '✅' : '❌'} Longitud suficiente (>=32 caracteres)`);
    console.log(`   ${isNotDefault ? '✅' : '❌'} No es valor por defecto`);

    return isLongEnough && isNotDefault;
  } catch (error) {
    console.log('❌ JWT_SECRET: Error al leer .env - ' + error.message);
    return false;
  }
}

// Verificaciones de archivos
console.log('\n📁 VERIFICACIÓN DE ARCHIVOS:');
checkFileExists('backend/.env', 'Archivo de variables de entorno');
checkFileExists('backend/logs/security.log', 'Log de seguridad');
checkFileExists('SECURITY.md', 'Documentación de seguridad');

// Verificación de .gitignore
console.log('\n🔒 VERIFICACIÓN DE .GITIGNORE:');
checkFileContent('.gitignore', [
  { regex: /\.env/, description: 'Variables de entorno ignoradas' },
  { regex: /logs/, description: 'Logs ignorados' },
  { regex: /node_modules/, description: 'Dependencias ignoradas' }
], 'Configuración de .gitignore segura');

// Verificación de dependencias de seguridad
console.log('\n📦 VERIFICACIÓN DE DEPENDENCIAS:');
checkFileContent('backend/package.json', [
  { regex: /helmet/, description: 'Helmet para headers de seguridad' },
  { regex: /express-rate-limit/, description: 'Rate limiting' },
  { regex: /joi/, description: 'Validación de entrada' },
  { regex: /bcrypt/, description: 'Encriptación de contraseñas' }
], 'Dependencias de seguridad instaladas');

// Verificación de configuración de seguridad
console.log('\n⚙️ VERIFICACIÓN DE CONFIGURACIÓN:');
validateJWTSecret();

// Verificación de middleware de seguridad
console.log('\n🛡️ VERIFICACIÓN DE MIDDLEWARE:');
checkFileContent('backend/src/app.js', [
  { regex: /helmet/, description: 'Helmet configurado' },
  { regex: /rateLimit/, description: 'Rate limiting implementado' },
  { regex: /securityLogger/, description: 'Logging de seguridad activo' },
  { regex: /attackDetection/, description: 'Detección de ataques activa' }
], 'Middleware de seguridad implementado');

// Verificación de modelo User seguro
console.log('\n👤 VERIFICACIÓN DE MODELO USER:');
checkFileContent('backend/src/models/user.model.js', [
  { regex: /failedLoginAttempts/, description: 'Campo de intentos fallidos' },
  { regex: /lockedUntil/, description: 'Campo de bloqueo temporal' },
  { regex: /tokenVersion/, description: 'Campo de versión de token' }
], 'Campos de seguridad en modelo User');

// Verificación de validaciones
console.log('\n✅ VERIFICACIÓN DE VALIDACIONES:');
checkFileContent('backend/src/middlewares/validation.middleware.js', [
  { regex: /sanitizeString/, description: 'Sanitización XSS implementada' },
  { regex: /min\(8\)/, description: 'Validación de longitud mínima de contraseña' }
], 'Validaciones de seguridad implementadas');

// Verificación de frontend seguro
console.log('\n🌐 VERIFICACIÓN DE FRONTEND:');
checkFileContent('frontend/src/context/AuthContext.jsx', [
  { regex: /isTokenExpired/, description: 'Validación de expiración de tokens' },
  { regex: /isTokenExpiringSoon/, description: 'Detección de tokens por expirar' }
], 'Gestión segura de tokens en frontend');

checkFileContent('frontend/src/vite.config.js', [
  { regex: /drop_console/, description: 'Remoción de console.logs en producción' },
  { regex: /strictPort/, description: 'Configuración de puerto estricto' }
], 'Configuración Vite segura');

// Resumen final
console.log('\n' + '=' .repeat(50));
console.log('🎯 RESUMEN DE VALIDACIÓN:');
console.log('Revisa los resultados arriba. Todos los elementos marcados con ✅');
console.log('indican que la configuración de seguridad está correctamente implementada.');
console.log('');
console.log('Para producción adicional:');
console.log('- Configurar HTTPS');
console.log('- Usar variables de entorno seguras');
console.log('- Configurar monitoreo continuo');
console.log('- Implementar backups automáticos');
console.log('');
console.log('📖 Consulta SECURITY.md para más detalles sobre las medidas implementadas.');