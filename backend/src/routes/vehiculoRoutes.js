
const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/vehiculoController');
const validar = require('../middlewares/validar');

const reglas = [
    body('marca').trim().notEmpty().withMessage('La marca es obligatoria.'),
    body('modelo').trim().notEmpty().withMessage('El modelo es obligatorio.'),
    body('patente').trim().notEmpty().withMessage('La patente es obligatoria.').isLength({ max: 15 }),
    body('anio').isInt({ min: 1900, max: 2100 }).withMessage('El año no es válido.'),
    body('capacidad_carga').isFloat({ min: 0.01 }).withMessage('La capacidad debe ser mayor a cero.')
];

router.get('/', [], validar, controller.listar);
router.post('/', reglas, validar, controller.crear);
router.put('/:id', [param('id').isInt({ min: 1 }), ...reglas], validar, controller.actualizar);
router.delete('/:id', [param('id').isInt({ min: 1 }).withMessage('ID inválido.')], validar, controller.eliminar);

module.exports = router;
