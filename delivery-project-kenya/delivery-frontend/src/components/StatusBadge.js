import React from 'react';
import '../styles/StatusBadge.css';

function StatusBadge({ status }) {
  const getClassName = () => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'delivered';
    if (s === 'pending') return 'pending';
    if (s === 'cancelled') return 'cancelled';
    if (s === 'picked') return 'picked';
    if (s === 'on the way') return 'on-the-way';
    return 'pending';
  };

  return <span className={`status-badge ${getClassName()}`}>{status}</span>;
}

export default StatusBadge;
