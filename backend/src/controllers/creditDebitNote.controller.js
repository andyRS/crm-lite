const { CreditDebitNote, Invoice, Customer, User } = require("../models");
const { sequelize } = require("../config/db");
const ncfService = require("../services/ncf.service");
const { createNotification } = require("./notification.controller");

exports.getAll = async (req, res) => {
  try {
    const { invoice_id } = req.query;
    const whereClause = invoice_id ? { invoice_id } : {};

    const notes = await CreditDebitNote.findAll({
      where: whereClause,
      include: [
        { model: Invoice, attributes: ["id", "invoiceNumber", "ncf", "total"] },
        { model: Customer, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(notes);
  } catch (err) {
    console.error("Error al listar notas de crédito/débito:", err);
    res.status(500).json({ msg: "Error al listar notas de crédito/débito" });
  }
};

exports.getById = async (req, res) => {
  try {
    const note = await CreditDebitNote.findByPk(req.params.id, {
      include: [
        { model: Invoice, attributes: ["id", "invoiceNumber", "ncf", "total"] },
        { model: Customer, attributes: ["id", "name"] },
      ],
    });

    if (!note) {
      return res.status(404).json({ msg: "Nota no encontrada" });
    }

    res.json(note);
  } catch (err) {
    console.error("Error al obtener nota:", err);
    res.status(500).json({ msg: "Error al obtener nota" });
  }
};

exports.create = async (req, res) => {
  const { user } = req;
  const { invoice_id, noteType, amount, reason } = req.body;

  if (!invoice_id || !noteType || !amount || !reason) {
    return res.status(400).json({ msg: "invoice_id, noteType, amount y reason son obligatorios" });
  }

  if (!["credit_note", "debit_note"].includes(noteType)) {
    return res.status(400).json({ msg: "noteType debe ser 'credit_note' o 'debit_note'" });
  }

  const transaction = await sequelize.transaction();

  try {
    const invoice = await Invoice.findByPk(invoice_id, { transaction });
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    if (invoice.status === "cancelled") {
      await transaction.rollback();
      return res.status(400).json({ msg: "No se puede ajustar una factura cancelada" });
    }

    if (noteType === "credit_note") {
      // Saldo de crédito disponible: total de la factura menos notas de crédito activas ya emitidas
      const existingCredits = await CreditDebitNote.sum("amount", {
        where: { invoice_id, noteType: "credit_note", status: "active" },
        transaction,
      });
      const availableCredit = parseFloat(invoice.total) - (existingCredits || 0);

      if (parseFloat(amount) > availableCredit) {
        await transaction.rollback();
        return res.status(400).json({
          msg: `El monto excede el saldo disponible para nota de crédito ($${availableCredit.toFixed(2)})`,
        });
      }
    }

    const ncfType = noteType === "credit_note" ? "04" : "03";
    const { ncf, ncfSequenceId } = await ncfService.getNextNcf(ncfType, transaction);

    const note = await CreditDebitNote.create(
      {
        noteType,
        ncfType,
        ncf,
        ncfSequence_id: ncfSequenceId,
        invoice_id,
        customer_id: invoice.customer_id,
        user_id: user.id,
        amount,
        reason,
      },
      { transaction }
    );

    // Recalcular estado de la factura original si es nota de crédito total
    if (noteType === "credit_note") {
      const totalCredited = await CreditDebitNote.sum("amount", {
        where: { invoice_id, noteType: "credit_note", status: "active" },
        transaction,
      });

      if (totalCredited >= parseFloat(invoice.total)) {
        await invoice.update({ status: "credited" }, { transaction });
      }
    }

    await transaction.commit();

    await createNotification(
      user.id,
      noteType === "credit_note" ? "📝 Nota de Crédito Emitida" : "📝 Nota de Débito Emitida",
      `${ncf} por $${parseFloat(amount).toFixed(2)} sobre factura ${invoice.invoiceNumber}`,
      "info",
      note.id,
      "credit_debit_note"
    );

    res.status(201).json(note);
  } catch (err) {
    await transaction.rollback();
    if (err.name === "NcfLimitError") {
      return res.status(400).json({ msg: err.message });
    }
    console.error("Error al crear nota de crédito/débito:", err);
    res.status(500).json({ msg: "Error al crear nota de crédito/débito" });
  }
};
