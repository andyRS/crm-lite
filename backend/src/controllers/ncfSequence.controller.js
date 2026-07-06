const ncfService = require("../services/ncf.service");
const { NcfSequence } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const sequences = await NcfSequence.findAll({ order: [["ncfType", "ASC"]] });
    res.json(sequences);
  } catch (err) {
    console.error("Error al listar secuencias NCF:", err);
    res.status(500).json({ msg: "Error al listar secuencias NCF" });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const status = await ncfService.getSequenceStatus();
    res.json(status);
  } catch (err) {
    console.error("Error al obtener estado de secuencias NCF:", err);
    res.status(500).json({ msg: "Error al obtener estado de secuencias NCF" });
  }
};

exports.create = async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Solo un administrador puede configurar secuencias NCF" });
    }

    const sequence = await ncfService.createSequence(req.body);
    res.status(201).json(sequence);
  } catch (err) {
    if (err.name === "NcfLimitError") {
      return res.status(400).json({ msg: err.message });
    }
    console.error("Error al crear secuencia NCF:", err);
    res.status(500).json({ msg: "Error al crear secuencia NCF" });
  }
};

exports.update = async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Solo un administrador puede configurar secuencias NCF" });
    }

    const sequence = await ncfService.updateSequence(req.params.id, req.body);
    res.json(sequence);
  } catch (err) {
    if (err.name === "NcfLimitError") {
      return res.status(400).json({ msg: err.message });
    }
    console.error("Error al actualizar secuencia NCF:", err);
    res.status(500).json({ msg: "Error al actualizar secuencia NCF" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Solo un administrador puede configurar secuencias NCF" });
    }

    await ncfService.deleteSequence(req.params.id);
    res.json({ msg: "Secuencia eliminada" });
  } catch (err) {
    if (err.name === "NcfLimitError") {
      return res.status(400).json({ msg: err.message });
    }
    console.error("Error al eliminar secuencia NCF:", err);
    res.status(500).json({ msg: "Error al eliminar secuencia NCF" });
  }
};
