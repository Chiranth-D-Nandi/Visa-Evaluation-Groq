import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Results.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// Official visa sources by country
const OFFICIAL_SOURCES = {
  Germany: [
    { title: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/en/', relevance: 'Official government portal' },
    { title: 'German Federal Foreign Office', url: 'https://www.auswaertiges-amt.de/en/visa-service', relevance: 'Visa requirements' },
    { title: 'BAMF Immigration Office', url: 'https://www.bamf.de/EN/Startseite/startseite_node.html', relevance: 'Residence permits' }
  ],
  Canada: [
    { title: 'Immigration, Refugees and Citizenship Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', relevance: 'Official immigration portal' },
    { title: 'Express Entry', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html', relevance: 'Points calculator' },
    { title: 'IRCC Processing Times', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html', relevance: 'Current wait times' }
  ],
  Ireland: [
    { title: 'Irish Immigration Service', url: 'https://www.irishimmigration.ie/', relevance: 'Official immigration portal' },
    { title: 'Employment Permits', url: 'https://enterprise.gov.ie/en/What-We-Do/Workplace-and-Skills/Employment-Permits/', relevance: 'Work permit types' },
    { title: 'Critical Skills List', url: 'https://enterprise.gov.ie/en/What-We-Do/Workplace-and-Skills/Employment-Permits/Employment-Permit-Eligibility/', relevance: 'Eligible occupations' }
  ],
  Australia: [
    { title: 'Department of Home Affairs', url: 'https://immi.homeaffairs.gov.au/', relevance: 'Official immigration portal' },
    { title: 'SkillSelect', url: 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect', relevance: 'Expression of interest' },
    { title: 'Points Calculator', url: 'https://immi.homeaffairs.gov.au/help-support/departmental-forms/online-forms/points-calculator', relevance: 'Calculate your score' }
  ],
  UK: [
    { title: 'UK Visas and Immigration', url: 'https://www.gov.uk/browse/visas-immigration', relevance: 'Official government portal' },
    { title: 'Skilled Worker Visa', url: 'https://www.gov.uk/skilled-worker-visa', relevance: 'Work visa requirements' },
    { title: 'Sponsor License', url: 'https://www.gov.uk/uk-visa-sponsorship-employers', relevance: 'Check if employer is licensed' }
  ],
  Netherlands: [
    { title: 'IND Netherlands', url: 'https://ind.nl/en', relevance: 'Official immigration portal' },
    { title: 'Highly Skilled Migrant', url: 'https://ind.nl/en/work/working_in_the_Netherlands/Pages/Highly-skilled-migrant.aspx', relevance: 'HSM requirements' },
    { title: 'Recognized Sponsors', url: 'https://ind.nl/en/public-register-recognised-sponsors', relevance: 'List of sponsors' }
  ],
  France: [
    { title: 'France-Visas', url: 'https://france-visas.gouv.fr/en/web/france-visas/', relevance: 'Official visa portal' },
    { title: 'Talent Passport', url: 'https://www.service-public.fr/particuliers/vosdroits/F16922?lang=en', relevance: 'Skilled worker visa' }
  ],
  Italy: [
    { title: 'Ministry of Foreign Affairs', url: 'https://vistoperitalia.esteri.it/home/en', relevance: 'Visa application portal' },
    { title: 'Immigration Portal', url: 'https://www.portaleimmigrazione.it/', relevance: 'Residence permits' }
  ],
  Poland: [
    { title: 'Poland Immigration', url: 'https://www.gov.pl/web/mswia-en/immigration', relevance: 'Official portal' },
    { title: 'Work Permits', url: 'https://www.biznes.gov.pl/en/firma/doing-business-in-poland/work-permits', relevance: 'Work visa info' }
  ]
};

// Parse markdown-like text to clean readable text
const parseMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s*/g, '') // Remove markdown headers
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/`/g, '') // Remove code markers
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
};

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, formData } = location.state || {};
  
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  
  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);
  
  if (!result) return null;
  
  // Calculate dynamic confidence based on data quality
  const calculateConfidence = () => {
    let confidence = 50;
    if (result.breakdown?.education?.score > 0) confidence += 10;
    if (result.breakdown?.experience?.score > 0) confidence += 10;
    if (result.breakdown?.salary?.score > 0) confidence += 10;
    if (result.breakdown?.language?.score > 0) confidence += 5;
    if (result.breakdown?.jobOffer?.score > 0) confidence += 10;
    return Math.min(95, confidence);
  };
  
  const displayConfidence = result.confidence || calculateConfidence();
  const scoreColor = result.score >= 70 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444';
  
  // Get official sources for the country - always show sources
  const officialSources = result.sources?.length > 0 
    ? result.sources 
    : OFFICIAL_SOURCES[formData?.country] || OFFICIAL_SOURCES['Germany'];
  
  // Parse the summary text to remove markdown
  const cleanSummary = parseMarkdown(result.explanation?.summary || result.explanation?.fullReport);
  
  const handleCompareVisas = async () => {
    setLoadingComparison(true);
    try {
      const res = await fetch(`${API_BASE}/evaluation/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedData: result.extractedData,
          extractedData: result.extractedData
        })
      });
      
      const data = await res.json();
      setComparisonData(data);
      setShowComparison(true);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoadingComparison(false);
    }
  };
  
  return (
    <div className="results-page">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <h1>Your Visa Evaluation Results</h1>
          <p className="results-subtitle">{formData?.country} - {formData?.visaType}</p>
        </div>
        
        {/* Score Card */}
        <div className="score-card" style={{ borderColor: scoreColor }}>
          <div className="score-circle" style={{ borderColor: scoreColor }}>
            <div className="score-value" style={{ color: scoreColor }}>
              {result.score}
            </div>
            <div className="score-label">out of 100</div>
          </div>
          
          <div className="score-details">
            <div className="score-metric">
              <span className="metric-label">Confidence</span>
              <span className="metric-value">{displayConfidence}%</span>
            </div>
            <div className="score-metric">
              <span className="metric-label">Pass Threshold</span>
              <span className="metric-value">{result.passingScore || 60}</span>
            </div>
            <div className="score-metric">
              <span className="metric-label">Status</span>
              <span className={`metric-value ${result.isPassing ? 'passing' : 'not-passing'}`}>
                {result.isPassing ? '✓ Likely Eligible' : '⚠ Below Threshold'}
              </span>
            </div>
          </div>
        </div>
        
        {/* LLM Badge */}
        {result.llmUsed && (
          <div className="llm-badge-section">
            <span className="llm-badge">🤖 AI Analysis by: {result.llmUsed}</span>
          </div>
        )}

        {/* AI Explanation */}
        <div className="explanation-section">
          <h2>📊 Evaluation Summary</h2>
          <p className="summary-text">{cleanSummary || `Your profile has been evaluated for the ${formData?.visaType} visa to ${formData?.country}. Based on your qualifications, experience, and documentation, we've calculated your eligibility score.`}</p>
          
          <div className="strengths-gaps">
            <div className="strengths">
              <h3>✅ Strengths</h3>
              <ul>
                {(result.strongPoints || result.explanation?.strengths || ['Profile submitted successfully', 'Documentation provided']).map((strength, idx) => (
                  <li key={idx}>{parseMarkdown(strength)}</li>
                ))}
              </ul>
            </div>
            
            <div className="gaps">
              <h3>⚠️ Areas for Improvement</h3>
              <ul>
                {(result.improvements || result.explanation?.gaps || ['Continue gathering supporting documents', 'Consider additional certifications']).map((gap, idx) => (
                  <li key={idx}>{parseMarkdown(gap)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Detailed Breakdown */}
        <div className="breakdown-section">
          <h2>📋 Detailed Score Breakdown</h2>
          <div className="breakdown-items">
            {Object.entries(result.breakdown || {}).map(([category, data]) => (
              <div key={category} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="category-name">{formatCategory(category)}</span>
                  <span className="category-score">
                    {data.score}/{data.maxScore}
                  </span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ 
                      width: `${data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0}%`,
                      background: getBarColor(data.maxScore > 0 ? data.score / data.maxScore : 0)
                    }}
                  />
                </div>
                {data.notes && <p className="breakdown-notes">{parseMarkdown(data.notes)}</p>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="recommendations-section">
          <h2>💡 Recommendations</h2>
          <div className="recommendations-list">
            {(result.explanation?.recommendations || result.improvements || [
              'Review all official visa requirements on the government website',
              'Ensure all documents are translated and certified if required',
              'Apply well before your intended travel date',
              'Consider consulting an immigration specialist'
            ]).slice(0, 5).map((rec, idx) => (
              <div key={idx} className="recommendation-card">
                <span className="rec-number">{idx + 1}</span>
                <span className="rec-text">{parseMarkdown(rec)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Missing Documents */}
        {result.missingDocuments && result.missingDocuments.length > 0 && (
          <div className="missing-docs-section">
            <h2>📄 Missing Documents</h2>
            <ul className="missing-docs-list">
              {result.missingDocuments.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="sources-section">
          <h2>📚 Official Sources</h2>
          <div className="sources-list">
            {officialSources.map((source, idx) => (
              <div key={idx} className="source-item">
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <strong>{source.title}</strong>
                  <span className="source-desc">{source.relevance}</span>
                  <span className="external-link">↗</span>
                </a>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="actions-section">
          <button 
            onClick={handleCompareVisas} 
            className="btn-compare"
            disabled={loadingComparison}
          >
            {loadingComparison ? 'Comparing...' : '🌎 Compare Other Visas'}
          </button>
          <button onClick={() => window.print()} className="btn-download">
            📄 Download Report
          </button>
          <button onClick={() => navigate('/')} className="btn-home">
            🏠 Back to Home
          </button>
        </div>
        
        {/* Comparison Section */}
        {showComparison && comparisonData && (
          <div className="comparison-section">
            <h2>🌍 Multi-Country Visa Comparison</h2>
            <p className="comparison-subtitle">Based on your profile, here's how you'd score across different visa programs:</p>
            
            <div className="comparison-table">
              <div className="comparison-header">
                <div>Rank</div>
                <div>Country</div>
                <div>Visa Type</div>
                <div>Score</div>
                <div>Status</div>
              </div>
              
              {comparisonData.comparisons?.slice(0, 10).map((comp, idx) => (
                <div key={idx} className={`comparison-row ${idx === 0 ? 'best-match' : ''}`}>
                  <div className="rank">
                    {idx === 0 ? '🏆' : idx + 1}
                  </div>
                  <div className="country">{comp.country}</div>
                  <div className="visa-type">{comp.visaType}</div>
                  <div className="score">
                    <div className="score-bar">
                      <div 
                        className="score-bar-fill" 
                        style={{ 
                          width: `${Math.max(comp.score, 10)}%`,
                          background: comp.score >= 70 ? '#10b981' : comp.score >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        {comp.score}
                      </div>
                    </div>
                  </div>
                  <div className={`status ${comp.isPassing ? 'passing' : 'not-passing'}`}>
                    {comp.isPassing ? '✓ Eligible' : '⚠ Below'}
                  </div>
                </div>
              ))}
            </div>
            
            {comparisonData.bestMatch && (
              <div className="best-match-card">
                <h3>🎯 Best Match</h3>
                <p>
                  Based on your profile, <strong>{comparisonData.bestMatch.country} {comparisonData.bestMatch.visaType}</strong> offers your highest compatibility at {comparisonData.bestMatch.score}%.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const formatCategory = (category) => {
  const map = {
    education: '🎓 Education',
    experience: '💼 Work Experience',
    salary: '💰 Salary',
    language: '🌍 Language',
    jobOffer: '📄 Job Offer',
    occupation: '🔧 Occupation',
    age: '👤 Age',
    documents: '📁 Documents',
    skills: '⚡ Skills'
  };
  return map[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

const getBarColor = (percentage) => {
  if (percentage >= 0.7) return 'linear-gradient(90deg, #10b981, #34d399)';
  if (percentage >= 0.5) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  return 'linear-gradient(90deg, #ef4444, #f87171)';
};

export default ResultsPage;
