function TestComponent() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#10b981',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      fontFamily: 'Inter, sans-serif',
      padding: '40px',
      boxSizing: 'border-box',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '40px' }}>✅ React is Rendering!</div>
      <div style={{ fontSize: '16px', color: '#0ea5e9' }}>
        If you see this message, React and CSS are working correctly.
      </div>
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#64748b' }}>
        MindTrace Application
      </div>
    </div>
  );
}

export default TestComponent;
