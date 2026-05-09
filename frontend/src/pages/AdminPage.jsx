import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPage() {
  const [doctores, setDoctores] = useState([])
  const [registros, setRegistros] = useState([])
  const [filtroDoctor, setFiltroDoctor] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [vistaActiva, setVistaActiva] = useState('registros')
  const [loading, setLoading] = useState(false)
  const [mostrarFormDoctor, setMostrarFormDoctor] = useState(false)
  const [nuevoDoctor, setNuevoDoctor] = useState({
    nombre: '', apellido: '', email: '', especialidad: '', telefono: ''
  })
  const [mensajeDoctor, setMensajeDoctor] = useState('')
  const [errorDoctor, setErrorDoctor] = useState('')
  const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '', password: '', rol: 'doctor', doctor_id: ''
  })
  const [mensajeUsuario, setMensajeUsuario] = useState('')
  const [errorUsuario, setErrorUsuario] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    cargarDoctores()
    cargarRegistros()
  }, [])

  const cargarDoctores = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/doctors/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setDoctores(data)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarRegistros = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/attendance/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setRegistros(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const getNombreDoctor = (doctor_id) => {
    const doctor = doctores.find(d => d.id === doctor_id)
    return doctor ? `${doctor.nombre} ${doctor.apellido}` : `ID: ${doctor_id}`
  }

  const formatearHora = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-CL')
  }

  const registrosFiltrados = registros.filter(r => {
    const coincideDoctor = filtroDoctor ? r.doctor_id === parseInt(filtroDoctor) : true
    const coincideFecha = filtroFecha
      ? new Date(r.timestamp).toISOString().slice(0, 10) === filtroFecha
      : true
    return coincideDoctor && coincideFecha
  })

  const doctoresPresentes = doctores.filter(doctor => {
    const registrosDoctor = registros.filter(r => r.doctor_id === doctor.id)
    if (registrosDoctor.length === 0) return false
    const ultimo = registrosDoctor[0]
    return ultimo.tipo === 'entrada'
  })

  const exportarCSV = () => {
    const filas = [
      ['ID', 'Doctor', 'Tipo', 'Fecha y hora', 'Observación'],
      ...registrosFiltrados.map(r => [
        r.id,
        getNombreDoctor(r.doctor_id),
        r.tipo,
        formatearHora(r.timestamp),
        r.observacion || ''
      ])
    ]
    const csv = filas.map(f => f.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia_${new Date().toLocaleDateString('es-CL')}.csv`
    a.click()
  }

  const crearDoctor = async () => {
    setMensajeDoctor('')
    setErrorDoctor('')
    try {
      const res = await fetch('http://127.0.0.1:8000/doctors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoDoctor)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al crear doctor')
      setMensajeDoctor(`Doctor ${data.nombre} ${data.apellido} creado correctamente`)
      setNuevoDoctor({ nombre: '', apellido: '', email: '', especialidad: '', telefono: '' })
      setMostrarFormDoctor(false)
      cargarDoctores()
    } catch (err) {
      setErrorDoctor(err.message)
    }
  }

  const crearUsuario = async () => {
    setMensajeUsuario('')
    setErrorUsuario('')
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: nuevoUsuario.email,
          password: nuevoUsuario.password,
          rol: nuevoUsuario.rol,
          doctor_id: nuevoUsuario.doctor_id ? parseInt(nuevoUsuario.doctor_id) : null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al crear usuario')
      setMensajeUsuario(`Usuario ${data.email} creado correctamente`)
      setNuevoUsuario({ email: '', password: '', rol: 'doctor', doctor_id: '' })
    } catch (err) {
      setErrorUsuario(err.message)
    }
  }

  const estiloTab = (tab) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: vistaActiva === tab ? '#3182ce' : '#e2e8f0',
    color: vistaActiva === tab ? 'white' : '#4a5568'
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ color: '#1a202c', margin: 0 }}>Panel de Administración</h1>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '14px' }}>
            Clínica Dental
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={cerrarSesion}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ color: '#718096', margin: '0 0 8px 0', fontSize: '14px' }}>Total doctores</p>
          <h2 style={{ color: '#1a202c', margin: 0, fontSize: '36px' }}>{doctores.length}</h2>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ color: '#718096', margin: '0 0 8px 0', fontSize: '14px' }}>Presentes ahora</p>
          <h2 style={{ color: '#38a169', margin: 0, fontSize: '36px' }}>{doctoresPresentes.length}</h2>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <p style={{ color: '#718096', margin: '0 0 8px 0', fontSize: '14px' }}>Registros totales</p>
          <h2 style={{ color: '#3182ce', margin: 0, fontSize: '36px' }}>{registros.length}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button style={estiloTab('registros')} onClick={() => setVistaActiva('registros')}>
          Registros de asistencia
        </button>
        <button style={estiloTab('doctores')} onClick={() => setVistaActiva('doctores')}>
          Doctores
        </button>
        <button style={estiloTab('presentes')} onClick={() => setVistaActiva('presentes')}>
          Presentes ahora
        </button>
        <button style={estiloTab('usuarios')} onClick={() => setVistaActiva('usuarios')}>
          Usuarios
        </button>
      </div>

      {/* Contenido */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
      }}>

        {/* Vista registros */}
        {vistaActiva === 'registros' && (
          <>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <select
                value={filtroDoctor}
                onChange={e => setFiltroDoctor(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#4a5568'
                }}
              >
                <option value="">Todos los doctores</option>
                {doctores.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} {d.apellido}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#4a5568'
                }}
              />

              <button
                onClick={() => { setFiltroDoctor(''); setFiltroFecha('') }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#4a5568'
                }}
              >
                Limpiar filtros
              </button>

              <button
                onClick={exportarCSV}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#38a169',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginLeft: 'auto'
                }}
              >
                Exportar CSV
              </button>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>Cargando...</p>
            ) : registrosFiltrados.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>No hay registros</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Doctor</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Tipo</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Fecha y hora</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map(registro => (
                    <tr key={registro.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 8px', color: '#1a202c', fontSize: '14px' }}>
                        {getNombreDoctor(registro.doctor_id)}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          backgroundColor: registro.tipo === 'entrada' ? '#f0fff4' : '#fff5f5',
                          color: registro.tipo === 'entrada' ? '#276749' : '#c53030'
                        }}>
                          {registro.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>
                        {formatearHora(registro.timestamp)}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>
                        {registro.observacion || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Vista doctores */}
        {vistaActiva === 'doctores' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={() => setMostrarFormDoctor(!mostrarFormDoctor)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {mostrarFormDoctor ? 'Cancelar' : '+ Nuevo doctor'}
              </button>
            </div>

            {mostrarFormDoctor && (
              <div style={{
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0, color: '#1a202c' }}>Nuevo doctor</h3>

                {mensajeDoctor && (
                  <div style={{
                    backgroundColor: '#f0fff4', border: '1px solid #9ae6b4',
                    color: '#276749', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '14px'
                  }}>{mensajeDoctor}</div>
                )}
                {errorDoctor && (
                  <div style={{
                    backgroundColor: '#fff5f5', border: '1px solid #feb2b2',
                    color: '#c53030', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '14px'
                  }}>{errorDoctor}</div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { campo: 'nombre', label: 'Nombre', placeholder: 'Juan' },
                    { campo: 'apellido', label: 'Apellido', placeholder: 'Pérez' },
                    { campo: 'email', label: 'Email', placeholder: 'juan@clinica.com' },
                    { campo: 'especialidad', label: 'Especialidad', placeholder: 'Odontología general' },
                    { campo: 'telefono', label: 'Teléfono', placeholder: '+56912345678' }
                  ].map(({ campo, label, placeholder }) => (
                    <div key={campo}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={nuevoDoctor[campo]}
                        onChange={e => setNuevoDoctor({ ...nuevoDoctor, [campo]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={crearDoctor}
                  style={{
                    marginTop: '16px',
                    padding: '10px 24px',
                    backgroundColor: '#38a169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Guardar doctor
                </button>
              </div>
            )}

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Especialidad</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Teléfono</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {doctores.map(doctor => (
                <tr key={doctor.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 8px', color: '#1a202c', fontSize: '14px', fontWeight: '500' }}>
                    {doctor.nombre} {doctor.apellido}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>
                    {doctor.email}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>
                    {doctor.especialidad}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#4a5568', fontSize: '14px' }}>
                    {doctor.telefono || '—'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      backgroundColor: doctor.activo ? '#f0fff4' : '#fff5f5',
                      color: doctor.activo ? '#276749' : '#c53030'
                    }}>
                      {doctor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}

        {/* Vista presentes */}
        {vistaActiva === 'presentes' && (
          <>
            <h3 style={{ color: '#1a202c', marginTop: 0 }}>
              Doctores presentes — {new Date().toLocaleDateString('es-CL')}
            </h3>
            {doctoresPresentes.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center' }}>No hay doctores presentes en este momento</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {doctoresPresentes.map(doctor => (
                  <div key={doctor.id} style={{
                    backgroundColor: '#f0fff4',
                    border: '1px solid #9ae6b4',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#38a169',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      marginBottom: '12px'
                    }}>
                      {doctor.nombre[0]}{doctor.apellido[0]}
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#1a202c' }}>
                      {doctor.nombre} {doctor.apellido}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#4a5568' }}>
                      {doctor.especialidad}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {/* Vista usuarios */}
        {vistaActiva === 'usuarios' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={() => setMostrarFormUsuario(!mostrarFormUsuario)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {mostrarFormUsuario ? 'Cancelar' : '+ Nuevo usuario'}
              </button>
            </div>

            {mostrarFormUsuario && (
              <div style={{
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0, color: '#1a202c' }}>Nuevo usuario</h3>

                {mensajeUsuario && (
                  <div style={{
                    backgroundColor: '#f0fff4', border: '1px solid #9ae6b4',
                    color: '#276749', padding: '10px', borderRadius: '8px',
                    marginBottom: '12px', fontSize: '14px'
                  }}>{mensajeUsuario}</div>
                )}
                {errorUsuario && (
                  <div style={{
                    backgroundColor: '#fff5f5', border: '1px solid #feb2b2',
                    color: '#c53030', padding: '10px', borderRadius: '8px',
                    marginBottom: '12px', fontSize: '14px'
                  }}>{errorUsuario}</div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="doctor@clinica.com"
                      value={nuevoUsuario.email}
                      onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                      Contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={nuevoUsuario.password}
                      onChange={e => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                      Rol
                    </label>
                    <select
                      value={nuevoUsuario.rol}
                      onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                      }}
                    >
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#4a5568' }}>
                      Doctor vinculado
                    </label>
                    <select
                      value={nuevoUsuario.doctor_id}
                      onChange={e => setNuevoUsuario({ ...nuevoUsuario, doctor_id: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Sin doctor asignado</option>
                      {doctores.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} {d.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={crearUsuario}
                  style={{
                    marginTop: '16px',
                    padding: '10px 24px',
                    backgroundColor: '#38a169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Guardar usuario
                </button>
              </div>
            )}

            <p style={{ color: '#718096', fontSize: '14px' }}>
              Los usuarios creados aquí podrán iniciar sesión con su email y contraseña. 
              Asegúrate de vincular cada usuario al doctor correspondiente.
            </p>
          </>
        )}
      </div>
    </div>
  )
}