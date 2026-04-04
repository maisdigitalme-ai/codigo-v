export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#E63946', margin: 0 }}>404</h1>
      <p style={{ color: '#999', marginTop: '1rem' }}>Página no encontrada</p>
      <a
        href="/dashboard"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: '#E63946',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
        }}
      >
        Volver al inicio
      </a>
    </div>
  );
}
