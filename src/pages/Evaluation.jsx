import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Evaluation.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// Email validation regex - RFC 5322 compliant
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Name validation - at least 2 characters, letters and spaces only
const NAME_REGEX = /^[a-zA-Z\s]{2,100}$/;

const EvaluationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Step 1: Country & Purpose Selection
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    purpose: ''
  });
  
  const [countries] = useState([
    'Germany', 'Canada', 'Ireland', 'Netherlands', 
    'Australia', 'Poland', 'France', 'Italy', 'UK'
  ]);
  
  const [purposes] = useState([
    'Bachelor\'s Degree Study',
    'Master\'s Degree Study',
    'PhD/Research',
    'Work - Job Offer',
    'Work - Job Seeking',
    'Skilled Migration',
    'Business/Entrepreneurship',
    'Family Reunification',
    'Internship/Training'
  ]);
  
  // Step 2: Document Upload
  const [baseDocuments, setBaseDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Step 3: AI Suggestion & Extraction
  const [extracting, setExtracting] = useState(false);
  const [suggestedVisas, setSuggestedVisas] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  
  // Step 4: Results
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Get base documents when purpose changes
  useEffect(() => {
    if (formData.purpose) {
      const docs = getBaseDocuments(formData.purpose);
      setBaseDocuments(docs);
    }
  }, [formData.purpose]);

  const getBaseDocuments = (purpose) => {
    if (purpose.includes('Study')) {
      return ['Passport', 'Resume/CV', 'Academic Transcripts', 'Degree Certificates', 'English Proficiency Test', 'Statement of Purpose', 'Financial Proof'];
    } else if (purpose.includes('Work')) {
      return ['Passport', 'Resume/CV', 'Degree Certificates', 'Work Experience Letters', 'Job Offer Letter', 'Salary Proof', 'Skills Certifications'];
    } else if (purpose.includes('Migration')) {
      return ['Passport', 'Resume/CV', 'Degree Certificates', 'Work Experience Letters', 'Language Test Results', 'Skills Assessment', 'Financial Proof'];
    } else if (purpose.includes('Business')) {
      return ['Passport', 'Resume/CV', 'Business Plan', 'Financial Statements', 'Investment Proof', 'Professional Qualifications'];
    } else if (purpose.includes('Family')) {
      return ['Passport', 'Relationship Proof', 'Sponsor Documents', 'Financial Proof', 'Accommodation Proof'];
    } else {
      return ['Passport', 'Resume/CV', 'Degree Certificates', 'Financial Proof'];
    }
  };

  // Handle form input with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time validation
    if (name === 'email' && value) {
      if (!EMAIL_REGEX.test(value)) {
        setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }
    
    if (name === 'name' && value) {
      if (!NAME_REGEX.test(value)) {
        setValidationErrors(prev => ({ ...prev, name: 'Name should contain only letters (2-100 characters)' }));
      }
    }
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (!NAME_REGEX.test(formData.name.trim())) {
      errors.name = 'Name should contain only letters (2-100 characters)';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g., name@example.com)';
    }
    
    if (!formData.country) {
      errors.country = 'Please select a destination country';
    }
    
    if (!formData.purpose) {
      errors.purpose = 'Please select your immigration purpose';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = async (e, docType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setLoading(true);
    setError('');
    setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
    
    try {
      const uploadFormData = new FormData();
      files.forEach(file => uploadFormData.append('documents', file));
      
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: uploadFormData
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUploadedFiles(prev => ({
          ...prev,
          [docType]: data.files
        }));
        setUploadProgress(prev => ({ ...prev, [docType]: 100 }));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 1 -> Step 2
  const handleStep1Next = () => {
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }
    setError('');
    setStep(2);
  };

  // Handle Step 2 -> Step 3 (AI Analysis)
  const handleStep2Next = async () => {
    // Check if resume is uploaded (mandatory)
    if (!uploadedFiles['Resume/CV']) {
      setError('Please upload your Resume/CV (required)');
      return;
    }
    
    setError('');
    setExtracting(true);
    
    try {
      // Call AI to analyze documents and suggest visa categories
      const analysisRes = await fetch(`${API_BASE}/evaluation/analyze-and-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.country,
          purpose: formData.purpose,
          uploadedFiles
        })
      });
      
      const analysisData = await analysisRes.json();
      
      if (analysisData.success) {
        setSuggestedVisas(analysisData.suggestedVisas);
        setExtractedData(analysisData.extractedData);
        setStep(3);
      } else {
        setError(analysisData.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze documents. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  // Handle visa selection and proceed to evaluation
  const handleVisaSelection = async (visa) => {
    setSelectedVisa(visa);
    setLoading(true);
    setError('');
    
    try {
      // Submit evaluation with selected visa
      const evalRes = await fetch(`${API_BASE}/evaluation/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          country: formData.country,
          visaType: visa.name,
          purpose: formData.purpose,
          extractedData,
          uploadedFiles
        })
      });
      
      const evalData = await evalRes.json();
      console.log('Evaluation response:', evalData);
      
      if (evalData.success) {
        setEvaluationResult(evalData);
        setStep(4);
      } else {
        setError(evalData.message || 'Evaluation failed. Please try again.');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError('Failed to complete evaluation. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // View results
  const viewResults = () => {
    if (evaluationResult) {
      navigate('/results', { 
        state: { 
          result: evaluationResult,
          formData: {
            ...formData,
            visaType: selectedVisa?.name
          }
        } 
      });
    }
  };

  // Render Step 1: Country & Purpose Selection
  const renderStepOne = () => (
    <div className="form-step">
      <h2>Tell us about your plans</h2>
      <p className="step-description">Choose your destination and purpose</p>
      
      <div className={`form-group ${validationErrors.name ? 'has-error' : ''}`}>
        <label htmlFor="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className={validationErrors.name ? 'input-error' : ''}
          required
        />
        {validationErrors.name && (
          <span className="field-error">{validationErrors.name}</span>
        )}
      </div>
      
      <div className={`form-group ${validationErrors.email ? 'has-error' : ''}`}>
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
          className={validationErrors.email ? 'input-error' : ''}
          required
        />
        {validationErrors.email && (
          <span className="field-error">{validationErrors.email}</span>
        )}
        <span className="field-hint">We'll send your evaluation results to this email</span>
      </div>
      
      <div className={`form-group ${validationErrors.country ? 'has-error' : ''}`}>
        <label htmlFor="country">Destination Country *</label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className={validationErrors.country ? 'input-error' : ''}
          required
        >
          <option value="">Select a country</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        {validationErrors.country && (
          <span className="field-error">{validationErrors.country}</span>
        )}
      </div>
      
      <div className={`form-group ${validationErrors.purpose ? 'has-error' : ''}`}>
        <label htmlFor="purpose">Purpose of Immigration *</label>
        <select
          id="purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleInputChange}
          className={validationErrors.purpose ? 'input-error' : ''}
          required
        >
          <option value="">Select your purpose</option>
          {purposes.map(purpose => (
            <option key={purpose} value={purpose}>{purpose}</option>
          ))}
        </select>
        {validationErrors.purpose && (
          <span className="field-error">{validationErrors.purpose}</span>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-group">
        <button onClick={handleStep1Next} className="btn-primary">
          Continue to Documents
        </button>
      </div>
    </div>
  );

  // Render Step 2: Document Upload
  const renderStepTwo = () => (
    <div className="form-step">
      <h2>Upload Your Documents</h2>
      <p className="step-description">
        Upload documents for <strong>{formData.purpose}</strong> to <strong>{formData.country}</strong>
      </p>
      
      <div className="document-checklist">
        <h3>Required Documents</h3>
        {baseDocuments.map((docType, index) => (
          <div key={index} className="document-item">
            <div className="doc-header">
              <span className="doc-name">
                {docType}
                {docType === 'Resume/CV' && <span className="required-badge">Required</span>}
              </span>
              {uploadedFiles[docType] && (
                <span className="upload-success">✓ Uploaded</span>
              )}
            </div>
            
            <div className="upload-area">
              <input
                type="file"
                id={`file-${index}`}
                onChange={(e) => handleFileUpload(e, docType)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                disabled={loading}
              />
              <label htmlFor={`file-${index}`} className="upload-label">
                {uploadedFiles[docType] ? (
                  <span>
                    {uploadedFiles[docType].map(f => f.originalName).join(', ')}
                  </span>
                ) : (
                  <span>Click to upload or drag & drop</span>
                )}
              </label>
              
              {uploadProgress[docType] !== undefined && uploadProgress[docType] < 100 && (
                <div className="progress-bar-upload">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress[docType]}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-group">
        <button onClick={() => setStep(1)} className="btn-secondary">
          Back
        </button>
        <button 
          onClick={handleStep2Next} 
          className="btn-primary"
          disabled={extracting || !uploadedFiles['Resume/CV']}
        >
          {extracting ? 'Analyzing Documents...' : 'Analyze & Get Visa Suggestions'}
        </button>
      </div>
    </div>
  );

  // Render Step 3: AI Visa Suggestions
  const renderStepThree = () => (
    <div className="form-step">
      <h2>Recommended Visa Categories</h2>
      <p className="step-description">
        Based on your profile, we suggest these visa options for <strong>{formData.country}</strong>
      </p>
      
      {extractedData && (
        <div className="profile-summary">
          <h3>Your Profile Summary</h3>
          <div className="profile-grid">
            {extractedData.education && (
              <div className="profile-item">
                <span className="label">Education:</span>
                <span>{extractedData.education.level} - {extractedData.education.field}</span>
              </div>
            )}
            {extractedData.experience && (
              <div className="profile-item">
                <span className="label">Experience:</span>
                <span>{extractedData.experience.totalYears} years</span>
              </div>
            )}
            {extractedData.skills && (
              <div className="profile-item">
                <span className="label">Key Skills:</span>
                <span>{extractedData.skills.slice(0, 3).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="visa-suggestions">
        {suggestedVisas && suggestedVisas.length > 0 ? (
          suggestedVisas.map((visa, index) => (
            <div key={index} className="visa-card" onClick={() => handleVisaSelection(visa)}>
              <div className="visa-header">
                <h3>{visa.name}</h3>
                <div className="match-score">
                  <div className="score-circle" style={{ 
                    background: `conic-gradient(#4CAF50 ${visa.matchScore * 3.6}deg, #e0e0e0 0deg)` 
                  }}>
                    <span>{visa.matchScore}%</span>
                  </div>
                  <span className="match-label">Match</span>
                </div>
              </div>
              
              <p className="visa-description">{visa.description}</p>
              
              {visa.officialName && (
                <p className="official-name"><em>Official: {visa.officialName}</em></p>
              )}
              
              <div className="visa-details">
                <div className="detail-item">
                  <strong>Duration:</strong> {visa.duration}
                </div>
                
                {visa.requirements && (
                  <div className="requirements-preview">
                    <strong>Key Requirements:</strong>
                    <ul>
                      {Object.entries(visa.requirements).slice(0, 3).map(([key, value], idx) => (
                        <li key={idx}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}: {
                            typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <button className="btn-select-visa">
                Select This Visa →
              </button>
            </div>
          ))
        ) : (
          <div className="no-suggestions">
            <p>No specific visa suggestions available. Please contact our support team.</p>
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-group">
        <button onClick={() => setStep(2)} className="btn-secondary">
          Back to Documents
        </button>
      </div>
    </div>
  );

  // Render Step 4: Processing & Results
  const renderStepFour = () => (
    <div className="form-step">
      <div className="success-animation">
        <div className="checkmark-circle">
          <div className="checkmark"></div>
        </div>
      </div>
      
      <h2>Evaluation Complete!</h2>
      <p className="step-description">
        Your visa evaluation for <strong>{selectedVisa?.name}</strong> is ready
      </p>
      
      {evaluationResult && (
        <div className="results-preview">
          <div className="score-display">
            <div className="big-score" style={{
              background: evaluationResult.score >= 70 ? '#4CAF50' : 
                          evaluationResult.score >= 50 ? '#FF9800' : '#F44336'
            }}>
              {evaluationResult.score}%
            </div>
            <p className="score-label">Eligibility Score</p>
            <p className="confidence-label">Confidence: {evaluationResult.confidence}%</p>
          </div>
          
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{evaluationResult.missingDocuments?.length || 0}</span>
              <span className="stat-label">Documents Needed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{evaluationResult.strongPoints?.length || 0}</span>
              <span className="stat-label">Strong Points</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{evaluationResult.improvements?.length || 0}</span>
              <span className="stat-label">Improvements</span>
            </div>
          </div>
          
          {/* AI Analysis Summary */}
          {evaluationResult.explanation && (
            <div className="ai-summary">
              <h3>📊 AI Analysis Summary</h3>
              <p>{evaluationResult.explanation.summary}</p>
              
              {evaluationResult.strongPoints && evaluationResult.strongPoints.length > 0 && (
                <div className="strengths-list">
                  <h4>✅ Strengths</h4>
                  <ul>
                    {evaluationResult.strongPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {evaluationResult.improvements && evaluationResult.improvements.length > 0 && (
                <div className="improvements-list">
                  <h4>💡 Recommendations</h4>
                  <ul>
                    {evaluationResult.improvements.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* LLM Attribution */}
          {evaluationResult.llmUsed && (
            <div className="llm-badge">
              <span>🤖 Powered by: {evaluationResult.llmUsed}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="button-group">
        <button onClick={viewResults} className="btn-primary btn-large">
          View Detailed Results
        </button>
        <button onClick={() => window.location.reload()} className="btn-secondary">
          Start New Evaluation
        </button>
      </div>
    </div>
  );

  return (
    <div className="evaluation-page">
      <div 
        className="background-image" 
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '50%',
          height: '100vh',
          backgroundImage: 'url(/back.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className="eval-container">
        {/* Progress Indicator */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Country & Purpose</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Upload Documents</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">AI Suggestions</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span className="step-label">Results</span>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderStepThree()}
        {step === 4 && renderStepFour()}
      </div>
    </div>
  );
};

export default EvaluationPage;
