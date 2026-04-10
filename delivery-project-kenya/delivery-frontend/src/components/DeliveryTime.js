function DeliveryTime() {
  return (
    <div className="card" style={{width:"300px"}}>
      <h3>Delivery Time</h3>

      <p>Gachibowli</p>
      <div style={{background:"#ddd", borderRadius:"10px"}}>
        <div style={{width:"60%", background:"blue", color:"white"}}>
          3 Days
        </div>
      </div>

      <p>Kukatpally</p>
      <div style={{background:"#ddd", borderRadius:"10px"}}>
        <div style={{width:"80%", background:"green", color:"white"}}>
          4 Days
        </div>
      </div>
    </div>
  );
}

export default DeliveryTime;