import { useState, useEffect } from 'react';
import './PartnerDashboard.css';

const API_BASE = 'http://localhost:3001/api';

const PartnerDashboard = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('partnerApiKey') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partner, setPartner] = useState(null);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    country: '',
    visaType: '',
    minScore: ''
  });

  useEffect(() => {
    if (apiKey) {
      verifyApiKey();
    }
  }, [apiKey]);

  const verifyApiKey = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/partner/me`, {
        headers: { 'x-api-key': apiKey }
      });
      
      if (!res.ok) throw new Error('Invalid API key');
      
      const data = await res.json();
      setPartner(data.partner);
      setIsAuthenticated(true);
      localStorage.setItem('partnerApiKey', apiKey);
      
      // Fetch leads and stats
      fetchLeads();
      fetchStats();
    } catch (err) {
      setError('Invalid API key. Please check and try again.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.country) params.append('country', filters.country);
      if (filters.visaType) params.append('visaType', filters.visaType);
      if (filters.minScore) params.append('minScore', filters.minScore);
      
      const res = await fetch(`${API_BASE}/partner/leads?${params}`, {
        headers: { 'x-api-key': apiKey }
      });
      
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/partner/stats`, {
        headers: { 'x-api-key': apiKey }
      });
      
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    verifyApiKey();
  };

  const handleLogout = () => {
    setApiKey('');
    setIsAuthenticated(false);
    setPartner(null);
    setLeads([]);
    setStats(null);
    localStorage.removeItem('partnerApiKey');
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Name', 'Email', 'Country', 'Visa Type', 'Score', 'Confidence', 'Lead Value', 'Date'];
    const rows = leads.map(lead => [
      lead.name,
      lead.email,
      lead.country,
      lead.visaType,
      lead.score,
      lead.confidence,
      lead.leadValue,
      new Date(lead.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="partner-login">
        <div className="login-container">
          <h1>Partner Dashboard</h1>
          <p>Enter your API key to access your leads and analytics</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_xxxxxxxxxxxxxxxx"
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an API key? Contact us to become a partner.</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="partner-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, {partner?.firmName}</h1>
            <p className="header-subtitle">Partner Dashboard</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalLeads || 0}</div>
            <div className="stat-label">Total Leads</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.averageScore?.toFixed(1) || 0}</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.highValueLeads || 0}</div>
            <div className="stat-label">High Value Leads</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.averageConfidence?.toFixed(1) || 0}%</div>
            <div className="stat-label">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="filters-section">
        <div className="filters">
          <select 
            value={filters.country} 
            onChange={(e) => setFilters({...filters, country: e.target.value})}
          >
            <option value="">All Countries</option>
            <option value="Germany">Germany</option>
            <option value="Canada">Canada</option>
            <option value="Ireland">Ireland</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Australia">Australia</option>
            <option value="Poland">Poland</option>
            <option value="France">France</option>
            <option value="Italy">Italy</option>
            <option value="UK">UK</option>
          </select>
          
          <input
            type="number"
            placeholder="Min Score"
            value={filters.minScore}
            onChange={(e) => setFilters({...filters, minScore: e.target.value})}
          />
          
          <button onClick={fetchLeads} className="btn-filter">Apply Filters</button>
        </div>
        
        <button onClick={exportToCSV} className="btn-export">
          📥 Export CSV
        </button>
      </div>

      {/* Leads Table */}
      <div className="leads-section">
        <h2>Leads ({leads.length})</h2>
        
        {leads.length === 0 ? (
          <div className="no-leads">
            <p>No leads found matching your criteria.</p>
          </div>
        ) : (
          <div className="leads-table">
            <div className="table-header">
              <div>Name</div>
              <div>Email</div>
              <div>Country</div>
              <div>Visa</div>
              <div>Score</div>
              <div>Value</div>
              <div>Urgency</div>
              <div>Date</div>
            </div>
            
            {leads.map((lead) => (
              <div key={lead.id} className="table-row">
                <div className="lead-name">{lead.name}</div>
                <div className="lead-email">{lead.email}</div>
                <div>{lead.country}</div>
                <div className="visa-type">{lead.visaType}</div>
                <div>
                  <span className={`score-badge ${getScoreClass(lead.score)}`}>
                    {lead.score}
                  </span>
                </div>
                <div>
                  <span className={`value-badge ${lead.leadValue.toLowerCase()}`}>
                    {lead.leadValue}
                  </span>
                </div>
                <div>
                  <span className={`urgency-badge ${lead.urgency.toLowerCase()}`}>
                    {lead.urgency}
                  </span>
                </div>
                <div className="lead-date">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Instructions */}
      <div className="integration-section">
        <h2>🔧 Integration Guide</h2>
        <p>Embed the evaluation tool on your website:</p>
        
        <div className="code-block">
          <code>
            {`<script src="http://localhost:5173/embed.js" data-api-key="${apiKey}"></script>`}
          </code>
        </div>
        
        <p className="integration-note">
          The evaluation tool will automatically track leads to your dashboard using your API key.
        </p>
      </div>
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

export default PartnerDashboard;
