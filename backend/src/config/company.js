// Configuración de la Empresa
const companyConfig = {
  name: "CRM Lite ERP",
  displayName: "CRM Lite ERP",
  description: "Sistema de Gestión de Relaciones con Clientes",
  
  // Información de contacto
  contact: {
    email: "info@crmliteerp.com",
    phone: "+1 (555) 123-4567",
    website: "www.crmliteerp.com"
  },
  
  // Dirección
  address: {
    street: "123 Business Avenue",
    city: "Dominican Republic",
    state: "Santo Domingo",
    postalCode: "28001",
    country: "Dominican Republic"
  },
  
  // Información fiscal
  tax: {
    id: "TAX-123456789",
    taxPercentage: 18 // ITBIS en República Dominicana
  },
  
  // Información bancaria
  bank: {
    accountHolder: "CRM Lite ERP",
    accountNumber: "****1234",
    bankName: "Banco Ejemplo",
    routingNumber: "000000000"
  },
  
  // Configuración de cotizaciones
  quotes: {
    validityDays: 30,
    prefix: "QT",
    termsAndConditions: "Términos y Condiciones:\n- Validez de la cotización: 30 días\n- Pago requerido antes de la entrega\n- Sujeto a cambios sin previo aviso"
  },
  
  // Logo y branding
  branding: {
    logoUrl: "/logo.png",
    primaryColor: "#4F46E5", // Indigo
    secondaryColor: "#6B7280" // Gray
  }
};

module.exports = companyConfig;
