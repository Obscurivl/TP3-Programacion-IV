
const router = require('express').Router();
const { body } = require('express-validator');
const validar = require('../middlewares/validar');
const controller = require('../controllers/authController');

router.post('/registro', [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('email').isEmail().withMessage('Ingrese un email válido.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
], validar, controller.registrar);

router.post('/login', [
    body('email').isEmail().withMessage('Ingrese un email válido.').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.')
], validar, controller.iniciarSesion);

module.exports = router;
