import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { couponsData } from '../data/data';
import '../styles/Coupons.css';

function Coupons() {
  const [loading, setLoading] = useState(true);
  const [couponTab, setCouponTab] = useState('active');
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Coupons & Rewards</h1>
          <p>Your benefits, streaks, and reward coupons</p>
        </div>
        <LoadingSkeleton type="grid" count={3} />
        <div style={{ marginTop: 24 }}>
          <LoadingSkeleton type="grid" count={4} />
        </div>
      </div>
    );
  }

  const { streakInfo, activeCoupons, redeemedCoupons, benefits } = couponsData;
  const displayedCoupons = couponTab === 'active' ? activeCoupons : redeemedCoupons;

  return (
    <div className="coupons">
      <div className="page-header">
        <h1>Coupons & Rewards</h1>
        <p>Your benefits, streaks, and reward coupons</p>
      </div>

      {/* Streak Banner */}
      <div className="streak-banner">
        <div className="streak-banner-top">
          <div className="streak-title">
            <span className="streak-fire">🔥</span>
            <h2>Delivery Streak</h2>
          </div>
          <div className="streak-count">{streakInfo.currentStreak}/{streakInfo.targetStreak} Days</div>
        </div>
        <p className="streak-subtitle">{streakInfo.message}</p>
        <div className="streak-days">
          {streakInfo.weekDays.map((d, idx) => (
            <div key={idx} className="streak-day">
              <div className={`streak-day-circle ${d.completed ? 'completed' : 'pending'}`}>
                {d.completed ? '✓' : idx + 1}
              </div>
              <span className="streak-day-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2 className="section-title">🎯 Partner Benefits</h2>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="benefit-card" style={{ '--benefit-color': benefit.color }}>
              <div
                className="benefit-icon"
                style={{ background: `${benefit.color}15` }}
              >
                {benefit.icon}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons Section */}
      <div className="coupons-section">
        <h2 className="section-title">🎟️ Your Coupons</h2>

        <div className="coupons-tabs">
          <button
            className={`coupon-tab ${couponTab === 'active' ? 'active' : ''}`}
            onClick={() => setCouponTab('active')}
          >
            Active ({activeCoupons.length})
          </button>
          <button
            className={`coupon-tab ${couponTab === 'redeemed' ? 'active' : ''}`}
            onClick={() => setCouponTab('redeemed')}
          >
            Redeemed ({redeemedCoupons.length})
          </button>
        </div>

        {displayedCoupons.length === 0 ? (
          <div className="coupons-empty">
            <div className="coupons-empty-icon">🎟️</div>
            <h3>No coupons yet</h3>
            <p>Complete more deliveries to earn rewards!</p>
          </div>
        ) : (
          <div className="coupons-grid">
            {displayedCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`coupon-card ${coupon.status === 'locked' ? 'locked' : ''} ${couponTab === 'redeemed' ? 'redeemed' : ''}`}
              >
                <div className="coupon-card-top">
                  <div className={`coupon-icon-wrapper ${coupon.type}`}>
                    {coupon.icon}
                  </div>
                  <div className="coupon-title-section">
                    <h4>{coupon.title}</h4>
                    <span className="coupon-discount-tag">{coupon.discount}</span>
                  </div>
                </div>

                <div className="coupon-card-body">
                  <p className="coupon-description">{coupon.description}</p>

                  <div className="coupon-details">
                    <div className="coupon-detail-row">
                      <span className="coupon-detail-label">Code:</span>
                      <span
                        className="coupon-code"
                        onClick={() => handleCopyCode(coupon.code)}
                        style={{ cursor: 'pointer' }}
                        title="Click to copy"
                      >
                        {coupon.code}
                        {copiedCode === coupon.code ? ' ✓' : ' 📋'}
                      </span>
                    </div>
                    {coupon.validTill && (
                      <div className="coupon-detail-row">
                        <span className="coupon-detail-label">Valid Till:</span>
                        <span className="coupon-detail-value">{coupon.validTill}</span>
                      </div>
                    )}
                    {coupon.redeemedOn && (
                      <div className="coupon-detail-row">
                        <span className="coupon-detail-label">Redeemed On:</span>
                        <span className="coupon-detail-value">{coupon.redeemedOn}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="coupon-card-footer">
                  <span className="coupon-condition">
                    {coupon.minCondition || ''}
                  </span>
                  {couponTab === 'active' && (
                    <button
                      className={`coupon-redeem-btn ${coupon.status}`}
                      disabled={coupon.status === 'locked'}
                    >
                      {coupon.status === 'locked' ? '🔒 Locked' : 'Redeem'}
                    </button>
                  )}
                  {couponTab === 'redeemed' && (
                    <span className="coupon-redeemed-badge">✓ Redeemed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Coupons;
