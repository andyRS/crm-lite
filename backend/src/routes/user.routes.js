const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estadísticas de usuarios (solo admin)
router.get('/stats', userController.getUserStats);

// Obtener todos los usuarios (solo admin)
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID
router.get('/:id', userController.getUserById);

// Crear usuario (solo admin)
router.post('/', userController.createUser);

// Actualizar usuario
router.put('/:id', userController.updateUser);

// Cambiar contraseña
router.put('/:id/password', userController.changePassword);

// Solicitar eliminación (users requieren autorización)
router.delete('/:id/request', userController.requestDeleteUser);

// Eliminar usuario (solo admin)
router.delete('/:id', userController.deleteUser);

module.exports = router;
