function Navbar() {
  return (
    <div style={{display:"flex", justifyContent:"space-between", padding: '20px 24px', background: 'var(--bg-card)', borderRadius: '15px', boxShadow: 'var(--soft-shadow)', marginBottom: '24px', alignItems: 'center'}}>
      <h3 style={{margin: 0, color: 'var(--primary)'}}>PRIME BASKET</h3>
      <div style={{fontWeight: 600, color: 'var(--text-secondary)'}}>
        <span style={{marginRight:24, cursor: 'pointer', transition: 'color 0.2s'}} className="hover-primary">Dashboard</span>
        <span style={{marginRight:24, cursor: 'pointer', color: 'var(--primary)'}}>Shipping</span>
        <span style={{cursor: 'pointer', transition: 'color 0.2s'}} className="hover-primary">Tracking</span>
      </div>
    </div>
  );
}

export default Navbar;