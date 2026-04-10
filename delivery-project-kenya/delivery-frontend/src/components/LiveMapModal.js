import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ActiveOrders.css'; 

// Fix default icons for Leaflet in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// A custom delivery bike icon
const DeliveryIcon = L.divIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color:#0f1f3d;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'>🚲</div>",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Mock coordinates for a sample route in Bangalore (since the db relies on typical string addresses)
const START_POS = [12.9121, 77.6446]; // HSR Layout approximate
const END_POS = [12.9308, 77.6214]; // Koramangala approximate

function LiveMapModal({ order, onClose }) {
  const [currentPos, setCurrentPos] = useState(START_POS);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate movement
    const totalSteps = 100;
    const intervalTime = 500; // Fast simulation: 0.5s per step
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= totalSteps) {
          clearInterval(interval);
          return totalSteps;
        }
        return prev + 1;
      });
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Interpolate position based on progress
    const latDiff = END_POS[0] - START_POS[0];
    const lngDiff = END_POS[1] - START_POS[1];
    
    // Add a slight sine wave to make it look like road curves
    const wobble = Math.sin(progress * 0.2) * 0.0005;
    
    const newLat = START_POS[0] + (latDiff * (progress / 100)) + wobble;
    const newLng = START_POS[1] + (lngDiff * (progress / 100)) + wobble;
    
    setCurrentPos([newLat, newLng]);
  }, [progress]);

  // Center map on moving vehicle dynamically
  const RecenterAutomatically = ({lat, lng}) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, lng], 14, {
        animate: true,
      });
    }, [lat, lng, map]);
    return null;
  }

  return (
    <div className="otp-modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div className="otp-modal" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
              <h3 style={{ margin: 0 }}>Live Tracking</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666'}}>Order ID: {order.id}</p>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '5px 15px' }}>Close</button>
        </div>
        
        <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <MapContainer center={START_POS} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={START_POS}>
              <Popup>Pickup: {order.pickupLocation}</Popup>
            </Marker>
            
            <Marker position={END_POS}>
              <Popup>Delivery: {order.deliveryLocation}</Popup>
            </Marker>
            
            <Polyline positions={[START_POS, currentPos]} color="var(--primary, #0f46dd)" weight={4} dashArray="5, 10" />
            <Polyline positions={[currentPos, END_POS]} color="#e0e4ec" weight={4} />

            <Marker position={currentPos} icon={DeliveryIcon}>
              <Popup>Partner Location</Popup>
            </Marker>
            
            <RecenterAutomatically lat={currentPos[0]} lng={currentPos[1]} />
          </MapContainer>
        </div>
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#f8f9fc', padding: '15px', borderRadius: '10px' }}>
          <div style={{flex: 1}}>
            <div style={{fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Status</div>
            <div style={{fontWeight: 'bold', color: progress < 100 ? '#2d5be3' : '#4CAF50'}}>{progress < 100 ? "On The Way" : "Arrived"}</div>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Estimated ETA</div>
            <div style={{fontWeight: 'bold'}}>{Math.ceil((100 - progress) * 0.5)} seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMapModal;
