const { Company } = require("../models");
const companyDefaults = require("../config/company.js");

// Obtener los datos de la empresa (singleton, id=1). Cualquier usuario autenticado puede leer
// (se necesita para armar el PDF/impresión de facturas).
exports.get = async (req, res) => {
  try {
    const [company] = await Company.findOrCreate({
      where: { id: 1 },
      defaults: {
        id: 1,
        name: companyDefaults.name,
        rnc: "000000000",
        email: companyDefaults.contact.email,
        phone: companyDefaults.contact.phone,
        address: `${companyDefaults.address.street}, ${companyDefaults.address.city}`,
        defaultCurrency: "DOP",
        defaultTaxRate: companyDefaults.tax.taxPercentage,
        logoUrl: companyDefaults.branding.logoUrl,
        bankName: companyDefaults.bank.bankName,
        bankAccountHolder: companyDefaults.bank.accountHolder,
        bankAccountNumber: companyDefaults.bank.accountNumber,
        primaryColor: companyDefaults.branding.primaryColor,
        secondaryColor: companyDefaults.branding.secondaryColor,
        invoiceFooterNotes: companyDefaults.quotes.termsAndConditions,
      },
    });

    res.json(company);
  } catch (err) {
    console.error("Error al obtener datos de la empresa:", err);
    res.status(500).json({ msg: "Error al obtener datos de la empresa" });
  }
};

// Actualizar los datos de la empresa. Solo admin.
exports.update = async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Solo un administrador puede editar los datos de la empresa" });
    }

    const {
      name,
      rnc,
      email,
      phone,
      address,
      defaultCurrency,
      defaultTaxRate,
      logoUrl,
      bankName,
      bankAccountHolder,
      bankAccountNumber,
      primaryColor,
      secondaryColor,
      invoiceFooterNotes,
    } = req.body;

    const [company] = await Company.findOrCreate({ where: { id: 1 } });

    await company.update({
      name: name !== undefined ? name : company.name,
      rnc: rnc !== undefined ? rnc : company.rnc,
      email: email !== undefined ? email : company.email,
      phone: phone !== undefined ? phone : company.phone,
      address: address !== undefined ? address : company.address,
      defaultCurrency: defaultCurrency !== undefined ? defaultCurrency : company.defaultCurrency,
      defaultTaxRate: defaultTaxRate !== undefined ? defaultTaxRate : company.defaultTaxRate,
      logoUrl: logoUrl !== undefined ? logoUrl : company.logoUrl,
      bankName: bankName !== undefined ? bankName : company.bankName,
      bankAccountHolder: bankAccountHolder !== undefined ? bankAccountHolder : company.bankAccountHolder,
      bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber : company.bankAccountNumber,
      primaryColor: primaryColor !== undefined ? primaryColor : company.primaryColor,
      secondaryColor: secondaryColor !== undefined ? secondaryColor : company.secondaryColor,
      invoiceFooterNotes: invoiceFooterNotes !== undefined ? invoiceFooterNotes : company.invoiceFooterNotes,
    });

    res.json(company);
  } catch (err) {
    console.error("Error al actualizar datos de la empresa:", err);
    res.status(500).json({ msg: "Error al actualizar datos de la empresa" });
  }
};
