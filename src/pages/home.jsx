
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hyperspeed from '../Hyperspeed';
import './home.css';
import { DE, CA, IE, NL, AU, PL, FR, IT, GB } from 'country-flag-icons/react/3x2';

const HomePage = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const countries = [
    { Flag: DE, name: 'Germany', visa: 'EU Blue Card' },
    { Flag: CA, name: 'Canada', visa: 'Express Entry' },
    { Flag: IE, name: 'Ireland', visa: 'Critical Skills' },
    { Flag: NL, name: 'Netherlands', visa: 'Knowledge Migrant' },
    { Flag: AU, name: 'Australia', visa: 'Skilled Independent' },
    { Flag: PL, name: 'Poland', visa: 'Work Permit' },
    { Flag: FR, name: 'France', visa: 'Talent Passport' },
    { Flag: IT, name: 'Italy', visa: 'Highly Skilled' },
    { Flag: GB, name: 'UK', visa: 'Skilled Worker' }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Robust Document Verification',
      description: 'Your documents are systematically reviewed for accuracy, completeness, and visa compliance'
    },
    {
      icon: '📊',
      title: 'Multi Country Visa Readiness Comparision',
      description: 'Understand how your documents and profile align with requirements across multiple countries'
    },
    {
      icon: '✅',
      title: 'Official & Verified Sources',
      description: 'All checks are aligned with embassy and government published visa guidelines'
    },
    {
      icon: '🌎',
      title: 'Visa Coverage at Scale',
      description: 'Access analysis for 20+ Visa Categories across 9+ Countries'
    }
  ];

  const handleStartEvaluation = () => {
    navigate('/evaluation');
  };

  return (
    <div className="homepage">
      {/* Hero Section with Hyperspeed Background */}
      <section className="hero-section">
        {/* 3D Background */}
        <div className="hyperspeed-container">
          <Hyperspeed />
        </div>

        {/* Gradient Overlay */}
        <div className="hero-overlay" />

        {/* Content */}
        <div className="hero-content">
          <div className="badge">
            <span className="badge-text" style={{fontSize: '18px'}}>
              Powered by AI • Trusted by Immigration Experts
            </span>
          </div>

          <h1 className="hero-title">
            Your Global
            <br />
            <span className="hero-title-gradient">
              Visa Journey
            </span>
            <br />
            Starts Here
          </h1>

          <p className="hero-description">
            Compliance focused Visa Applicaton Support across 9 countries in minutes. 
            Competitive document verification aligned with official government requirements.
          </p>

          <div className="hero-buttons">
            <button 
              onClick={handleStartEvaluation}
              className="btn-primary"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Start Free Evaluation
              <span className={`arrow ${isHovered ? 'arrow-hover' : ''}`}>→</span>
            </button>
          </div>

          {/* Country Pills */}
          <div className="country-pills">
            {countries.map((country, idx) => {
              const { Flag, name } = country;
              return (
                <div 
                  key={idx}
                  className="country-pill"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="country-flag">
                    <Flag style={{ width: 28, height: 20, display: 'block', borderRadius: 3, boxShadow: '0 1px 2px rgba(0,0,0,0.12)' }} title={name} />
                  </span>
                  <span className="country-name">{name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-box">
            <div className="scroll-dot" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              Why Choose Our Platform?
            </h2>
          </div>

          <div className="features-grid">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="feature-card"
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              How It Works
            </h2>
            <p className="section-subtitle">
              From country selection to visa ready documentation in 3 clear steps
            </p>
          </div>

          <div className="steps-grid">
            {[
              { step: '01', title: 'Choose Country and Purpose', desc: 'Tell us where you plan to apply and the reason for your visa' },
              { step: '02', title: 'Identify the correct Visa Category', desc: 'We map your profile to the most relevant visa types for your selected country and purpose' },
              { step: '03', title: 'Document Verification & Readiness Report', desc: 'Your documents are checked against official visa checklists, with a clear readiness summary' }
            ].map((item, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number">{item.step}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.desc}</p>
                {idx < 2 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <button 
            onClick={handleStartEvaluation}
            className="cta-button"
          >
            Start Your Evaluation Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© 2026 Chiranth D Nandi, Assignment for OpenSphere Recruitment</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;