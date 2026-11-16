
const db = require('../config/database');

async function listar(req, res, next) {
    try {
        const [filas] = await db.query('SELECT * FROM vehiculos ORDER BY id DESC');
        res.json(filas);
    } catch (error) { next(error); }
}

async function crear(req, res, next) {
    try {
        const { marca, modelo, patente, anio, capacidad_carga } = req.body;
        const [r] = await db.query(
            'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
            [marca, modelo, patente.toUpperCase(), anio, capacidad_carga]
        );
        res.status(201).json({ mensaje: 'Vehículo registrado.', id: r.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ mensaje: 'La patente ya está registrada.' });
        next(error);
    }
}

async function actualizar(req, res, next) {
    try {
        const { marca, modelo, patente, anio, capacidad_carga } = req.body;
        const [r] = await db.query(
            'UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?',
            [marca, modelo, patente.toUpperCase(), anio, capacidad_carga, req.params.id]
        );
        if (!r.affectedRows) return res.status(404).json({ mensaje: 'Vehículo no encontrado.' });
        res.json({ mensaje: 'Vehículo actualizado.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ mensaje: 'La patente ya está registrada.' });
        next(error);
    }
}

async function eliminar(req, res, next) {
    try {
        const [r] = await db.query('DELETE FROM vehiculos WHERE id=?', [req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ mensaje: 'Vehículo no encontrado.' });
        res.json({ mensaje: 'Vehículo eliminado.' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(403).json({ mensaje: 'No se puede eliminar: el vehículo tiene viajes asociados.' });
        next(error);
    }
}

module.exports = { listar, crear, actualizar, eliminar };
