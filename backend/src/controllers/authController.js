
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registrar(req, res, next) {
    try {
        const { nombre, email, password } = req.body;
        const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length) return res.status(400).json({ mensaje: 'Ya existe un usuario con ese email.' });

        const passwordHash = await bcrypt.hash(password, 10);
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, passwordHash]
        );
        res.status(201).json({ mensaje: 'Usuario registrado correctamente.', id: resultado.insertId });
    } catch (error) {
        next(error);
    }
}

async function iniciarSesion(req, res, next) {
    try {
        const { email, password } = req.body;
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (!usuarios.length) return res.status(401).json({ mensaje: 'Email o contraseña incorrectos.' });

        const usuario = usuarios[0];
        const coincide = await bcrypt.compare(password, usuario.password);
        if (!coincide) return res.status(401).json({ mensaje: 'Email o contraseña incorrectos.' });

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.json({
            mensaje: 'Inicio de sesión correcto.',
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { registrar, iniciarSesion };
