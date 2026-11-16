
const API_URL = 'http://localhost:3000/api';

export async function api(ruta, opciones = {}) {
    const token = localStorage.getItem('token');
    const config = {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...opciones.headers
        }
    };

    const respuesta = await fetch(`${API_URL}${ruta}`, config);
    const datos = respuesta.status === 204 ? null : await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos?.mensaje || datos?.errores?.join(', ') || 'Ocurrió un error.');
    }
    return datos;
}
