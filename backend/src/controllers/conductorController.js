
const db = require('../config/database');

async function listar(req, res, next) {
    try {
        const [filas] = await db.query('SELECT * FROM conductores ORDER BY id DESC');
        res.json(filas);
    } catch (error) { next(error); }
}

async function crear(req, res, next) {
    try {
        const { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;
        const [r] = await db.query(
            `INSERT INTO conductores
            (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia]
        );
        res.status(201).json({ mensaje: 'Conductor registrado.', id: r.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ mensaje: 'El documento o la licencia ya están registrados.' });
        next(error);
    }
}

async function actualizar(req, res, next) {
    try {
        const { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;
        const [r] = await db.query(
            `UPDATE conductores SET nombre=?, apellido=?, numero_documento=?, numero_licencia=?,
            fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?`,
            [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia, req.params.id]
        );
        if (!r.affectedRows) return res.status(404).json({ mensaje: 'Conductor no encontrado.' });
        res.json({ mensaje: 'Conductor actualizado.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ mensaje: 'El documento o la licencia ya están registrados.' });
        next(error);
    }
}

async function eliminar(req, res, next) {
    try {
        const [r] = await db.query('DELETE FROM conductores WHERE id=?', [req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ mensaje: 'Conductor no encontrado.' });
        res.json({ mensaje: 'Conductor eliminado.' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(403).json({ mensaje: 'No se puede eliminar: el conductor tiene viajes asociados.' });
        next(error);
    }
}

module.exports = { listar, crear, actualizar, eliminar };
