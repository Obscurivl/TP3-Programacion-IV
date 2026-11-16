
const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/conductorController');
const validar = require('../middlewares/validar');

const reglas = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio.'),
    body('numero_documento').trim().notEmpty().withMessage('El documento es obligatorio.'),
    body('numero_licencia').trim().notEmpty().withMessage('La licencia es obligatoria.'),
    body('fecha_alta_licencia').isDate().withMessage('La fecha de alta no es válida.'),
    body('fecha_vencimiento_licencia').isDate().withMessage('La fecha de vencimiento no es válida.')
];

router.get('/', [], validar, controller.listar);
router.post('/', reglas, validar, controller.crear);
router.put('/:id', [param('id').isInt({ min: 1 }), ...reglas], validar, controller.actualizar);
router.delete('/:id', [param('id').isInt({ min: 1 }).withMessage('ID inválido.')], validar, controller.eliminar);

module.exports = router;
