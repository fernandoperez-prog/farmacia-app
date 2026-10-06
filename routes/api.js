const express = require('express');
const { TipoMedic, Medicamento, User } = require('../models');
const { requireLoginApi, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireLoginApi);

const puedeEscribir = requireRole('admin', 'moderator'); // crear / editar
const soloAdmin = requireRole('admin');                   // eliminar

// Genera un CRUD genérico para un modelo
function crud(path, Model, opciones = {}) {
  const { include, orden } = opciones;

  router.get(path, async (req, res) => {
    try { res.json(await Model.findAll({ include, order: orden })); }
    catch (e) { res.status(500).json({ message: e.message }); }
  });

  router.get(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id, { include });
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      res.json(item);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

  router.post(path, puedeEscribir, async (req, res) => {
    try { res.status(201).json(await Model.create(req.body)); }
    catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.put(`${path}/:id`, puedeEscribir, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      await item.update(req.body);
      res.json(item);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.delete(`${path}/:id`, soloAdmin, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      await item.destroy();
      res.json({ message: 'Eliminado' });
    } catch (e) {
      res.status(400).json({ message: 'No se puede eliminar: tiene registros relacionados' });
    }
  });
}

crud('/tipos', TipoMedic, { orden: [['CodTipoMed', 'ASC']] });
crud('/medicamentos', Medicamento, { include: [TipoMedic], orden: [['CodMedicamento', 'ASC']] });

// Usuarios (solo lectura/eliminación para el administrador)
router.get('/usuarios', soloAdmin, async (req, res) => {
  res.json(await User.findAll({ attributes: ['id', 'username', 'email', 'role', 'createdAt'] }));
});
router.delete('/usuarios/:id', soloAdmin, async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Usuario eliminado' });
});

module.exports = router;
