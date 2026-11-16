
const passport = require('../config/passport');

function verificarToken(req, res, next) {
    passport.authenticate('jwt', { session: false }, (error, usuario, info) => {
        if (error) return next(error);
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Token inválido o vencido. Inicie sesión.' });
        }
        req.user = usuario;
        next();
    })(req, res, next);
}

module.exports = verificarToken;
