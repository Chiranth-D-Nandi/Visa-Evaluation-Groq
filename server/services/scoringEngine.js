/**
 * PRODUCTION-GRADE VISA SCORING ENGINE
 * 
 * This engine evaluates visa eligibility based on:
 * 1. REAL official government requirements
 * 2. Extracted document data (verified by LLM)
 * 3. Weighted scoring based on actual visa criteria
 * 
 * NO RANDOM NUMBERS - Every score is justified and traceable
 */

import { VISA_CONFIGS, getVisaConfig } from '../config/visaConfigs.js';
import { VISA_CATEGORIES } from '../config/visaCategoriesByPurpose.js';

/**
 * OFFICIAL VISA REQUIREMENTS DATABASE
 * Based on real government requirements as of 2024
 */
const OFFICIAL_REQUIREMENTS = {
  Germany: {
    'EU Blue Card': {
      // https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card
      education: {
        required: true,
        minLevel: 'bachelors',
        mustBeRecognized: true,
        weight: 25,
        failIfMissing: true,
        capIfMissing: 30
      },
      salary: {
        required: true,
        minAmount: 45300, // EUR per year (2024 regular)
        shortageOccupationMin: 41041.80, // EUR for shortage occupations
        currency: 'EUR',
        weight: 30,
        failIfBelow: true,
        capIfBelow: 40
      },
      jobOffer: {
        required: true,
        weight: 25,
        mustBeInGermany: true,
        failIfMissing: true
      },
      experience: {
        required: false,
        recommended: 3,
        weight: 10
      },
      language: {
        required: false,
        recommended: 'B1',
        weight: 10
      }
    },
    'Job Seeker Visa': {
      education: {
        required: true,
        minLevel: 'bachelors',
        weight: 35
      },
      experience: {
        required: false,
        recommended: 5,
        weight: 25
      },
      financialProof: {
        required: true,
        minAmount: 11208,
        currency: 'EUR',
        weight: 20
      },
      language: {
        required: false,
        recommended: 'B1',
        weight: 20
      }
    }
  },
  
  Canada: {
    'Express Entry': {
      // https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html
      age: {
        required: true,
        optimalRange: [20, 29],
        maxAge: 45,
        weight: 12
      },
      education: {
        required: true,
        minLevel: 'highschool',
        weight: 25,
        bonusForMasters: 5,
        bonusForPhD: 10
      },
      language: {
        required: true,
        minCLB: 7,
        weight: 28,
        failIfBelow: true
      },
      experience: {
        required: true,
        minYears: 1,
        weight: 25,
        mustBeNOC: true
      },
      jobOffer: {
        required: false,
        bonusPoints: 50,
        weight: 10
      }
    },
    'Study Permit': {
      letterOfAcceptance: {
        required: true,
        mustBeDLI: true,
        weight: 40
      },
      financialProof: {
        required: true,
        minAmount: 10000,
        currency: 'CAD',
        weight: 30
      },
      language: {
        required: true,
        minIELTS: 6.0,
        weight: 20
      },
      ties: {
        required: true,
        weight: 10
      }
    }
  },
  
  Ireland: {
    'Critical Skills Employment Permit': {
      // https://enterprise.gov.ie/en/What-We-Do/Workplace-and-Skills/Employment-Permits/Permit-Types/Critical-Skills-Employment-Permit/
      jobOffer: {
        required: true,
        weight: 30,
        mustBeCriticalSkills: true
      },
      salary: {
        required: true,
        minAmount: 32000, // EUR for most roles
        highSkillMin: 64000, // EUR for high-skill fast track
        currency: 'EUR',
        weight: 30
      },
      education: {
        required: true,
        minLevel: 'bachelors',
        mustBeRelevant: true,
        weight: 25
      },
      experience: {
        required: false,
        recommended: 2,
        weight: 15
      }
    }
  },
  
  Netherlands: {
    'Highly Skilled Migrant': {
      // https://ind.nl/en/work/working_in_the_Netherlands/Pages/Highly-skilled-migrant.aspx
      salary: {
        required: true,
        under30: 3549, // EUR/month
        over30: 4840, // EUR/month
        currency: 'EUR',
        frequency: 'monthly',
        weight: 35
      },
      employer: {
        required: true,
        mustBeRecognizedSponsor: true,
        weight: 35
      },
      education: {
        required: false,
        weight: 15
      },
      experience: {
        required: false,
        weight: 15
      }
    }
  },
  
  Australia: {
    'Skilled Independent (189)': {
      // https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189
      age: {
        required: true,
        maxAge: 45,
        weight: 15
      },
      education: {
        required: true,
        minLevel: 'diploma',
        weight: 20
      },
      experience: {
        required: true,
        minYears: 3,
        weight: 20
      },
      language: {
        required: true,
        minIELTS: 6.0,
        competentPlus: 7.0,
        proficient: 8.0,
        weight: 20
      },
      skillsAssessment: {
        required: true,
        mustBePositive: true,
        weight: 25
      }
    }
  },
  
  UK: {
    'Skilled Worker Visa': {
      // https://www.gov.uk/skilled-worker-visa
      jobOffer: {
        required: true,
        mustHaveCoS: true,
        weight: 30
      },
      salary: {
        required: true,
        minAmount: 26200, // GBP per year (general)
        goingRate: true,
        currency: 'GBP',
        weight: 25
      },
      skillLevel: {
        required: true,
        minRQF: 3,
        weight: 20
      },
      language: {
        required: true,
        minCEFR: 'B1',
        weight: 15
      },
      sponsorship: {
        required: true,
        weight: 10
      }
    }
  }
};

/**
 * MAIN SCORING ENGINE CLASS
 */
export class ScoringEngine {
  constructor(country, visaType, profile, extractionResults = null) {
    this.country = country;
    this.visaType = visaType;
    this.profile = profile;
    this.extractionResults = extractionResults;
    
    // Get official requirements
    this.requirements = this.getRequirements();
    
    // Scoring breakdown
    this.breakdown = {};
    this.failedRequirements = [];
    this.metRequirements = [];
    this.warnings = [];
    
    // Logging for transparency
    this.scoringLog = [];
  }

  log(message) {
    this.scoringLog.push({
      timestamp: new Date().toISOString(),
      message
    });
  }

  /**
   * Get requirements for this visa type
   */
  getRequirements() {
    // First try our official requirements
    if (OFFICIAL_REQUIREMENTS[this.country]?.[this.visaType]) {
      return OFFICIAL_REQUIREMENTS[this.country][this.visaType];
    }
    
    // Fall back to config files
    const config = getVisaConfig(this.country, this.visaType);
    if (config?.requirements) {
      return config.requirements;
    }
    
    // Search in VISA_CATEGORIES
    const categories = VISA_CATEGORIES[this.country];
    if (categories) {
      for (const categoryArray of Object.values(categories)) {
        for (const visa of categoryArray) {
          if (visa.name === this.visaType && visa.requirements) {
            return this.convertToScoringFormat(visa.requirements);
          }
        }
      }
    }
    
    this.log(`Warning: No specific requirements found for ${this.country} - ${this.visaType}`);
    return this.getDefaultRequirements();
  }

  /**
   * Convert basic requirements to scoring format
   */
  convertToScoringFormat(basicReqs) {
    const scoring = {};
    
    if (basicReqs.degree || basicReqs.higherEducation) {
      scoring.education = {
        required: true,
        minLevel: 'bachelors',
        weight: 25
      };
    }
    
    if (basicReqs.salary) {
      scoring.salary = {
        required: true,
        minAmount: typeof basicReqs.salary === 'number' ? basicReqs.salary : 30000,
        weight: 25
      };
    }
    
    if (basicReqs.jobOffer) {
      scoring.jobOffer = {
        required: basicReqs.jobOffer === true,
        weight: 25
      };
    }
    
    if (basicReqs.workExperience || basicReqs.currentEmployment) {
      scoring.experience = {
        required: true,
        minYears: 1,
        weight: 15
      };
    }
    
    if (basicReqs.languageTest || basicReqs.englishLanguage || basicReqs.germanLanguage) {
      scoring.language = {
        required: true,
        weight: 10
      };
    }
    
    return scoring;
  }

  /**
   * Default requirements for unknown visas
   */
  getDefaultRequirements() {
    return {
      education: { required: false, weight: 25 },
      experience: { required: false, weight: 25 },
      language: { required: false, weight: 20 },
      jobOffer: { required: false, weight: 15 },
      financialProof: { required: false, weight: 15 }
    };
  }

  /**
   * MAIN SCORING METHOD
   */
  calculateScore() {
    this.log(`Starting evaluation for ${this.country} - ${this.visaType}`);
    
    let totalScore = 0;
    let totalWeight = 0;
    let hardFails = [];
    let scoreCap = 100;

    // Score each requirement
    if (this.requirements.education) {
      const result = this.scoreEducation();
      this.breakdown.education = result;
      totalScore += result.score;
      totalWeight += result.maxScore;
      if (result.hardFail) hardFails.push(result.hardFail);
      if (result.scoreCap) scoreCap = Math.min(scoreCap, result.scoreCap);
    }

    if (this.requirements.experience) {
      const result = this.scoreExperience();
      this.breakdown.experience = result;
      totalScore += result.score;
      totalWeight += result.maxScore;
    }

    if (this.requirements.salary) {
      const result = this.scoreSalary();
      this.breakdown.salary = result;
      totalScore += result.score;
      totalWeight += result.maxScore;
      if (result.hardFail) hardFails.push(result.hardFail);
      if (result.scoreCap) scoreCap = Math.min(scoreCap, result.scoreCap);
    }

    if (this.requirements.jobOffer) {
      const result = this.scoreJobOffer();
      this.breakdown.jobOffer = result;
      totalScore += result.score;
      totalWeight += result.maxScore;
      if (result.hardFail) hardFails.push(result.hardFail);
    }

    if (this.requirements.language) {
      const result = this.scoreLanguage();
      this.breakdown.language = result;
      totalScore += result.score;
      totalWeight += result.maxScore;
      if (result.hardFail) hardFails.push(result.hardFail);
    }

    if (this.requirements.age) {
      const result = this.scoreAge();
      this.breakdown.age = result;
      totalScore += result.score;
      totalWeight += result.maxScore;
    }

    // Calculate normalized score
    let normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    
    // Apply score cap from hard fails
    if (hardFails.length > 0 && normalizedScore > scoreCap) {
      normalizedScore = scoreCap;
      this.log(`Score capped at ${scoreCap} due to: ${hardFails.join(', ')}`);
    }
    
    // Apply 85% confidence cap
    if (normalizedScore > 85) {
      normalizedScore = 85;
      this.log('Score capped at 85% (maximum confidence limit)');
    }

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence();
    
    // Determine pass/fail
    const passingScore = this.getPassingScore();
    const isPassing = normalizedScore >= passingScore;

    this.log(`Final score: ${Math.round(normalizedScore)}, Confidence: ${confidence}%, Passing: ${isPassing}`);

    return {
      score: Math.round(normalizedScore),
      confidence,
      breakdown: this.breakdown,
      hardFails,
      passingScore,
      isPassing,
      metRequirements: this.metRequirements,
      failedRequirements: this.failedRequirements,
      warnings: this.warnings,
      scoringLog: this.scoringLog
    };
  }

  /**
   * EDUCATION SCORING
   */
  scoreEducation() {
    const req = this.requirements.education;
    const weight = req.weight || 25;
    const education = this.profile.education || {};
    
    const result = {
      category: 'Education',
      score: 0,
      maxScore: weight,
      notes: [],
      verified: education.verified || false,
      hardFail: null,
      scoreCap: null
    };

    // Get education level
    const level = (education.level || '').toLowerCase();
    const levelRanking = {
      'phd': 5, 'doctorate': 5,
      'master': 4, 'masters': 4, 'mba': 4, 'msc': 4,
      'bachelor': 3, 'bachelors': 3, 'bsc': 3, 'ba': 3, 'btech': 3,
      'diploma': 2, 'associate': 2,
      'highschool': 1, 'high school': 1
    };

    let currentLevel = 0;
    for (const [key, value] of Object.entries(levelRanking)) {
      if (level.includes(key)) {
        currentLevel = Math.max(currentLevel, value);
      }
    }

    // Check if education meets minimum
    const minLevels = { 'phd': 5, 'masters': 4, 'bachelors': 3, 'diploma': 2, 'highschool': 1 };
    const requiredLevel = minLevels[req.minLevel] || 0;

    if (!level || currentLevel === 0) {
      if (req.required) {
        result.hardFail = 'Missing required education credentials';
        result.scoreCap = req.capIfMissing || 30;
        result.notes.push('❌ Education credentials not provided or not extracted');
        this.failedRequirements.push('Education documentation');
      }
      return result;
    }

    if (currentLevel >= requiredLevel) {
      result.score = weight * 0.8; // Base 80% for meeting minimum
      result.notes.push(`✅ ${education.level} meets ${req.minLevel || 'education'} requirement`);
      this.metRequirements.push(`Education: ${education.level}`);
      
      // Bonus for higher education
      if (currentLevel === 5) {
        result.score = weight;
        result.notes.push('🎓 PhD/Doctorate - Maximum education points');
      } else if (currentLevel === 4) {
        result.score = weight * 0.95;
        result.notes.push('🎓 Master\'s degree - High education score');
      }
      
      // Institution bonus
      if (education.institution) {
        result.score = Math.min(weight, result.score + weight * 0.1);
        result.notes.push(`📍 Institution: ${education.institution}`);
      }
      
      // Field relevance
      if (education.field) {
        result.notes.push(`📚 Field: ${education.field}`);
      }
    } else {
      result.score = weight * 0.3;
      result.notes.push(`⚠️ ${education.level} below required ${req.minLevel}`);
      if (req.failIfMissing) {
        result.scoreCap = req.capIfMissing || 40;
      }
    }

    return result;
  }

  /**
   * EXPERIENCE SCORING
   */
  scoreExperience() {
    const req = this.requirements.experience;
    const weight = req.weight || 20;
    const experience = this.profile.experience || {};
    const years = experience.totalYears || this.profile.totalExperienceYears || 0;
    
    const result = {
      category: 'Work Experience',
      score: 0,
      maxScore: weight,
      notes: [],
      hardFail: null
    };

    if (years === 0 && req.required) {
      result.notes.push('❌ Work experience not documented');
      this.failedRequirements.push('Work experience documentation');
      return result;
    }

    const minYears = req.minYears || 0;
    const recommended = req.recommended || 5;

    if (years >= recommended) {
      result.score = weight;
      result.notes.push(`✅ ${years} years - Exceeds recommended ${recommended} years`);
      this.metRequirements.push(`Experience: ${years} years`);
    } else if (years >= minYears) {
      const ratio = (years - minYears) / (recommended - minYears);
      result.score = weight * (0.6 + ratio * 0.4);
      result.notes.push(`✅ ${years} years - Meets minimum ${minYears} years`);
      this.metRequirements.push(`Experience: ${years} years`);
    } else if (years > 0) {
      result.score = weight * (years / minYears) * 0.5;
      result.notes.push(`⚠️ ${years} years - Below minimum ${minYears} years`);
    }

    // Add current role info
    if (experience.currentRole) {
      result.notes.push(`💼 Current: ${experience.currentRole}`);
    }
    if (experience.currentCompany) {
      result.notes.push(`🏢 Company: ${experience.currentCompany}`);
    }

    return result;
  }

  /**
   * SALARY SCORING
   */
  scoreSalary() {
    const req = this.requirements.salary;
    const weight = req.weight || 25;
    const salary = this.profile.salary || {};
    
    const result = {
      category: 'Salary',
      score: 0,
      maxScore: weight,
      notes: [],
      verified: salary.verified || false,
      hardFail: null,
      scoreCap: null
    };

    const amount = typeof salary === 'number' ? salary : salary.amount;
    const currency = salary.currency || req.currency || 'EUR';

    if (!amount) {
      if (req.required) {
        result.notes.push('⚠️ Salary information not verified');
        result.score = weight * 0.3; // Partial score - they might meet it
        this.warnings.push('Salary verification recommended');
      }
      return result;
    }

    const minAmount = req.minAmount || 30000;
    
    // Check against minimum
    if (amount >= minAmount * 1.5) {
      result.score = weight;
      result.notes.push(`✅ ${currency} ${amount.toLocaleString()} - Significantly exceeds minimum ${currency} ${minAmount.toLocaleString()}`);
      this.metRequirements.push(`Salary: ${currency} ${amount.toLocaleString()}`);
    } else if (amount >= minAmount) {
      result.score = weight * 0.9;
      result.notes.push(`✅ ${currency} ${amount.toLocaleString()} - Meets minimum ${currency} ${minAmount.toLocaleString()}`);
      this.metRequirements.push(`Salary: ${currency} ${amount.toLocaleString()}`);
    } else if (amount >= minAmount * 0.8) {
      result.score = weight * 0.5;
      result.notes.push(`⚠️ ${currency} ${amount.toLocaleString()} - Slightly below minimum ${currency} ${minAmount.toLocaleString()}`);
      this.warnings.push(`Salary ${currency} ${amount.toLocaleString()} is below minimum ${currency} ${minAmount.toLocaleString()}`);
    } else {
      result.score = weight * 0.2;
      result.notes.push(`❌ ${currency} ${amount.toLocaleString()} - Below minimum ${currency} ${minAmount.toLocaleString()}`);
      if (req.failIfBelow) {
        result.scoreCap = req.capIfBelow || 40;
      }
      this.failedRequirements.push(`Salary below ${currency} ${minAmount.toLocaleString()} threshold`);
    }

    return result;
  }

  /**
   * JOB OFFER SCORING
   */
  scoreJobOffer() {
    const req = this.requirements.jobOffer;
    const weight = req.weight || 20;
    const jobOffer = this.profile.jobOffer || {};
    const hasOffer = jobOffer.hasOffer || this.profile.hasJobOffer;
    
    const result = {
      category: 'Job Offer',
      score: 0,
      maxScore: weight,
      notes: [],
      verified: jobOffer.verified || false,
      hardFail: null
    };

    if (hasOffer) {
      result.score = weight;
      result.notes.push('✅ Job offer provided');
      this.metRequirements.push('Job offer from employer');
      
      if (jobOffer.company) {
        result.notes.push(`🏢 Employer: ${jobOffer.company}`);
      }
      if (jobOffer.position) {
        result.notes.push(`💼 Position: ${jobOffer.position}`);
      }
      if (jobOffer.salary) {
        result.notes.push(`💰 Offered salary: ${jobOffer.currency || ''} ${jobOffer.salary?.toLocaleString() || jobOffer.salary}`);
      }
    } else if (req.required) {
      result.hardFail = 'Job offer required but not provided';
      result.notes.push('❌ Job offer required but not provided');
      this.failedRequirements.push('Job offer from employer');
    } else {
      result.notes.push('ℹ️ Job offer not required but would strengthen application');
    }

    return result;
  }

  /**
   * LANGUAGE SCORING
   */
  scoreLanguage() {
    const req = this.requirements.language;
    const weight = req.weight || 15;
    const languages = this.profile.languages || [];
    
    const result = {
      category: 'Language Proficiency',
      score: 0,
      maxScore: weight,
      notes: [],
      verified: false,
      hardFail: null
    };

    // Check for verified language certificates
    const verifiedLang = languages.find(l => l.verified);
    
    if (verifiedLang) {
      result.verified = true;
      result.score = weight;
      result.notes.push(`✅ ${verifiedLang.testType || 'Language'}: ${verifiedLang.proficiency || verifiedLang.score}`);
      this.metRequirements.push(`Language: ${verifiedLang.language} ${verifiedLang.proficiency || verifiedLang.score}`);
      
      // Check specific scores
      if (verifiedLang.score) {
        const score = parseFloat(verifiedLang.score);
        if (score >= 8.0) {
          result.notes.push('🌟 Excellent language proficiency');
        } else if (score >= 7.0) {
          result.notes.push('✅ Good language proficiency');
        } else if (score >= 6.0) {
          result.notes.push('✅ Competent language proficiency');
        }
      }
    } else if (languages.length > 0) {
      result.score = weight * 0.5;
      result.notes.push(`ℹ️ Languages: ${languages.map(l => l.language || l).join(', ')} (unverified)`);
      this.warnings.push('Language certification recommended for verification');
    } else if (req.required) {
      result.hardFail = 'Language certification required';
      result.notes.push('❌ Language certification required');
      this.failedRequirements.push('Language proficiency certificate');
    } else {
      result.notes.push('ℹ️ Language certification would strengthen application');
    }

    return result;
  }

  /**
   * AGE SCORING (for points-based systems)
   */
  scoreAge() {
    const req = this.requirements.age;
    const weight = req.weight || 10;
    
    const result = {
      category: 'Age',
      score: weight * 0.7, // Default score without age info
      maxScore: weight,
      notes: ['ℹ️ Age not provided - using neutral score']
    };

    // Age would be extracted from passport if available
    // For now, give partial credit

    return result;
  }

  /**
   * Calculate confidence based on data quality
   */
  calculateConfidence() {
    let confidence = 50; // Base confidence
    
    // Verified documents increase confidence
    if (this.profile.education?.verified) confidence += 10;
    if (this.profile.salary?.verified) confidence += 10;
    if (this.profile.jobOffer?.hasOffer) confidence += 10;
    if (this.profile.languages?.some(l => l.verified)) confidence += 5;
    
    // Data completeness
    if (this.profile.experience?.totalYears > 0) confidence += 5;
    if (this.profile.skills?.all?.length > 3) confidence += 5;
    
    // Extraction quality from results
    if (this.extractionResults) {
      const quality = this.extractionResults.consolidatedProfile?.dataQuality;
      if (quality) {
        confidence = Math.max(confidence, quality.overallConfidence);
      }
    }

    return Math.min(95, confidence);
  }

  /**
   * Get passing score for this visa type
   */
  getPassingScore() {
    // Different visas have different passing thresholds
    const passingScores = {
      'Express Entry': 67,
      'EU Blue Card': 60,
      'Critical Skills Employment Permit': 60,
      'Skilled Independent (189)': 65,
      'Skilled Worker Visa': 70
    };

    return passingScores[this.visaType] || 60;
  }
}

export default ScoringEngine;
