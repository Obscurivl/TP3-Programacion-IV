
const { validationResult } = require('express-validator');

function validar(req, res, next) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({
            mensaje: 'Hay datos incorrectos.',
            errores: errores.array().map(error => error.msg)
        });
    }
    next();
}

module.exports = validar;
