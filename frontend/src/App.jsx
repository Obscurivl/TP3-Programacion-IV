
import { useEffect, useState } from 'react';
import { api } from './api';

const vacioVehiculo = { marca: '', modelo: '', patente: '', anio: '', capacidad_carga: '' };
const vacioConductor = {
    nombre: '', apellido: '', numero_documento: '', numero_licencia: '',
    fecha_alta_licencia: '', fecha_vencimiento_licencia: ''
};
const vacioViaje = {
    vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '',
    origen: '', destino: '', kilometros: '', observaciones: ''
};

export default function App() {
    const [usuario, setUsuario] = useState(() => {
        const guardado = localStorage.getItem('usuario');
        return guardado ? JSON.parse(guardado) : null;
    });
    const [pantalla, setPantalla] = useState('inicio');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [vehiculos, setVehiculos] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [viajes, setViajes] = useState([]);
    const [vehiculoForm, setVehiculoForm] = useState(vacioVehiculo);
    const [conductorForm, setConductorForm] = useState(vacioConductor);
    const [viajeForm, setViajeForm] = useState(vacioViaje);
    const [editVehiculo, setEditVehiculo] = useState(null);
    const [editConductor, setEditConductor] = useState(null);
    const [filtroVehiculo, setFiltroVehiculo] = useState('');
    const [filtroConductor, setFiltroConductor] = useState('');
    const [total, setTotal] = useState(null);
    const [authForm, setAuthForm] = useState({ nombre: '', email: '', password: '' });

    function limpiarMensajes() { setMensaje(''); setError(''); }

    async function cargarDatos() {
        try {
            const [v, c, t] = await Promise.all([
                api('/vehiculos'), api('/conductores'), api('/viajes')
            ]);
            setVehiculos(v); setConductores(c); setViajes(t);
        } catch (e) { setError(e.message); }
    }

    useEffect(() => {
        if (usuario) cargarDatos();
    }, [usuario]);

    async function enviarAuth(e, registro) {
        e.preventDefault(); limpiarMensajes();
        if (!authForm.email || !authForm.password || (registro && !authForm.nombre)) {
            setError('Complete todos los campos.'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authForm.email)) {
            setError('Ingrese un email válido.'); return;
        }
        if (authForm.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.'); return;
        }
        try {
            const datos = await api(registro ? '/auth/registro' : '/auth/login', {
                method: 'POST', body: JSON.stringify(authForm)
            });
            if (registro) {
                setMensaje('Cuenta creada. Ahora puede iniciar sesión.');
                setPantalla('login');
            } else {
                localStorage.setItem('token', datos.token);
                localStorage.setItem('usuario', JSON.stringify(datos.usuario));
                setUsuario(datos.usuario); setPantalla('vehiculos');
            }
        } catch (e) { setError(e.message); }
    }

    function cerrarSesion() {
        localStorage.removeItem('token'); localStorage.removeItem('usuario');
        setUsuario(null); setPantalla('inicio'); setTotal(null);
    }

    async function guardarVehiculo(e) {
        e.preventDefault(); limpiarMensajes();
        const { marca, modelo, patente, anio, capacidad_carga } = vehiculoForm;
        if (!marca.trim() || !modelo.trim() || !patente.trim() || !anio || Number(capacidad_carga) <= 0) {
            setError('Complete los campos. La capacidad debe ser mayor a cero.'); return;
        }
        if (!Number.isInteger(Number(anio)) || Number(anio) < 1900 || Number(anio) > 2100) {
            setError('Ingrese un año válido.'); return;
        }
        try {
            await api(editVehiculo ? `/vehiculos/${editVehiculo}` : '/vehiculos', {
                method: editVehiculo ? 'PUT' : 'POST', body: JSON.stringify(vehiculoForm)
            });
            setMensaje('Vehículo guardado correctamente.');
            setVehiculoForm(vacioVehiculo); setEditVehiculo(null); cargarDatos();
        } catch (e) { setError(e.message); }
    }

    function prepararVehiculo(v) {
        setEditVehiculo(v.id);
        setVehiculoForm({
            marca: v.marca, modelo: v.modelo, patente: v.patente,
            anio: v.anio, capacidad_carga: v.capacidad_carga
        });
        setPantalla('vehiculos');
    }

    async function borrarVehiculo(id) {
        if (!confirm('¿Está seguro de eliminar este vehículo?')) return;
        try { await api(`/vehiculos/${id}`, { method: 'DELETE' }); setMensaje('Vehículo eliminado.'); cargarDatos(); }
        catch (e) { setError(e.message); }
    }

    async function guardarConductor(e) {
        e.preventDefault(); limpiarMensajes();
        const f = conductorForm;
        if (Object.values(f).some(x => !String(x).trim())) { setError('Complete todos los campos.'); return; }
        if (f.fecha_vencimiento_licencia < f.fecha_alta_licencia) {
            setError('El vencimiento no puede ser anterior al alta de la licencia.'); return;
        }
        try {
            await api(editConductor ? `/conductores/${editConductor}` : '/conductores', {
                method: editConductor ? 'PUT' : 'POST', body: JSON.stringify(f)
            });
            setMensaje('Conductor guardado correctamente.');
            setConductorForm(vacioConductor); setEditConductor(null); cargarDatos();
        } catch (e) { setError(e.message); }
    }

    function prepararConductor(c) {
        setEditConductor(c.id);
        setConductorForm({
            nombre: c.nombre, apellido: c.apellido, numero_documento: c.numero_documento,
            numero_licencia: c.numero_licencia,
            fecha_alta_licencia: String(c.fecha_alta_licencia).slice(0, 10),
            fecha_vencimiento_licencia: String(c.fecha_vencimiento_licencia).slice(0, 10)
        });
        setPantalla('conductores');
    }

    async function borrarConductor(id) {
        if (!confirm('¿Está seguro de eliminar este conductor?')) return;
        try { await api(`/conductores/${id}`, { method: 'DELETE' }); setMensaje('Conductor eliminado.'); cargarDatos(); }
        catch (e) { setError(e.message); }
    }

    async function guardarViaje(e) {
        e.preventDefault(); limpiarMensajes();
        if (Object.entries(viajeForm).some(([k, v]) => k !== 'observaciones' && !String(v).trim())) {
            setError('Complete los campos obligatorios.'); return;
        }
        if (Number(viajeForm.kilometros) <= 0) { setError('Los kilómetros deben ser mayores a cero.'); return; }
        if (new Date(viajeForm.fecha_llegada) < new Date(viajeForm.fecha_salida)) {
            setError('La llegada no puede ser anterior a la salida.'); return;
        }
        try {
            await api('/viajes', { method: 'POST', body: JSON.stringify(viajeForm) });
            setMensaje('Viaje registrado correctamente.'); setViajeForm(vacioViaje); cargarDatos();
        } catch (e) { setError(e.message); }
    }

    async function filtrarViajes() {
        limpiarMensajes();
        try {
            const params = new URLSearchParams();
            if (filtroVehiculo) params.set('vehiculo_id', filtroVehiculo);
            if (filtroConductor) params.set('conductor_id', filtroConductor);
            setViajes(await api(`/viajes?${params.toString()}`));
            setTotal(null);
        } catch (e) { setError(e.message); }
    }

    async function consultarTotal(tipo, id) {
        limpiarMensajes();
        try { setTotal(await api(`/viajes/kilometros/${tipo}/${id}`)); }
        catch (e) { setError(e.message); }
    }

    const campo = (label, name, value, setter, type = 'text', required = true) => (
        <label>{label}
            <input type={type} value={value} required={required}
                onChange={e => setter(prev => ({ ...prev, [name]: e.target.value }))} />
        </label>
    );

    function tablaVacia(texto) { return <p className="vacio">{texto}</p>; }

    return (
        <div className="app">
            <header className="topbar">
                <div className="marca">Gestión de Transporte</div>
                {usuario ? <nav>
                    <button onClick={() => setPantalla('vehiculos')}>Vehículos</button>
                    <button onClick={() => setPantalla('conductores')}>Conductores</button>
                    <button onClick={() => setPantalla('viajes')}>Viajes</button>
                    <span className="saludo">Hola, {usuario.nombre}</span>
                    <button className="salir" onClick={cerrarSesion}>Cerrar sesión</button>
                </nav> : <nav>
                    <button onClick={() => setPantalla('inicio')}>Inicio</button>
                    <button onClick={() => setPantalla('login')}>Iniciar sesión</button>
                    <button className="primario chico" onClick={() => setPantalla('registro')}>Crear cuenta</button>
                </nav>}
            </header>

            <main className="contenedor">
                {mensaje && <div className="alerta exito">{mensaje}</div>}
                {error && <div className="alerta error">{error}</div>}

                {!usuario && pantalla === 'inicio' && <section className="bienvenida">
                    <p className="etiqueta">SISTEMA DE ADMINISTRACIÓN</p>
                    <h1>Organizá tu flota de transporte.</h1>
                    <p>Administrá vehículos, conductores y viajes desde un solo lugar.</p>
                    <button className="primario" onClick={() => setPantalla('login')}>Ingresar al sistema</button>
                </section>}

                {!usuario && (pantalla === 'login' || pantalla === 'registro') && <section className="panel auth">
                    <h1>{pantalla === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
                    <form onSubmit={e => enviarAuth(e, pantalla === 'registro')}>
                        {pantalla === 'registro' && <label>Nombre
                            <input value={authForm.nombre} onChange={e => setAuthForm({ ...authForm, nombre: e.target.value })} required />
                        </label>}
                        <label>Email
                            <input type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
                        </label>
                        <label>Contraseña
                            <input type="password" minLength="6" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                        </label>
                        <button className="primario" type="submit">{pantalla === 'login' ? 'Ingresar' : 'Registrarme'}</button>
                    </form>
                    <p className="ayuda">{pantalla === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
                        <button className="link" onClick={() => { limpiarMensajes(); setPantalla(pantalla === 'login' ? 'registro' : 'login'); }}>
                            {pantalla === 'login' ? 'Crear una cuenta' : 'Iniciar sesión'}
                        </button>
                    </p>
                </section>}

                {usuario && pantalla === 'vehiculos' && <section>
                    <div className="encabezado"><div><p className="etiqueta">FLOTA</p><h1>Vehículos</h1><p>Alta, modificación y eliminación de vehículos.</p></div></div>
                    <div className="dos-columnas">
                        <form className="panel formulario" onSubmit={guardarVehiculo}>
                            <h2>{editVehiculo ? 'Modificar vehículo' : 'Nuevo vehículo'}</h2>
                            {campo('Marca', 'marca', vehiculoForm.marca, setVehiculoForm)}
                            {campo('Modelo', 'modelo', vehiculoForm.modelo, setVehiculoForm)}
                            {campo('Patente', 'patente', vehiculoForm.patente, setVehiculoForm)}
                            {campo('Año', 'anio', vehiculoForm.anio, setVehiculoForm, 'number')}
                            {campo('Capacidad de carga (kg)', 'capacidad_carga', vehiculoForm.capacidad_carga, setVehiculoForm, 'number')}
                            <div className="acciones">
                                <button className="primario" type="submit">Guardar</button>
                                <button type="button" onClick={() => { setVehiculoForm(vacioVehiculo); setEditVehiculo(null); }}>Limpiar</button>
                            </div>
                        </form>
                        <div className="panel listado">
                            <h2>Listado de vehículos</h2>
                            {vehiculos.length ? <div className="tabla-scroll"><table><thead><tr><th>Patente</th><th>Vehículo</th><th>Año</th><th>Capacidad</th><th>Acciones</th></tr></thead>
                                <tbody>{vehiculos.map(v => <tr key={v.id}><td>{v.patente}</td><td>{v.marca} {v.modelo}</td><td>{v.anio}</td><td>{v.capacidad_carga} kg</td>
                                    <td className="acciones-tabla"><button onClick={() => prepararVehiculo(v)}>Editar</button><button className="peligro" onClick={() => borrarVehiculo(v.id)}>Eliminar</button></td></tr>)}</tbody></table></div> : tablaVacia('Todavía no hay vehículos registrados.')}
                        </div>
                    </div>
                </section>}

                {usuario && pantalla === 'conductores' && <section>
                    <div className="encabezado"><div><p className="etiqueta">PERSONAL</p><h1>Conductores</h1><p>Administración de datos y licencias.</p></div></div>
                    <div className="dos-columnas">
                        <form className="panel formulario" onSubmit={guardarConductor}>
                            <h2>{editConductor ? 'Modificar conductor' : 'Nuevo conductor'}</h2>
                            {campo('Nombre', 'nombre', conductorForm.nombre, setConductorForm)}
                            {campo('Apellido', 'apellido', conductorForm.apellido, setConductorForm)}
                            {campo('Número de documento', 'numero_documento', conductorForm.numero_documento, setConductorForm)}
                            {campo('Número de licencia', 'numero_licencia', conductorForm.numero_licencia, setConductorForm)}
                            {campo('Fecha de alta de licencia', 'fecha_alta_licencia', conductorForm.fecha_alta_licencia, setConductorForm, 'date')}
                            {campo('Fecha de vencimiento de licencia', 'fecha_vencimiento_licencia', conductorForm.fecha_vencimiento_licencia, setConductorForm, 'date')}
                            <div className="acciones"><button className="primario" type="submit">Guardar</button>
                                <button type="button" onClick={() => { setConductorForm(vacioConductor); setEditConductor(null); }}>Limpiar</button></div>
                        </form>
                        <div className="panel listado">
                            <h2>Listado de conductores</h2>
                            {conductores.length ? <div className="tabla-scroll"><table><thead><tr><th>Conductor</th><th>Documento</th><th>Licencia</th><th>Vencimiento</th><th>Acciones</th></tr></thead>
                                <tbody>{conductores.map(c => <tr key={c.id}><td>{c.nombre} {c.apellido}</td><td>{c.numero_documento}</td><td>{c.numero_licencia}</td><td>{String(c.fecha_vencimiento_licencia).slice(0,10)}</td>
                                    <td className="acciones-tabla"><button onClick={() => prepararConductor(c)}>Editar</button><button className="peligro" onClick={() => borrarConductor(c.id)}>Eliminar</button></td></tr>)}</tbody></table></div> : tablaVacia('Todavía no hay conductores registrados.')}
                        </div>
                    </div>
                </section>}

                {usuario && pantalla === 'viajes' && <section>
                    <div className="encabezado"><div><p className="etiqueta">RECORRIDOS</p><h1>Viajes</h1><p>Registrar recorridos y consultar historiales y kilómetros.</p></div></div>
                    <form className="panel formulario viaje-form" onSubmit={guardarViaje}>
                        <h2>Registrar viaje</h2>
                        <div className="rejilla-form">
                            <label>Vehículo<select value={viajeForm.vehiculo_id} onChange={e => setViajeForm({ ...viajeForm, vehiculo_id: e.target.value })} required>
                                <option value="">Seleccionar vehículo</option>{vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente} - {v.marca} {v.modelo}</option>)}</select></label>
                            <label>Conductor<select value={viajeForm.conductor_id} onChange={e => setViajeForm({ ...viajeForm, conductor_id: e.target.value })} required>
                                <option value="">Seleccionar conductor</option>{conductores.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</select></label>
                            {campo('Fecha y hora de salida', 'fecha_salida', viajeForm.fecha_salida, setViajeForm, 'datetime-local')}
                            {campo('Fecha y hora de llegada', 'fecha_llegada', viajeForm.fecha_llegada, setViajeForm, 'datetime-local')}
                            {campo('Origen', 'origen', viajeForm.origen, setViajeForm)}
                            {campo('Destino', 'destino', viajeForm.destino, setViajeForm)}
                            {campo('Kilómetros', 'kilometros', viajeForm.kilometros, setViajeForm, 'number')}
                            <label>Observaciones<textarea value={viajeForm.observaciones} onChange={e => setViajeForm({ ...viajeForm, observaciones: e.target.value })} /></label>
                        </div>
                        <button className="primario" type="submit">Registrar viaje</button>
                    </form>

                    <div className="panel listado historial">
                        <h2>Historial de viajes</h2>
                        <div className="filtros">
                            <label>Vehículo<select value={filtroVehiculo} onChange={e => setFiltroVehiculo(e.target.value)}><option value="">Todos</option>{vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}</select></label>
                            <label>Conductor<select value={filtroConductor} onChange={e => setFiltroConductor(e.target.value)}><option value="">Todos</option>{conductores.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</select></label>
                            <button className="primario" onClick={filtrarViajes}>Filtrar</button>
                            <button onClick={() => { setFiltroVehiculo(''); setFiltroConductor(''); cargarDatos(); }}>Limpiar filtro</button>
                        </div>
                        {viajes.length ? <div className="tabla-scroll"><table><thead><tr><th>Salida</th><th>Vehículo</th><th>Conductor</th><th>Recorrido</th><th>Km</th><th>Observaciones</th></tr></thead>
                            <tbody>{viajes.map(v => <tr key={v.id}><td>{String(v.fecha_salida).replace('T',' ').slice(0,16)}</td><td>{v.patente}</td><td>{v.conductor}</td><td>{v.origen} - {v.destino}</td><td>{v.kilometros}</td><td>{v.observaciones || '-'}</td></tr>)}</tbody></table></div> : tablaVacia('No hay viajes para mostrar.')}
                    </div>

                    <div className="panel listado">
                        <h2>Total de kilómetros recorridos</h2>
                        <div className="filtros">
                            <label>Vehículo<select id="totalVehiculo"><option value="">Seleccionar vehículo</option>{vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}</select></label>
                            <button onClick={() => { const id = document.getElementById('totalVehiculo').value; if (id) consultarTotal('vehiculo', id); else setError('Seleccione un vehículo.'); }}>Consultar por vehículo</button>
                            <label>Conductor<select id="totalConductor"><option value="">Seleccionar conductor</option>{conductores.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}</select></label>
                            <button onClick={() => { const id = document.getElementById('totalConductor').value; if (id) consultarTotal('conductor', id); else setError('Seleccione un conductor.'); }}>Consultar por conductor</button>
                        </div>
                        {total && <p className="resultado">Total recorrido: <strong>{total.total_kilometros} km</strong> ({total.tipo}, ID {total.id})</p>}
                    </div>
                </section>}
            </main>
            <footer>Trabajo Práctico N.º 3 · Programación IV</footer>
        </div>
    );
}
