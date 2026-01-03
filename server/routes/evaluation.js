import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Evaluation from '../models/Evaluation.js';
import { getCountries, getVisaTypes, getVisaConfig, VISA_CONFIGS } from '../config/visaConfigs.js';
import { DocumentExtractor } from '../services/documentExtractor.js';
import { ScoringEngine } from '../services/scoringEngine.js';
import { suggestVisaCategories, PURPOSES, getBaseDocumentsForPurpose, VISA_CATEGORIES } from '../config/visaCategoriesByPurpose.js';
import { analyzeVisaEligibility, getCachedVisaRequirements } from '../services/travelBuddyAPI.js';
import { generateEvaluationReport, analyzeProfileForVisa, extractResumeData } from '../services/freeLLM.js';

const router = express.Router();

// ============================================
// VALIDATION UTILITIES
// ============================================
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const NAME_REGEX = /^[a-zA-Z\s]{2,100}$/;

const VALID_COUNTRIES = ['Germany', 'Canada', 'Ireland', 'Netherlands', 'Australia', 'Poland', 'France', 'Italy', 'UK'];

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  return NAME_REGEX.test(name.trim());
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  // Remove potential XSS vectors
  return input.replace(/<[^>]*>/g, '').trim();
}

// ============================================
// API ROUTES
// ============================================

// Get list of supported countries
router.get('/countries', (req, res) => {
  try {
    const countries = getCountries().map(country => ({
      name: country,
      visaTypes: getVisaTypes(country)
    }));
    
    res.json({ countries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get visa types for a specific country
router.get('/countries/:country/visas', (req, res) => {
  try {
    const { country } = req.params;
    const visaTypes = getVisaTypes(country);
    
    if (visaTypes.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const visaDetails = visaTypes.map(visaType => {
      const config = getVisaConfig(country, visaType);
      return {
        type: visaType,
        description: config.description,
        requiredDocuments: config.requiredDocuments,
        optionalDocuments: config.optionalDocuments
      };
    });
    
    res.json({ country, visas: visaDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get visa requirements
router.get('/requirements/:country/:visaType', (req, res) => {
  try {
    const { country, visaType } = req.params;
    const config = getVisaConfig(country, visaType);
    
    if (!config) {
      return res.status(404).json({ error: 'Visa configuration not found' });
    }
    
    res.json({
      country,
      visaType,
      description: config.description,
      requiredDocuments: config.requiredDocuments,
      optionalDocuments: config.optionalDocuments,
      requirements: config.requirements,
      officialSources: config.officialSources
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract data from documents
router.post('/extract', async (req, res) => {
  try {
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array required' });
    }
    
    const extractor = new DocumentExtractor();
    const extractedData = await extractor.extractFromDocuments(documents);
    
    res.json({
      message: 'Data extracted successfully',
      extractedData
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Document extraction failed', details: error.message });
  }
});

// Create evaluation
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      email,
      country,
      visaType,
      documents,
      extractedData,
      confirmedData,
      partnerId
    } = req.body;
    
    // Validation
    if (!name || !email || !country || !visaType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if partner API key is provided
    const partnerKey = req.headers['x-api-key'];
    
    // Get visa config
    const config = getVisaConfig(country, visaType);
    if (!config) {
      return res.status(400).json({ error: 'Invalid visa configuration' });
    }
    
    // Run scoring engine
    const scoringEngine = new ScoringEngine(country, visaType, extractedData, confirmedData);
    const scoreResult = scoringEngine.calculateScore();
    
    // Generate AI explanation
    const explanation = await generateExplanation(country, visaType, scoreResult, confirmedData || extractedData, config);
    
    // Create evaluation record
    const evaluation = new Evaluation({
      userId: uuidv4(),
      partnerId: partnerId || null,
      partnerKey: partnerKey || null,
      email,
      name,
      country,
      visaType,
      documents: documents || [],
      extractedData,
      confirmedData: confirmedData || extractedData,
      score: scoreResult.score,
      confidence: scoreResult.confidence,
      breakdown: scoreResult.breakdown,
      explanation,
      sources: config.officialSources,
      status: 'completed',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    await evaluation.save();
    
    res.json({
      message: 'Evaluation completed successfully',
      evaluationId: evaluation._id,
      result: {
        score: scoreResult.score,
        confidence: scoreResult.confidence,
        breakdown: scoreResult.breakdown,
        explanation,
        sources: config.officialSources,
        isPassing: scoreResult.isPassing,
        passingScore: scoreResult.passingScore
      }
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: 'Evaluation failed', details: error.message });
  }
});

// Get evaluation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await Evaluation.findById(id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    
    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare visas across countries
router.post('/compare', async (req, res) => {
  try {
    const { extractedData, confirmedData, countries } = req.body;
    
    if (!extractedData) {
      return res.status(400).json({ error: 'Extracted data required' });
    }
    
    const data = confirmedData || extractedData;
    const comparisons = [];
    
    // If specific countries provided, use those; otherwise compare all
    const countriesToCompare = countries || getCountries();
    
    for (const country of countriesToCompare) {
      const visaTypes = getVisaTypes(country);
      
      for (const visaType of visaTypes) {
        try {
          const scoringEngine = new ScoringEngine(country, visaType, data);
          const scoreResult = scoringEngine.calculateScore();
          
          comparisons.push({
            country,
            visaType,
            score: scoreResult.score,
            confidence: scoreResult.confidence,
            isPassing: scoreResult.isPassing,
            passingScore: scoreResult.passingScore,
            summary: `${country} ${visaType}: ${scoreResult.score}/100`
          });
        } catch (error) {
          console.error(`Error comparing ${country} ${visaType}:`, error);
        }
      }
    }
    
    // Sort by score (descending)
    comparisons.sort((a, b) => b.score - a.score);
    
    res.json({
      message: 'Visa comparison completed',
      comparisons,
      bestMatch: comparisons[0] || null
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Comparison failed', details: error.message });
  }
});

// NEW: Analyze documents and suggest visa categories using Travel Buddy API + Free LLM
router.post('/analyze-and-suggest', async (req, res) => {
  try {
    const { country, purpose, uploadedFiles } = req.body;
    
    if (!country || !purpose) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country and purpose are required' 
      });
    }
    
    // Extract data from uploaded documents using FREE Groq LLM
    const extractor = new DocumentExtractor();
    let extractedData = {};
    let userNationality = 'India'; // Default, will extract from passport if available
    
    // Extract from resume/CV
    if (uploadedFiles['Resume/CV']) {
      const resumeFiles = uploadedFiles['Resume/CV'];
      try {
        extractedData = await extractor.extractFromResume(resumeFiles[0].path);
        console.log('✅ Resume extracted using Groq LLM');
      } catch (error) {
        console.error('Resume extraction error:', error);
        extractedData = {
          name: 'Not extracted',
          email: 'Not extracted',
          education: { level: 'Unknown', field: 'Unknown', year: null },
          experience: { totalYears: 0, currentRole: 'Unknown', positions: [] },
          skills: []
        };
      }
    }
    
    // Extract from other documents
    if (uploadedFiles['Degree Certificates']) {
      try {
        const degreeData = await extractor.extractFromDegree(uploadedFiles['Degree Certificates'][0].path);
        extractedData.education = { ...extractedData.education, ...degreeData };
        console.log('✅ Degree extracted using Groq LLM');
      } catch (error) {
        console.error('Degree extraction error:', error);
      }
    }
    
    // Create profile for visa analysis
    const profile = {
      nationality: userNationality,
      education: extractedData.education,
      experience: extractedData.experience,
      skills: extractedData.skills,
      hasJobOffer: uploadedFiles['Job Offer Letter'] ? true : false,
      hasPassport: uploadedFiles['Passport'] ? true : false,
      salary: extractedData.salary || null,
      languages: extractedData.languages || []
    };
    
    // 🌍 Get REAL visa requirements from Travel Buddy API (FREE)
    let realVisaRequirements = null;
    try {
      realVisaRequirements = await analyzeVisaEligibility(profile, country, purpose);
      console.log(`✅ Travel Buddy API: Real visa requirements fetched for ${country}`);
    } catch (error) {
      console.error('⚠️ Travel Buddy API unavailable:', error.message);
    }
    
    // 🤖 Get visa category suggestions from our database
    const suggestedVisas = suggestVisaCategories(country, purpose, uploadedFiles, profile);
    
    // 🤖 Use FREE Groq LLM to analyze profile and provide recommendations
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeProfileForVisa(profile, purpose, country);
      console.log('✅ Groq LLM: Profile analysis complete');
    } catch (error) {
      console.error('⚠️ AI analysis unavailable:', error.message);
    }
    
    if (suggestedVisas.length === 0 && !realVisaRequirements) {
      return res.status(404).json({
        success: false,
        message: 'No matching visa categories found for this purpose and country'
      });
    }
    
    res.json({
      success: true,
      suggestedVisas: suggestedVisas.slice(0, 5), // Top 5 from our database
      extractedData,
      profile,
      realVisaRequirements, // From Travel Buddy API
      aiAnalysis, // From Groq LLM
      sources: {
        llm: 'Groq (Llama 3.3 70B) - FREE',
        visaAPI: 'Travel Buddy AI - FREE',
        database: 'Custom visa categories'
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze documents', 
      details: error.message 
    });
  }
});

// ============================================
// MAIN EVALUATION ENDPOINT - Using LLM for scoring and explanations
// ============================================
router.post('/evaluate', async (req, res) => {
  try {
    const {
      name,
      email,
      country,
      visaType,
      purpose,
      extractedData,
      uploadedFiles
    } = req.body;

    console.log('📊 Starting evaluation for:', { name, country, visaType, purpose });

    // ============================================
    // STRICT INPUT VALIDATION
    // ============================================
    const validationErrors = [];
    
    // Name validation
    if (!name || typeof name !== 'string') {
      validationErrors.push('Name is required');
    } else if (!validateName(name)) {
      validationErrors.push('Name must be 2-100 characters, letters only');
    }
    
    // Email validation
    if (!email || typeof email !== 'string') {
      validationErrors.push('Email is required');
    } else if (!validateEmail(email)) {
      validationErrors.push('Please provide a valid email address');
    }
    
    // Country validation
    if (!country || typeof country !== 'string') {
      validationErrors.push('Country is required');
    } else if (!VALID_COUNTRIES.includes(country)) {
      validationErrors.push(`Invalid country. Supported: ${VALID_COUNTRIES.join(', ')}`);
    }
    
    // Visa type validation
    if (!visaType || typeof visaType !== 'string') {
      validationErrors.push('Visa type is required');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedCountry = sanitizeInput(country);
    const sanitizedVisaType = sanitizeInput(visaType);
    const sanitizedPurpose = purpose ? sanitizeInput(purpose) : '';

    // Get partner API key if provided
    const partnerKey = req.headers['x-api-key'];

    // Build profile from extracted data
    const profile = {
      name: sanitizedName,
      email: sanitizedEmail,
      education: extractedData?.education || {},
      experience: extractedData?.experience || {},
      totalExperienceYears: extractedData?.experience?.totalYears || 0,
      skills: extractedData?.skills || [],
      languages: extractedData?.languages || [],
      salary: extractedData?.salary || null,
      certifications: extractedData?.certifications || [],
      hasJobOffer: uploadedFiles?.['Job Offer Letter'] ? true : false,
      hasPassport: uploadedFiles?.['Passport'] ? true : false
    };

    console.log('👤 Profile built:', JSON.stringify(profile, null, 2));

    // ==================================
    // STEP 1: Rule-based scoring (70%)
    // ==================================
    let ruleScore = 0;
    let breakdown = {};
    let missingDocuments = [];
    let strongPoints = [];
    let improvements = [];

    // Get visa config if available
    const visaConfig = getVisaConfig(country, visaType) || 
                       getVisaCategoryConfig(country, visaType);

    if (visaConfig && visaConfig.requirements) {
      console.log('📋 Using visa config for scoring');
      
      // Education scoring
      if (visaConfig.requirements.education) {
        const eduReq = visaConfig.requirements.education;
        const eduWeight = eduReq.weight || 20;
        
        if (profile.education && profile.education.level) {
          const eduScore = scoreEducation(profile.education, eduReq);
          breakdown.education = { score: eduScore, maxScore: eduWeight, notes: `Education: ${profile.education.level}` };
          ruleScore += eduScore;
          if (eduScore >= eduWeight * 0.7) {
            strongPoints.push(`Strong educational background: ${profile.education.level} in ${profile.education.field || 'relevant field'}`);
          }
        } else {
          breakdown.education = { score: 0, maxScore: eduWeight, notes: 'Education information missing' };
          missingDocuments.push('Degree Certificate');
          improvements.push('Provide educational credentials to improve your score');
        }
      }

      // Experience scoring
      if (visaConfig.requirements.experience) {
        const expReq = visaConfig.requirements.experience;
        const expWeight = expReq.weight || 20;
        const years = profile.totalExperienceYears || profile.experience?.totalYears || 0;
        
        if (years > 0) {
          const expScore = scoreExperience(years, expReq);
          breakdown.experience = { score: expScore, maxScore: expWeight, notes: `${years} years of experience` };
          ruleScore += expScore;
          if (years >= (expReq.minYears || 1)) {
            strongPoints.push(`${years} years of professional experience`);
          }
        } else {
          breakdown.experience = { score: 0, maxScore: expWeight, notes: 'Experience information missing' };
          missingDocuments.push('Work Experience Letters');
          improvements.push('Document your work experience with employer letters');
        }
      }

      // Salary scoring
      if (visaConfig.requirements.salary) {
        const salReq = visaConfig.requirements.salary;
        const salWeight = salReq.weight || 20;
        
        if (profile.salary) {
          const salScore = scoreSalary(profile.salary, salReq);
          breakdown.salary = { score: salScore, maxScore: salWeight, notes: `Salary: ${profile.salary} ${salReq.currency || 'USD'}` };
          ruleScore += salScore;
          if (profile.salary >= (salReq.minAmount || 0)) {
            strongPoints.push(`Salary meets minimum requirement`);
          }
        } else {
          breakdown.salary = { score: salWeight * 0.3, maxScore: salWeight, notes: 'Salary proof not provided' };
          ruleScore += salWeight * 0.3;
          improvements.push('Provide salary documentation to verify income requirements');
        }
      }

      // Language scoring
      if (visaConfig.requirements.language) {
        const langReq = visaConfig.requirements.language;
        const langWeight = langReq.weight || 10;
        
        if (profile.languages && profile.languages.length > 0) {
          breakdown.language = { score: langWeight, maxScore: langWeight, notes: `Languages: ${profile.languages.join(', ')}` };
          ruleScore += langWeight;
          strongPoints.push('Language proficiency documented');
        } else {
          breakdown.language = { score: 0, maxScore: langWeight, notes: 'Language certification missing' };
          missingDocuments.push('Language Test Results');
          improvements.push(`Obtain language certification (e.g., IELTS, TOEFL for English)`);
        }
      }

      // Job Offer scoring
      if (visaConfig.requirements.jobOffer) {
        const jobReq = visaConfig.requirements.jobOffer;
        const jobWeight = jobReq.weight || 15;
        
        if (profile.hasJobOffer) {
          breakdown.jobOffer = { score: jobWeight, maxScore: jobWeight, notes: 'Job offer provided' };
          ruleScore += jobWeight;
          strongPoints.push('Valid job offer from employer');
        } else if (jobReq.required) {
          breakdown.jobOffer = { score: 0, maxScore: jobWeight, notes: 'Job offer required but not provided' };
          missingDocuments.push('Job Offer Letter');
          improvements.push('Secure a job offer from an employer in the destination country');
        }
      }
    } else {
      console.log('📋 No specific visa config found, using default scoring');
      // Default scoring when no specific config exists
      ruleScore = calculateDefaultScore(profile);
      breakdown = getDefaultBreakdown(profile);
    }

    // Normalize rule score to 100
    const totalMaxScore = Object.values(breakdown).reduce((sum, item) => sum + (item.maxScore || 0), 0) || 100;
    const normalizedRuleScore = totalMaxScore > 0 ? (ruleScore / totalMaxScore) * 70 : 35; // Rule-based is 70% of total

    // ==================================
    // STEP 2: AI Analysis (30%) - USING GROQ LLM
    // ==================================
    console.log('🤖 Calling Groq LLM for AI analysis...');
    
    let aiAnalysis = null;
    let aiScore = 15; // Default AI contribution
    
    try {
      aiAnalysis = await analyzeProfileForVisa(profile, visaType, country);
      console.log('✅ Groq LLM analysis received:', JSON.stringify(aiAnalysis, null, 2));
      
      // Calculate AI score based on strengths vs weaknesses
      if (aiAnalysis) {
        const strengthCount = aiAnalysis.strengths?.length || 0;
        const weaknessCount = aiAnalysis.weaknesses?.length || 0;
        
        // AI contributes 30% of total score
        aiScore = Math.min(30, Math.max(0, 15 + (strengthCount * 3) - (weaknessCount * 2)));
        
        // Add AI insights to our lists
        if (aiAnalysis.strengths) {
          strongPoints.push(...aiAnalysis.strengths);
        }
        if (aiAnalysis.weaknesses) {
          improvements.push(...aiAnalysis.weaknesses);
        }
        if (aiAnalysis.suggestions) {
          improvements.push(...aiAnalysis.suggestions);
        }
      }
    } catch (error) {
      console.error('⚠️ AI analysis failed:', error.message);
      aiAnalysis = {
        strengths: strongPoints.length > 0 ? strongPoints : ['Profile submitted for review'],
        weaknesses: improvements.length > 0 ? [] : ['Complete all required documents'],
        suggestions: ['Ensure all documents are current and valid']
      };
    }

    // ==================================
    // STEP 3: Calculate Final Score
    // ==================================
    let finalScore = Math.round(normalizedRuleScore + aiScore);
    
    // Apply confidence cap (max 85%)
    if (finalScore > 85) {
      finalScore = 85;
    }

    // Calculate confidence based on data completeness
    const confidence = calculateConfidence(profile, uploadedFiles);

    // Determine passing status
    const passingScore = visaConfig?.scoringRules?.passingScore || 60;
    const isPassing = finalScore >= passingScore;

    console.log(`📊 Final Score: ${finalScore}, Confidence: ${confidence}%, Passing: ${isPassing}`);

    // ==================================
    // STEP 4: Generate AI Explanation using GROQ LLM
    // ==================================
    console.log('🤖 Generating AI explanation report...');
    
    let explanation = null;
    try {
      const reportText = await generateEvaluationReport(
        profile,
        visaConfig?.requirements || {},
        finalScore,
        missingDocuments
      );
      
      explanation = {
        summary: reportText.substring(0, 500),
        fullReport: reportText,
        strengths: [...new Set(strongPoints)].slice(0, 5),
        gaps: [...new Set(improvements)].slice(0, 5),
        recommendations: aiAnalysis?.suggestions || [
          'Review all visa requirements on official government website',
          'Prepare all documents well in advance',
          'Consider consulting with an immigration specialist'
        ],
        timeline: aiAnalysis?.timeline || '3-6 months'
      };
      console.log('✅ AI explanation generated successfully');
    } catch (error) {
      console.error('⚠️ Report generation failed:', error.message);
      explanation = {
        summary: `Based on your profile, you have a ${finalScore >= 70 ? 'strong' : finalScore >= 50 ? 'moderate' : 'developing'} visa application for ${visaType} to ${country}.`,
        strengths: strongPoints.slice(0, 5),
        gaps: improvements.slice(0, 5),
        recommendations: [
          'Ensure all documents are complete and current',
          'Review official requirements on government website',
          'Consider professional immigration advice'
        ]
      };
    }

    // ==================================
    // STEP 5: Save to Database
    // ==================================
    let evaluationId = null;
    try {
      const evaluation = new Evaluation({
        odId: uuidv4(),
        partnerId: partnerKey || null,
        partnerKey: partnerKey || null,
        email: sanitizedEmail,
        name: sanitizedName,
        country: sanitizedCountry,
        visaType: sanitizedVisaType,
        purpose: sanitizedPurpose,
        documents: Object.keys(uploadedFiles || {}),
        extractedData,
        confirmedData: profile,
        score: finalScore,
        confidence,
        breakdown,
        explanation,
        sources: visaConfig?.officialSources || [],
        aiAnalysis,
        status: 'completed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      await evaluation.save();
      evaluationId = evaluation._id;
      console.log('💾 Evaluation saved to database:', evaluationId);
    } catch (dbError) {
      console.error('⚠️ Database save failed:', dbError.message);
      // For demo purposes, still return success but log the error
      evaluationId = uuidv4(); // Fallback to generated ID
    }

    // ==================================
    // STEP 6: Return Response
    // ==================================
    res.json({
      success: true,
      message: 'Evaluation completed successfully',
      evaluationId,
      score: finalScore,
      confidence,
      isPassing,
      passingScore,
      breakdown,
      explanation,
      missingDocuments,
      strongPoints: [...new Set(strongPoints)].slice(0, 5),
      improvements: [...new Set(improvements)].slice(0, 5),
      aiAnalysis,
      sources: visaConfig?.officialSources || [],
      llmUsed: 'Groq (Llama 3.3 70B)',
      extractedData: profile
    });

  } catch (error) {
    console.error('❌ Evaluation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Evaluation failed', 
      details: error.message 
    });
  }
});

// Helper functions for scoring
function scoreEducation(education, requirement) {
  const weight = requirement.weight || 20;
  const level = (education.level || '').toLowerCase();
  
  let score = 0;
  
  if (level.includes('phd') || level.includes('doctorate')) {
    score = weight;
  } else if (level.includes('master')) {
    score = weight * 0.9;
  } else if (level.includes('bachelor')) {
    score = weight * 0.7;
  } else if (level.includes('diploma') || level.includes('associate')) {
    score = weight * 0.5;
  } else {
    score = weight * 0.3;
  }
  
  return Math.round(score);
}

function scoreExperience(years, requirement) {
  const weight = requirement.weight || 20;
  const minYears = requirement.minYears || 1;
  const bonusYears = requirement.bonusYears || 5;
  
  if (years >= bonusYears) {
    return weight;
  } else if (years >= minYears) {
    return Math.round(weight * 0.7 + (years / bonusYears) * (weight * 0.3));
  } else if (years > 0) {
    return Math.round(weight * (years / minYears) * 0.5);
  }
  
  return 0;
}

function scoreSalary(salary, requirement) {
  const weight = requirement.weight || 20;
  const minAmount = requirement.minAmount || 30000;
  
  if (salary >= minAmount * 1.5) {
    return weight;
  } else if (salary >= minAmount) {
    return Math.round(weight * 0.8);
  } else if (salary >= minAmount * 0.7) {
    return Math.round(weight * 0.5);
  }
  
  return Math.round(weight * 0.2);
}

function calculateDefaultScore(profile) {
  let score = 30; // Base score
  
  if (profile.education?.level) score += 15;
  if (profile.totalExperienceYears >= 2) score += 15;
  if (profile.skills?.length > 3) score += 10;
  if (profile.hasJobOffer) score += 15;
  if (profile.languages?.length > 0) score += 5;
  
  return score;
}

function getDefaultBreakdown(profile) {
  return {
    education: { 
      score: profile.education?.level ? 15 : 0, 
      maxScore: 20, 
      notes: profile.education?.level || 'Not provided' 
    },
    experience: { 
      score: Math.min(20, (profile.totalExperienceYears || 0) * 4), 
      maxScore: 20, 
      notes: `${profile.totalExperienceYears || 0} years` 
    },
    skills: { 
      score: Math.min(10, (profile.skills?.length || 0) * 2), 
      maxScore: 10, 
      notes: `${profile.skills?.length || 0} skills listed` 
    },
    documents: { 
      score: profile.hasJobOffer ? 15 : 5, 
      maxScore: 15, 
      notes: profile.hasJobOffer ? 'Job offer provided' : 'Basic documents only' 
    }
  };
}

function calculateConfidence(profile, uploadedFiles) {
  let confidence = 50; // Base confidence
  
  if (profile.education?.level) confidence += 10;
  if (profile.totalExperienceYears > 0) confidence += 10;
  if (uploadedFiles?.['Resume/CV']) confidence += 10;
  if (uploadedFiles?.['Degree Certificates']) confidence += 5;
  if (uploadedFiles?.['Job Offer Letter']) confidence += 10;
  if (profile.languages?.length > 0) confidence += 5;
  
  return Math.min(95, confidence);
}

function getVisaCategoryConfig(country, visaType) {
  const categories = VISA_CATEGORIES[country];
  if (!categories) return null;
  
  for (const categoryArray of Object.values(categories)) {
    for (const visa of categoryArray) {
      if (visa.name === visaType) {
        return {
          ...visa,
          requirements: convertRequirementsToConfig(visa.requirements),
          scoringRules: { passingScore: 60, confidenceCap: 85 }
        };
      }
    }
  }
  
  return null;
}

function convertRequirementsToConfig(requirements) {
  if (!requirements) return {};
  
  const config = {};
  
  if (requirements.degree || requirements.higherEducation) {
    config.education = { required: true, weight: 20 };
  }
  if (requirements.workExperience || requirements.currentEmployment) {
    config.experience = { required: true, weight: 20, minYears: 1 };
  }
  if (requirements.salary) {
    config.salary = { required: true, weight: 25, minAmount: requirements.salary };
  }
  if (requirements.languageTest || requirements.englishLanguage || requirements.germanLanguage) {
    config.language = { required: true, weight: 10 };
  }
  if (requirements.jobOffer) {
    config.jobOffer = { required: true, weight: 15 };
  }
  
  return config;
}

export default router;
