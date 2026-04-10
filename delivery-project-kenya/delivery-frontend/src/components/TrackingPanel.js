function TrackingPanel() {
  return (
    <div style={{width:"100%", padding: '24px', background: 'var(--bg-card)', borderRadius: '15px', boxShadow: 'var(--soft-shadow)', border: '1px solid var(--border-color)'}}>
      <h3 style={{marginTop: 0, fontSize: '18px', color: 'var(--text-primary)'}}>Live Tracking</h3>
      <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}><b style={{color: 'var(--text-primary)'}}>Tracking ID:</b> #TS4562</p>

      <ul style={{color: 'var(--text-secondary)', paddingLeft: '20px', fontSize: '15px', lineHeight: '2'}}>
        <li style={{color: 'var(--text-muted)'}}>Checking</li>
        <li style={{color: 'var(--primary)', fontWeight: 700}}>In Transit</li>
        <li>Out for Delivery</li>
      </ul>

      <button style={{marginTop: '20px', padding: '10px 24px', borderRadius: '30px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600}}>
        New Shipping
      </button>
    </div>
  );
}

export default TrackingPanel;