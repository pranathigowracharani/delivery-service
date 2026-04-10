function ShippingTable() {
  return (
    <div style={{flex:1, background: 'var(--bg-card)', borderRadius: '15px', boxShadow: 'var(--soft-shadow)', overflow: 'hidden', border: '1px solid var(--border-color)'}}>
      <div style={{padding: '20px 24px', borderBottom: '1px solid var(--border-color)'}}>
        <h3 style={{margin: 0, fontSize: '18px', color: 'var(--text-primary)'}}>Shipping List</h3>
      </div>

      <div style={{padding: '24px'}}>
        <table width="100%" style={{borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px'}}>
          <thead>
            <tr style={{color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)'}}>
              <th style={{paddingBottom: '14px', fontWeight: 600}}>ID</th>
              <th style={{paddingBottom: '14px', fontWeight: 600}}>Destination</th>
              <th style={{paddingBottom: '14px', fontWeight: 600}}>Weight</th>
              <th style={{paddingBottom: '14px', fontWeight: 600}}>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr style={{borderBottom: '1px solid var(--border-color)'}}>
              <td style={{padding: '18px 0', fontWeight: 'bold', color: 'var(--primary)'}}>#RQ7487</td>
              <td style={{padding: '18px 0', color: 'var(--text-primary)'}}>Gachibowli</td>
              <td style={{padding: '18px 0', color: 'var(--text-secondary)'}}>3.4kg</td>
              <td style={{padding: '18px 0'}}>
                <span style={{background: 'var(--warning-bg)', color: 'var(--warning)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold'}}>In Transit</span>
              </td>
            </tr>

            <tr>
              <td style={{padding: '18px 0', fontWeight: 'bold', color: 'var(--primary)'}}>#RQ7488</td>
              <td style={{padding: '18px 0', color: 'var(--text-primary)'}}>Kukatpally</td>
              <td style={{padding: '18px 0', color: 'var(--text-secondary)'}}>2.8kg</td>
              <td style={{padding: '18px 0'}}>
                <span style={{background: 'var(--success-bg)', color: 'var(--success)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold'}}>On the Way</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShippingTable;