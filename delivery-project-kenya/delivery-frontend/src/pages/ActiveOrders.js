import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineCube } from 'react-icons/hi';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import LiveMapModal from '../components/LiveMapModal';
import '../styles/ActiveOrders.css';
import { getActiveOrders, updateOrderStatus as persistOrderStatus } from '../services/localData';

function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const otpRefs = useRef([]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapOrderId, setMapOrderId] = useState(null);
const formatStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Picked';
    case 'on_the_way':
      return 'On the Way';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const [error, setError] = useState(null);

useEffect(() => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedUser) {
    window.location.href = "/login";
    return;
  }

  const fetchOrders = async () => {
    try {
      const userId = loggedUser.id;
      console.log("User ID:", userId);

      const data = getActiveOrders(userId);
      if (!data.success || !data.orders) {
        setOrders([]);
        setError(data.error || "No active orders found");
        return;
      }

      const formatted = data.orders.map((order) => ({
        id: order.order_id,
        customerName: order.customer_name,
        pickupLocation: order.pickup_location,
        deliveryLocation: order.delivery_location,
        distance: order.distance,
        estimatedTime: "10 min",
        amount: order.amount,
        status: formatStatus(order.status),
        items: 4
      }));

      setOrders(formatted);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load active orders. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  fetchOrders(); // Initial
  const interval = setInterval(fetchOrders, 10000); // Polling every 10s
  
  return () => clearInterval(interval);
}, []);

const updateOrderStatus = async (orderId, newStatus, reason = null) => {
  try {
    const payload = { orderId, status: newStatus };
    if (reason) payload.reason = reason;

    const response = persistOrderStatus(orderId, newStatus, reason);
    if (!response.success) {
      throw new Error(response.message || 'Unable to update order');
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: formatStatus(newStatus) } : order
      )
    );
  } catch (err) {
    console.error(err);
  }
};

  const handleAccept = (orderId) => {
   updateOrderStatus(orderId, 'accepted');
  };

  const handleMarkPicked = (orderId) => {
  updateOrderStatus(orderId, 'on_the_way');
  };

  const handleMarkDelivered = (orderId) => {
    setSelectedOrderId(orderId);
    setOtpValues(['', '', '', '']);
    setShowOtpModal(true);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const confirmDelivery = () => {
    const otp = otpValues.join('');
    if (otp.length === 4) {
      updateOrderStatus(selectedOrderId, 'delivered');
      setShowOtpModal(false);
      setSelectedOrderId(null);
    }
  };

  const handleCancelClick = (orderId) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (cancelReason.trim()) {
      updateOrderStatus(cancelOrderId, 'cancelled', cancelReason);
      setShowCancelModal(false);
      setCancelOrderId(null);
    }
  };

  const getActionButtons = (order) => {
    switch (order.status) {
      case 'Pending':
        return (
          <button className="btn btn-primary" onClick={() => handleAccept(order.id)}>
            ✓ Accept Order
          </button>
        );
      case 'Picked':
        return (
          <button className="btn btn-warning" onClick={() => handleMarkPicked(order.id)}>
            🚀 Mark as On the Way
          </button>
        );
      case 'On the Way':
        return (
          <>
            <button className="btn btn-primary" style={{marginRight: '10px'}} onClick={() => {
              setMapOrderId(order.id);
              setShowMapModal(true);
            }}>
              🗺️ Track Delivery
            </button>
            <button className="btn btn-success" onClick={() => handleMarkDelivered(order.id)}>
              📦 Mark as Delivered
            </button>
          </>
        );
      case 'Delivered':
        return (
          <button className="btn btn-outline" disabled>
            ✅ Delivered
          </button>
        );
      default:
        return null;
    }
  };

if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Active Orders</h1>
          <p>Manage your current deliveries</p>
        </div>
        <LoadingSkeleton type="rows" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1>Active Orders</h1>
          <p>Manage your current deliveries</p>
          <div style={{color: 'orange', padding: '16px', borderRadius: '8px', marginBottom: '24px'}}>
            {error}
          </div>
        </div>
        <div style={{textAlign: 'center', padding: '64px', color: 'var(--text-muted)'}}>
          <p>No active orders at the moment.</p>
          <p>Check back later for new deliveries.</p>
        </div> 
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
console.log("Logged user:", localStorage.getItem("user"));
  return (
    <div className="active-orders-page activeorders">
      <div className="page-header">
        <h1>Active Orders</h1>
        <p>Manage your current deliveries</p>
      </div>

      <div className="active-orders-header">
        <div className="active-orders-count">
          Showing <span className="count-num">{orders.length}</span> orders
          {pendingCount > 0 && (
            <> · <span className="count-num">{pendingCount}</span> pending</>
          )}
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card-top">
              <div className="order-id-section">
                <div className="order-icon">
                  <HiOutlineCube />
                </div>
                <div className="order-id-info">
                  <h4>{order.id}</h4>
                  <p>{order.customerName} · {order.items} items</p>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="order-card-body">
              <div className="order-location">
                <span className="order-location-label">📍 Pickup</span>
                <span className="order-location-value">{order.pickupLocation}</span>
              </div>
              <div className="order-location">
                <span className="order-location-label">🏠 Delivery</span>
                <span className="order-location-value">{order.deliveryLocation}</span>
              </div>
              <div className="order-meta-grid">
                <div className="order-meta-item">
                  <span className="meta-label">Distance:</span>
                  <span className="meta-value">{order.distance}</span>
                </div>
                <div className="order-meta-item">
                  <span className="meta-label">ETA:</span>
                  <span className="meta-value">{order.estimatedTime}</span>
                </div>
                <div className="order-meta-item">
                  <span className="meta-label">Amount:</span>
                  <span className="meta-value">₹{Number(order.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="order-card-actions">
              {getActionButtons(order)}
              {(order.status === 'Pending' || order.status === 'Picked' || order.status === 'On the Way') && (
                <button
                  className="btn btn-outline cancel-btn"
                  onClick={() => handleCancelClick(order.id)}
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Verify Delivery OTP</h3>
            <p>Enter the 4-digit OTP provided by the customer</p>
            <div className="otp-inputs">
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength="1"
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <div className="otp-modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={confirmDelivery}
                disabled={otpValues.join('').length !== 4}
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="otp-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="otp-modal cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p>Please select a reason for cancelling this order</p>
            <div className="cancel-reasons">
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="cancel-select"
              >
                <option value="" disabled>Select a reason...</option>
                <option value="Vehicle broke down">Vehicle broke down</option>
                <option value="Address not found">Address not found</option>
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Bad weather conditions">Bad weather conditions</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="otp-modal-actions cancel-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmCancel}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Map Modal */}
      {showMapModal && mapOrderId && (
        <LiveMapModal 
          order={orders.find(o => o.id === mapOrderId)} 
          onClose={() => {
            setShowMapModal(false);
            setMapOrderId(null);
          }} 
        />
      )}
    </div>
  );
}

export default ActiveOrders;
