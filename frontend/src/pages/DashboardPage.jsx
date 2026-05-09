import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const [hora, setHora] = useState(new Date())
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [historial, setHistorial] = useState([])
  const [doctor, setDoctor] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const intervalo = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    cargarDoctor()
    cargarHistorial()
  }, [])

  const cargarDoctor = async () => {
    try {
      const response = await fetch('https://dental-attendance-production.up.railway.app/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.doctor_id) {
        const res = await fetch(`https://dental-attendance-production.up.railway.app/doctors/${data.doctor_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const doctorData = await res.json()
        setDoctor(doctorData)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const cargarHistorial = async () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const doctorId = payload.doctor_id
      if (!doctorId) return
      const response = await fetch(`https://dental-attendance-production.up.railway.app/attendance/doctor/${doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setHistorial(data.slice(0, 5))
    } catch (err) {
      console.error(err)
    }
  }

  const registrar = async (tipo) => {
    setLoading(true)
    setMensaje('')
    setError('')
    try {
      const response = await fetch('https://dental-attendance-production.up.railway.app/attendance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tipo })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Error al registrar')
      setMensaje(`${tipo === 'entrada' ? '✅ Entrada' : '🔴 Salida'} registrada correctamente`)
      cargarHistorial()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const formatearHora = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-CL')
  }
  const getRolFromToken = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.rol
    } catch {
      return null
    }
  }

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
          {/* LOGO — reemplazar src con la ruta del logo real */}
        <img
          src="/logo.png"
          alt="Logo clínica"
          onError={e => e.target.style.display = 'none'}
          style={{ display: 'block', margin: '0 auto 16px', height: '80px', objectFit: 'contain' }}
        />

        {/* NOMBRE — reemplazar con el nombre real de la clínica */}
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#1a202c' }}>
          Clínica Dental
        </h1>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '32px' }}>
          Sistema de asistencia
        </p>
          {doctor && (
            <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '15px' }}>
              Bienvenido, <strong>{doctor.nombre} {doctor.apellido}</strong> — {doctor.especialidad}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {getRolFromToken() === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
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
              Panel Admin
            </button>
          )}
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

      {/* Reloj */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
      }}>
        <p style={{ color: '#718096', marginBottom: '8px', fontSize: '16px' }}>
          {hora.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h2 style={{ fontSize: '64px', fontWeight: 'bold', color: '#1a202c', margin: '0 0 32px 0' }}>
          {hora.toLocaleTimeString('es-CL')}
        </h2>

        {mensaje && (
          <div style={{
            backgroundColor: '#f0fff4',
            border: '1px solid #9ae6b4',
            color: '#276749',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '15px'
          }}>
            {mensaje}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #feb2b2',
            color: '#c53030',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '15px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => registrar('entrada')}
            disabled={loading}
            style={{
              padding: '16px 40px',
              backgroundColor: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            Registrar Entrada
          </button>
          <button
            onClick={() => registrar('salida')}
            disabled={loading}
            style={{
              padding: '16px 40px',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            Registrar Salida
          </button>
        </div>
      </div>

      {/* Historial */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#1a202c', marginTop: 0, marginBottom: '16px' }}>
          Últimos registros
        </h3>
        {historial.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center' }}>No hay registros aún</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Fecha y hora</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Doctor</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(registro => (
                <tr key={registro.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
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
                  <td style={{ padding: '10px 8px', color: '#4a5568' }}>
                    {formatearHora(registro.timestamp)}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#4a5568' }}>
                    {doctor ? `${doctor.nombre} ${doctor.apellido}` : `ID: ${registro.doctor_id}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}