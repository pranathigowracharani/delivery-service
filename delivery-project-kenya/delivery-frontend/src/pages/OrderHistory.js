import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/OrderHistory.css';
import { getUserOrders } from '../services/localData';

function OrderHistory() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser) {
      window.location.href = "/login";
      return;
    }
    setUser(loggedUser);

    const fetchOrders = async () => {
      try {
        const data = getUserOrders(loggedUser.id);
        if (data.success) {
          // Map backend fields to frontend format
          const mappedOrders = data.orders.map(order => ({
            id: order.order_id || order.id,
            customer: order.customer_name || 'Customer',
            pickup: order.pickup_location || 'Pickup',
            delivery: order.delivery_location || 'Delivery',
            distance: order.distance || `${Math.round(Math.random()*5)}.${Math.round(Math.random()*9)} km`,
            amount: `₹${order.amount || 75}`,
            status: order.status || 'delivered',
            date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : '2024-03-17',
            time: order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '6:45 PM'
          }));
          setOrders(mappedOrders);
        } else {
          throw new Error('No orders found');
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
        setError('Failed to load orders');
        // Fallback mock data
        setOrders([
          { id: "ORD-9750", customer: "Vikram Singh", pickup: "StoreFresh, BTM", delivery: "Silk Board Junction", distance: "2.1 km", amount: "₹75", status: "Delivered", date: "2024-03-17", time: "6:45 PM" },
          { id: "ORD-9742", customer: "Lakshmi Iyer", pickup: "QuickMart, Jayanagar", delivery: "Basavanagudi", distance: "3.4 km", amount: "₹110", status: "Delivered", date: "2024-03-17", time: "5:20 PM" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 30000); // Poll
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchStatus =
  statusFilter === 'All' ||
  order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchDate = !dateFilter || order.date === dateFilter;
    return matchStatus && matchDate;
  });

  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Order History</h1>
          <p>Loading your deliveries...</p>
        </div>
        <LoadingSkeleton type="grid" count={3} />
        <div style={{ marginTop: 24 }}>
          <LoadingSkeleton type="rows" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page order-container">
      <div className="page-header">
        <h1>Order History - {user?.name}</h1>
        <p>Your delivery records ({orders.length} total)</p>
        {error && <p style={{color: 'orange'}}>{error}</p>}
      </div>

      {/* Stats */}
      <div className="history-stats">
        <div className="history-stat-card">
          <h4>{orders.length}</h4>
          <p>Total Orders</p>
        </div>
        <div className="history-stat-card">
          <h4>{deliveredCount}</h4>
          <p>Delivered</p>
        </div>
        <div className="history-stat-card">
          <h4>{cancelledCount}</h4>
          <p>Cancelled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="history-controls">
        <div className="filter-group">
          <label>Status:</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            className="filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {(statusFilter !== 'All' || dateFilter) && (
          <button
            className="btn btn-outline"
            onClick={() => {
              setStatusFilter('All');
              setDateFilter('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Pickup</th>
              <th>Delivery</th>
              <th>Distance</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No orders matching filters. Try adjusting filters or check back later.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="table-order-id">{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.pickup}</td>
                  <td>{order.delivery}</td>
                  <td>{order.distance}</td>
                  <td className="table-amount">{order.amount}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="table-date">{order.date}<br/>{order.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="history-mobile-list">
        {filteredOrders.length === 0 ? (
          <div className="history-empty-state">
            No orders matching filters. Try adjusting filters or check back later.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="history-mobile-card">
              <div className="history-mobile-card-top">
                <div>
                  <div className="table-order-id">{order.id}</div>
                  <div className="history-mobile-customer">{order.customer}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="history-mobile-grid">
                <div className="history-mobile-item">
                  <span>Pickup</span>
                  <strong>{order.pickup}</strong>
                </div>
                <div className="history-mobile-item">
                  <span>Delivery</span>
                  <strong>{order.delivery}</strong>
                </div>
                <div className="history-mobile-item">
                  <span>Distance</span>
                  <strong>{order.distance}</strong>
                </div>
                <div className="history-mobile-item">
                  <span>Amount</span>
                  <strong className="table-amount">{order.amount}</strong>
                </div>
                <div className="history-mobile-item">
                  <span>Date</span>
                  <strong>{order.date}</strong>
                </div>
                <div className="history-mobile-item">
                  <span>Time</span>
                  <strong>{order.time}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
