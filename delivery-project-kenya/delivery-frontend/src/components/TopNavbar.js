import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineBell, HiOutlineMenu, HiOutlineMoon, HiOutlineSun, HiOutlineUser, HiOutlineLogout, HiOutlineArrowsExpand, HiOutlineGlobeAlt } from 'react-icons/hi';
import '../styles/TopNavbar.css';
import '../styles/Notifications.css';
import { getUserOrders } from '../services/localData';

function TopNavbar({ onMenuToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [userName, setUserName] = useState('Rahul');
  const [userInitials, setUserInitials] = useState('RS');
  const [userProfileImage, setUserProfileImage] = useState(null);
  const countRef = useRef(null);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.name) {
          setUserName(user.name);
          const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          setUserInitials(initials || 'U');
          if (user.profile_image) {
            setUserProfileImage(user.profile_image);
          }
        }
      }
    } catch (err) {
      console.error("Error reading user from localStorage", err);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    let interval;
    const fetchOrdersForNotifications = async () => {
      try {
        const storedUser = localStorage.getItem('loggedInUser');
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        
        const data = getUserOrders(user.id);
        
        if (data.success && data.orders) {
          const currentCount = data.orders.length;
          
          if (countRef.current === null) {
            countRef.current = currentCount;
            const historyNotifs = data.orders.slice(0, 5).map(o => {
              const isCompleted = o.status === 'delivered';
              return {
                id: `hist-${o.id}`,
                type: 'primary',
                icon: isCompleted ? '✅' : '🚚',
                title: isCompleted ? 'Order Delivered' : 'Active Order',
                message: `Order #${o.order_id || o.id} - ${isCompleted ? 'Successfully Completed' : 'Pending Action'}`,
                time: new Date(o.created_at).toLocaleDateString(),
                read: true, 
                actionText: isCompleted ? 'View History' : 'View Orders',
                actionLink: isCompleted ? '/order-history' : '/active-orders'
              };
            });
            setNotifs(historyNotifs);
          } else if (currentCount > countRef.current) {
            countRef.current = currentCount;
            const latestOrder = data.orders[0];
            const newNotification = {
              id: `order-alert-${Date.now()}`,
              type: 'primary',
              icon: '🚚',
              title: 'New Order Assigned',
              message: `Order #${latestOrder.order_id || latestOrder.id || 'N/A'} has been assigned to you!`,
              time: 'Just now',
              read: false,
              actionText: 'View Orders',
              actionLink: '/active-orders'
            };
            setNotifs(currentNotifs => [newNotification, ...currentNotifs]);
            setToast(newNotification);
            setTimeout(() => setToast(null), 6000);
          }
        }
      } catch (err) {
        // fail silently for routine background pings
      }
    };

    fetchOrdersForNotifications();
    interval = setInterval(fetchOrdersForNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.actionLink) {
      setShowNotifications(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle}>
          <HiOutlineMenu />
        </button>
        <div className="topbar-mobile-brand">
          Prime Basket
        </div>
        <div className="topbar-greeting">
          {/* Greeting text hidden by CSS now, preserving component structure */}
          <h2>{getGreeting()}, {userName}! 👋</h2>
          <p>Here's what's happening with your deliveries today.</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <HiOutlineSearch className="topbar-search-icon" />
          <input type="text" placeholder="Search orders..." />
        </div>

        {/* Notification Bell + Dropdown */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className="topbar-icon-btn"
            id="notifications-btn"
            onClick={toggleNotifications}
          >
            <HiOutlineBell />
            {unreadCount > 0 && (
              <span className="topbar-notification-dot"></span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <h3>
                  Notifications{' '}
                  {unreadCount > 0 && (
                    <span className="notification-unread-count">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifs.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className={`notification-icon-wrapper ${notif.type}`}>
                      {notif.icon}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-meta">
                        <span className="notification-time">{notif.time}</span>
                        {notif.actionText && notif.actionLink && (
                          <Link
                            to={notif.actionLink}
                            className="notification-action-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notif);
                            }}
                          >
                            {notif.actionText} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notification-dropdown-footer">
                <Link
                  to="/coupons"
                  onClick={() => setShowNotifications(false)}
                >
                  View All Rewards & Coupons →
                </Link>
              </div>
            </div>
          )}
        </div>

        <button className="topbar-icon-btn" onClick={toggleTheme}>
          {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>

        <button className="topbar-icon-btn">
          <HiOutlineArrowsExpand />
        </button>

        <button className="topbar-icon-btn">
          <HiOutlineGlobeAlt />
        </button>

        <div className="profile-wrapper" ref={profileRef} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div 
            className="topbar-avatar" 
            id="user-avatar" 
            onClick={toggleProfileMenu} 
            style={{
              cursor: 'pointer',
              background: userProfileImage ? `url(${userProfileImage}) center/cover` : 'var(--primary)',
              color: userProfileImage ? 'transparent' : 'white'
            }}
          >
            {!userProfileImage && userInitials}
          </div>
          
          <div className="profile-details" onClick={toggleProfileMenu}>
            <span className="profile-name">{userName}</span>
            <span className="profile-role">Delivery Partner</span>
          </div>

          {showProfileMenu && (
            <div className="notification-dropdown" style={{width: '200px'}}>
              <div className="notification-list">
                <Link to="/profile" className="notification-item" onClick={() => setShowProfileMenu(false)} style={{gap: '12px'}}>
                  <HiOutlineUser size={18} /> Edit Profile
                </Link>
                <div className="notification-item" onClick={() => {
                     setShowProfileMenu(false); 
                     // Add signout logic here later
                     window.location.href = '/login'; 
                  }} style={{gap: '12px', color: 'var(--danger)', cursor: 'pointer'}}>
                  <HiOutlineLogout size={18} /> Signout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Order Toast Popup */}
      {toast && (
        <div className="order-toast-popup">
          <div className="order-toast-icon">{toast.icon}</div>
          <div className="order-toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button className="order-toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </header>
  );
}

export default TopNavbar;
