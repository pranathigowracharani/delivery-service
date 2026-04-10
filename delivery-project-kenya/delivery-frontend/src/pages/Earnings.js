import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/Earnings.css';
import { getEarnings } from '../services/localData';

function Earnings() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [chartView, setChartView] = useState('weekly');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser) {
      window.location.href = "/login";
      return;
    }
    setUser(loggedUser);

    const fetchData = async () => {
      try {
        const data = getEarnings(loggedUser.id);
        if (data.success) {
          setEarnings(data);
        } else {
          throw new Error(data.error || 'Fetch failed');
        }
      } catch (err) {
        console.error('Earnings fetch error:', err);
        setError('Failed to load earnings data');
        // Fallback mock
        setEarnings({ today: 1240, thisWeek: 8450, thisMonth: 32800, total: 125000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Mock chart data (extend backend later for real breakdowns)
  const chartData = chartView === 'weekly' 
    ? [
        { day: "Mon", amount: earnings.thisWeek * 0.15 },
        { day: "Tue", amount: earnings.thisWeek * 0.2 },
        { day: "Wed", amount: earnings.thisWeek * 0.12 },
        { day: "Thu", amount: earnings.thisWeek * 0.18 },
        { day: "Fri", amount: earnings.thisWeek * 0.22 },
        { day: "Sat", amount: earnings.thisWeek * 0.25 },
        { day: "Sun", amount: earnings.today }
      ]
    : [
        { month: "Jan", amount: earnings.thisMonth * 0.8 },
        { month: "Feb", amount: earnings.thisMonth * 0.9 },
        { month: "Mar", amount: earnings.thisMonth }
      ];

  const maxAmount = Math.max(...chartData.map((d) => d.amount)) || 1;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Earnings</h1>
          <p>Track your income and payouts</p>
        </div>
        <LoadingSkeleton type="grid" count={4} />
        <div style={{ marginTop: 24 }}>
          <LoadingSkeleton type="rows" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-page">
      <div className="page-header">
        <h1>Earnings</h1>
        <p>Dynamic earnings for {user?.name} - Updated live</p>
        {error && <p style={{color: 'orange'}}>{error}</p>}
      </div>

      {/* Summary Cards - Dynamic */}
      <div className="earnings-summary">
        <div className="earnings-card highlight">
          <div className="earnings-card-label">Today's Earnings</div>
          <div className="earnings-card-value">₹{(earnings.today || 0).toLocaleString()}</div>

          <div className="earnings-card-trend">↑ Live</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-card-label">This Week</div>
          <div className="earnings-card-value">₹{(earnings.thisWeek || 0).toLocaleString()}</div>

          <div className="earnings-card-trend">Dynamic</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-card-label">This Month</div>
          <div className="earnings-card-value">₹{(earnings.thisMonth || 0).toLocaleString()}</div>

          <div className="earnings-card-trend">Live data</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-card-label">Total Career</div>
          <div className="earnings-card-value">₹{(earnings.total || 0).toLocaleString()}</div>

          <div className="earnings-card-trend">All time</div>
        </div>
      </div>

      {/* Chart + Payouts Grid */}
      <div className="earnings-grid">
        {/* Bar Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>📊 Earnings Overview</h3>
            <div className="chart-tabs">
              <button
                className={`chart-tab ${chartView === 'weekly' ? 'active' : ''}`}
                onClick={() => setChartView('weekly')}
              >
                Weekly
              </button>
              <button
                className={`chart-tab ${chartView === 'monthly' ? 'active' : ''}`}
                onClick={() => setChartView('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="chart-body">
            <div className="bar-chart">
              {chartData.map((item, idx) => {
                const heightPercent = (item.amount / maxAmount) * 100;
                return (
                  <div key={idx} className="bar-group">
                    <div className="bar-wrapper">
                      <div
                        className="bar"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="bar-tooltip">
                          ₹{Math.round(item.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="bar-label">
                      {item.day || item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Payouts - Mock (backend enhancement later) */}
        <div className="payouts-section">
          <div className="payouts-header">
            <h3>💰 Recent Payouts</h3>
            <p>Live sync soon</p>
          </div>
          <div className="payout-item" style={{opacity: 0.6}}>
            <div className="payout-info">
              <h4>PAY-Live-001</h4>
              <p>Today</p>
            </div>
            <span className="payout-amount">₹{(earnings.today || 0).toLocaleString()}</span>

          </div>
          <div className="payout-item" style={{opacity: 0.6}}>
            <div className="payout-info">
              <h4>PAY-Live-002</h4>
              <p>Weekly</p>
            </div>
            <span className="payout-amount">₹{(earnings.thisWeek || 0).toLocaleString()}</span>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Earnings;
