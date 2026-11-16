
const router = require('express').Router();
const { body, param, query } = require('express-validator');
const controller = require('../controllers/viajeController');
const validar = require('../middlewares/validar');

router.get('/', [
    query('vehiculo_id').optional().isInt({ min: 1 }).withMessage('Vehículo inválido.'),
    query('conductor_id').optional().isInt({ min: 1 }).withMessage('Conductor inválido.')
], validar, controller.listar);

router.post('/', [
    body('vehiculo_id').isInt({ min: 1 }).withMessage('Seleccione un vehículo.'),
    body('conductor_id').isInt({ min: 1 }).withMessage('Seleccione un conductor.'),
    body('fecha_salida').isISO8601().withMessage('La fecha de salida no es válida.'),
    body('fecha_llegada').isISO8601().withMessage('La fecha de llegada no es válida.'),
    body('origen').trim().notEmpty().withMessage('El origen es obligatorio.'),
    body('destino').trim().notEmpty().withMessage('El destino es obligatorio.'),
    body('kilometros').isFloat({ min: 0.01 }).withMessage('Los kilómetros deben ser mayores a cero.')
], validar, controller.crear);

router.get('/kilometros/:tipo/:id', [
    param('tipo').isIn(['vehiculo', 'conductor']).withMessage('Tipo inválido.'),
    param('id').isInt({ min: 1 }).withMessage('ID inválido.')
], validar, controller.kilometros);

module.exports = router;
