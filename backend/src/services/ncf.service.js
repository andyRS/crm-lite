const { NcfSequence } = require("../models");
const { sequelize } = require("../config/db");

class NcfLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "NcfLimitError";
  }
}

// Obtiene y consume el siguiente NCF disponible para un tipo de comprobante.
// Debe llamarse dentro de la misma transacción en la que se crea la factura/nota,
// para que si algo falla después, no quede un número "quemado" sin documento asociado.
async function getNextNcf(ncfType, transaction) {
  const sequence = await NcfSequence.findOne({
    where: { ncfType, isActive: true },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  if (!sequence) {
    throw new NcfLimitError(
      `No hay una secuencia NCF activa configurada para el tipo ${ncfType}. Configúrala en Ajustes.`
    );
  }

  const today = new Date().toISOString().split("T")[0];
  if (sequence.expirationDate < today) {
    throw new NcfLimitError(
      `El rango de NCF tipo ${ncfType} venció el ${sequence.expirationDate}. Solicita un nuevo rango a DGII y cárgalo en Ajustes.`
    );
  }

  if (sequence.currentNumber > sequence.rangeEnd) {
    throw new NcfLimitError(
      `El rango de NCF tipo ${ncfType} se agotó (${sequence.rangeStart}-${sequence.rangeEnd}). Solicita un nuevo rango a DGII y cárgalo en Ajustes.`
    );
  }

  const number = sequence.currentNumber;
  const ncf = `${sequence.prefix}${sequence.ncfType}${String(number).padStart(8, "0")}`;

  sequence.currentNumber = Number(sequence.currentNumber) + 1;
  await sequence.save({ transaction });

  return { ncf, ncfSequenceId: sequence.id };
}

// Resumen de todas las secuencias activas, con alertas de agotamiento/vencimiento próximo.
async function getSequenceStatus() {
  const sequences = await NcfSequence.findAll({ order: [["ncfType", "ASC"]] });
  const today = new Date();

  return sequences.map((seq) => {
    const total = Number(seq.rangeEnd) - Number(seq.rangeStart) + 1;
    const used = Number(seq.currentNumber) - Number(seq.rangeStart);
    const remaining = Number(seq.rangeEnd) - Number(seq.currentNumber) + 1;
    const daysToExpire = Math.ceil(
      (new Date(seq.expirationDate) - today) / (1000 * 60 * 60 * 24)
    );

    return {
      id: seq.id,
      fiscalType: seq.fiscalType,
      ncfType: seq.ncfType,
      prefix: seq.prefix,
      rangeStart: seq.rangeStart,
      rangeEnd: seq.rangeEnd,
      currentNumber: seq.currentNumber,
      expirationDate: seq.expirationDate,
      isActive: seq.isActive,
      total,
      used: Math.max(used, 0),
      remaining: Math.max(remaining, 0),
      daysToExpire,
      nearLimit:
        seq.isActive &&
        (remaining <= seq.alertThreshold || daysToExpire <= 30),
      expired: daysToExpire < 0,
      exhausted: remaining <= 0,
    };
  });
}

async function createSequence(data) {
  const { ncfType, rangeStart, rangeEnd, expirationDate, prefix, fiscalType, alertThreshold } = data;

  if (!NcfSequence.NCF_TYPES.includes(ncfType)) {
    throw new NcfLimitError(`Tipo de comprobante inválido: ${ncfType}`);
  }
  if (Number(rangeEnd) <= Number(rangeStart)) {
    throw new NcfLimitError("El final del rango debe ser mayor que el inicio");
  }
  if (new Date(expirationDate) <= new Date()) {
    throw new NcfLimitError("La fecha de vencimiento debe ser futura");
  }

  // Desactivar cualquier secuencia previa activa del mismo tipo (la nueva pasa a ser la vigente)
  await NcfSequence.update({ isActive: false }, { where: { ncfType, isActive: true } });

  return NcfSequence.create({
    fiscalType: fiscalType || "ncf",
    ncfType,
    prefix: prefix || "B",
    rangeStart,
    rangeEnd,
    currentNumber: rangeStart,
    expirationDate,
    alertThreshold: alertThreshold || 50,
    isActive: true,
  });
}

async function updateSequence(id, data) {
  const sequence = await NcfSequence.findByPk(id);
  if (!sequence) {
    throw new NcfLimitError("Secuencia no encontrada");
  }

  const { rangeStart, currentNumber } = data;
  if (rangeStart !== undefined || currentNumber !== undefined) {
    const newCurrent = currentNumber !== undefined ? Number(currentNumber) : Number(sequence.currentNumber);
    if (newCurrent < Number(sequence.currentNumber) - 0 && currentNumber !== undefined) {
      // Solo se permite ajustar hacia adelante para no reutilizar un número ya emitido
      if (Number(currentNumber) < Number(sequence.currentNumber)) {
        throw new NcfLimitError("No se puede retroceder el correlativo por debajo de lo ya emitido");
      }
    }
  }

  await sequence.update({
    expirationDate: data.expirationDate !== undefined ? data.expirationDate : sequence.expirationDate,
    isActive: data.isActive !== undefined ? data.isActive : sequence.isActive,
    alertThreshold: data.alertThreshold !== undefined ? data.alertThreshold : sequence.alertThreshold,
  });

  return sequence;
}

module.exports = {
  getNextNcf,
  getSequenceStatus,
  createSequence,
  updateSequence,
  NcfLimitError,
};
