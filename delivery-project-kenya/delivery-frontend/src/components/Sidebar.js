import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineGift,
  HiOutlineUser,
  HiOutlineLogout,
  HiX,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi';
import '../styles/Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/active-orders', icon: HiOutlineTruck, label: 'Active Orders' },
  { path: '/order-history', icon: HiOutlineClock, label: 'Order History' },
  { path: '/earnings', icon: HiOutlineCurrencyRupee, label: 'Earnings' },
  { path: '/coupons', icon: HiOutlineGift, label: 'Coupons' },
  { path: '/profile', icon: HiOutlineUser, label: 'Profile' },
];

function Sidebar({ isOpen, isCollapsed, onToggleCollapse, onClose }) {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem('loggedInUser');
    setShowLogoutPopup(false);
    onClose && onClose();
    navigate('/login');
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={process.env.PUBLIC_URL + '/logo1.png'} alt="PB" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }} />
          </div>

          <div className="sidebar-brand">
            <h2>PRIME-BASKET</h2>
            <span>Delivery Partner</span>
          </div>

          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
          </button>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <HiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-link-icon">
                <item.icon />
              </span>
              <span className="nav-link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="nav-link1"
            onClick={() => setShowLogoutPopup(true)}
          >
            <span className="nav-link-icon">
              <HiOutlineLogout />
            </span>
            <span className="nav-link-text">Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutPopup && (
        <div className="logout-popup">
          <div className="logout-box">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="logout-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowLogoutPopup(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-btn"
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
