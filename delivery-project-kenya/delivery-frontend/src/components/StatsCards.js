function StatsCards() {
  return (
    <div style={{display:"flex", gap:"15px",padding:"10px"}}>
      
      <div className="card">
        <h4>Total Shipping</h4>
        <h2>248</h2>
      </div>

      <div className="card">
        <h4>Pending Package</h4>
        <h2>64</h2>
      </div>

      <div className="card">
        <h4>Delivery Shipments</h4>
        <h2>32</h2>
      </div>

    </div>
  );
}

export default StatsCards;