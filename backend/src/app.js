
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const verificarToken = require('./middlewares/auth');

const authRoutes = require('./routes/authRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const conductorRoutes = require('./routes/conductorRoutes');
const viajeRoutes = require('./routes/viajeRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/api', (req, res) => res.json({ mensaje: 'API de Gestión de Transporte funcionando.' }));
app.use('/api/auth', authRoutes);

app.use('/api/vehiculos', verificarToken, vehiculoRoutes);
app.use('/api/conductores', verificarToken, conductorRoutes);
app.use('/api/viajes', verificarToken, viajeRoutes);

app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada.' }));

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

module.exports = app;
