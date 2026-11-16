
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const opciones = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opciones, (payload, done) => {
    if (payload && payload.id) {
        return done(null, { id: payload.id, nombre: payload.nombre, email: payload.email });
    }
    return done(null, false);
}));

module.exports = passport;
