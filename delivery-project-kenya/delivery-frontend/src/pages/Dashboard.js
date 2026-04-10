import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/Dashboard.css';
import { getEarnings, getUserOrders } from '../services/localData';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedUser) {
      window.location.href = '/login';
      return;
    }

    setUser(loggedUser);

    const fetchData = async () => {
      try {
        const ordersData = getUserOrders(loggedUser.id);
        setOrders(ordersData.orders || []);

        const earningsData = getEarnings(loggedUser.id);
        setEarnings(earningsData);
      } catch (error) {
        console.error('Fetch error:', error);
        setOrders([]);
        setEarnings({ today: 0, thisWeek: 0, thisMonth: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Loading...</p>
        </div>
        <LoadingSkeleton type="grid" count={4} />
      </div>
    );
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const completedOrders = orders.filter((order) => order.status === 'delivered').length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <h3>Welcome, {user?.name}</h3>
        <p>Overview of your delivery performance</p>
      </div>

      <div className="dashboard-cards">
        <div className="summary-card">
          <div className="summary-icon blue-icon">
            <HiOutlineCube />
          </div>
          <div className="summary-content">
            <p className="summary-title">Total Orders</p>
            <h3>{totalOrders}</h3>
            <p className="summary-subtitle">All time orders</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green-icon">
            <HiOutlineCurrencyRupee />
          </div>
          <div className="summary-content">
            <p className="summary-title">Earnings Today</p>
            <h3>Rs {earnings.today || 0}</h3>
            <p className="summary-subtitle">Today's collection</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon yellow-icon">
            <HiOutlineClock />
          </div>
          <div className="summary-content">
            <p className="summary-title">Pending Orders</p>
            <h3>{pendingOrders}</h3>
            <p className="summary-subtitle">Waiting to be delivered</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon red-icon">
            <HiOutlineCheckCircle />
          </div>
          <div className="summary-content">
            <p className="summary-title">Completed Orders</p>
            <h3>{completedOrders}</h3>
            <p className="summary-subtitle">Successfully delivered</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="map-section">
          <div className="map-header">
            <h3>Live Delivery Map</h3>
            <span>{pendingOrders} active deliveries</span>
          </div>

          <div className="map-placeholder">
            <p style={{ textAlign: 'center' }}>
              Map Integration Coming (Google Maps)
            </p>
          </div>
        </div>

        <div className="recent-orders">
          <div className="recent-orders-header">
            <h3>Recent Orders</h3>
            <Link to="/active-orders">View All -&gt;</Link>
          </div>

          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="recent-order-item">
              <div className="recent-order-info">
                <div className="recent-order-avatar">
                  {order.customer_name?.charAt(0)}
                </div>

                <div>
                  <h4>{order.customer_name}</h4>
                  <p>{order.order_id}</p>
                </div>
              </div>

              <div className="recent-order-meta">
                <span>{order.amount}</span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
