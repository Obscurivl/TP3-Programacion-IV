
const db = require('../config/database');

async function listar(req, res, next) {
    try {
        let sql = `SELECT v.*, ve.patente, ve.marca, ve.modelo,
                   CONCAT(c.nombre, ' ', c.apellido) AS conductor
                   FROM viajes v
                   INNER JOIN vehiculos ve ON ve.id = v.vehiculo_id
                   INNER JOIN conductores c ON c.id = v.conductor_id`;
        const condiciones = [];
        const valores = [];
        if (req.query.vehiculo_id) { condiciones.push('v.vehiculo_id = ?'); valores.push(req.query.vehiculo_id); }
        if (req.query.conductor_id) { condiciones.push('v.conductor_id = ?'); valores.push(req.query.conductor_id); }
        if (condiciones.length) sql += ' WHERE ' + condiciones.join(' AND ');
        sql += ' ORDER BY v.fecha_salida DESC';
        const [filas] = await db.query(sql, valores);
        res.json(filas);
    } catch (error) { next(error); }
}

async function crear(req, res, next) {
    try {
        const { vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones } = req.body;
        if (new Date(fecha_llegada) < new Date(fecha_salida)) {
            return res.status(400).json({ mensaje: 'La fecha de llegada no puede ser anterior a la salida.' });
        }
        const [r] = await db.query(
            `INSERT INTO viajes
            (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones || null]
        );
        res.status(201).json({ mensaje: 'Viaje registrado.', id: r.insertId });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ mensaje: 'El vehículo o conductor seleccionado no existe.' });
        next(error);
    }
}

async function kilometros(req, res, next) {
    try {
        const tipo = req.params.tipo;
        if (!['vehiculo', 'conductor'].includes(tipo)) return res.status(400).json({ mensaje: 'Tipo de consulta inválido.' });
        const campo = tipo === 'vehiculo' ? 'vehiculo_id' : 'conductor_id';
        const [filas] = await db.query(
            `SELECT ${campo} AS id, COALESCE(SUM(kilometros), 0) AS total_kilometros
             FROM viajes WHERE ${campo} = ? GROUP BY ${campo}`,
            [req.params.id]
        );
        res.json({ tipo, id: Number(req.params.id), total_kilometros: filas.length ? Number(filas[0].total_kilometros) : 0 });
    } catch (error) { next(error); }
}

module.exports = { listar, crear, kilometros };
