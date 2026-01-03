import axios from 'axios';

/**
 * Travel Buddy AI - Free Visa Requirements API
 * - FREE tier: 120 requests/month (no credit card)
 * - 200+ passports, 210+ destinations
 * - Real-time visa rules, embassy links, eVisa portals
 * 
 * Get free API key: https://rapidapi.com/TravelBuddyAI/api/visa-requirement
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'visa-requirement.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

/**
 * Country code mappings (ISO Alpha-2)
 */
const COUNTRY_CODES = {
  'Germany': 'DE',
  'Canada': 'CA',
  'Ireland': 'IE',
  'Netherlands': 'NL',
  'Australia': 'AU',
  'Poland': 'PL',
  'France': 'FR',
  'Italy': 'IT',
  'UK': 'GB',
  'United Kingdom': 'GB',
  'USA': 'US',
  'United States': 'US'
};

/**
 * Check visa requirements for a specific passport-destination pair
 * @param {string} passportCountry - User's passport country
 * @param {string} destinationCountry - Destination country
 * @returns {Object} Visa requirements data
 */
export async function checkVisaRequirements(passportCountry, destinationCountry) {
  if (!RAPIDAPI_KEY) {
    console.warn('⚠️ RAPIDAPI_KEY not set. Using mock visa data.');
    return getMockVisaRequirements(destinationCountry);
  }

  try {
    const passportCode = COUNTRY_CODES[passportCountry] || passportCountry;
    const destinationCode = COUNTRY_CODES[destinationCountry] || destinationCountry;

    const response = await axios.post(
      `${BASE_URL}/v2/visa/check`,
      {
        passport: passportCode,
        destination: destinationCode
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    const data = response.data.data;
    
    console.log(`✅ Travel Buddy: Visa requirements fetched for ${passportCountry} → ${destinationCountry}`);
    
    return {
      destination: {
        code: data.destination.code,
        name: data.destination.name,
        continent: data.destination.continent,
        capital: data.destination.capital,
        currency: data.destination.currency,
        phone_code: data.destination.phone_code,
        passport_validity: data.destination.passport_validity,
        embassy_url: data.destination.embassy_url
      },
      visa_rules: {
        primary: data.visa_rules.primary_rule,
        secondary: data.visa_rules.secondary_rule,
        exception: data.visa_rules.exception_rule,
        color: data.visa_rules.primary_rule.color // green, blue, yellow, red
      },
      mandatory_registration: data.mandatory_registration,
      is_visa_required: data.visa_rules.primary_rule.color === 'red',
      is_visa_free: data.visa_rules.primary_rule.color === 'green',
      needs_evisa: data.visa_rules.primary_rule.name?.toLowerCase().includes('evisa'),
      needs_eta: data.visa_rules.primary_rule.name?.toLowerCase().includes('eta'),
      stay_duration: data.visa_rules.primary_rule.duration,
      official_links: {
        evisa: data.visa_rules.secondary_rule?.link || data.visa_rules.primary_rule?.link,
        embassy: data.destination.embassy_url,
        registration: data.mandatory_registration?.link
      }
    };
  } catch (error) {
    console.error('❌ Travel Buddy API error:', error.response?.data || error.message);
    return getMockVisaRequirements(destinationCountry);
  }
}

/**
 * Get visa map colors for a passport (all destinations)
 * @param {string} passportCountry - User's passport country
 * @returns {Object} Color-coded visa requirements
 */
export async function getVisaMap(passportCountry) {
  if (!RAPIDAPI_KEY) {
    console.warn('⚠️ RAPIDAPI_KEY not set.');
    return null;
  }

  try {
    const passportCode = COUNTRY_CODES[passportCountry] || passportCountry;

    const response = await axios.post(
      `${BASE_URL}/v2/visa/map`,
      { passport: passportCode },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    console.log(`✅ Travel Buddy: Visa map fetched for ${passportCountry}`);
    
    return {
      passport: response.data.data.passport,
      colors: response.data.data.colors,
      visa_free_count: response.data.data.colors.green?.split(',').length || 0,
      visa_on_arrival_count: response.data.data.colors.blue?.split(',').length || 0,
      visa_required_count: response.data.data.colors.red?.split(',').length || 0,
      eta_required_count: response.data.data.colors.yellow?.split(',').length || 0
    };
  } catch (error) {
    console.error('❌ Travel Buddy map error:', error.message);
    return null;
  }
}

/**
 * Analyze visa eligibility based on real requirements + user profile
 * @param {Object} profile - User profile data
 * @param {string} destination - Destination country
 * @param {string} purpose - Travel purpose
 * @returns {Object} Eligibility analysis
 */
export async function analyzeVisaEligibility(profile, destination, purpose) {
  const visaReqs = await checkVisaRequirements(profile.nationality || 'India', destination);
  
  const analysis = {
    visa_required: visaReqs.is_visa_required,
    visa_type: visaReqs.visa_rules.primary.name,
    stay_duration: visaReqs.stay_duration,
    passport_validity_required: visaReqs.destination.passport_validity,
    color_category: visaReqs.visa_rules.color,
    
    // Profile-based checks
    profile_checks: {
      has_valid_passport: profile.hasPassport || false,
      meets_financial_requirements: profile.salary ? profile.salary >= 30000 : false,
      has_required_education: profile.education?.level ? true : false,
      has_work_experience: profile.experience?.totalYears >= 2,
      language_proficiency: profile.languages?.length > 0
    },
    
    // Document requirements
    required_documents: getRequiredDocuments(visaReqs, purpose),
    
    // Official resources
    resources: {
      evisa_link: visaReqs.official_links.evisa,
      embassy_link: visaReqs.official_links.embassy,
      registration_link: visaReqs.official_links.registration
    },
    
    // Special notes
    notes: []
  };
  
  // Add special conditions
  if (visaReqs.mandatory_registration) {
    analysis.notes.push(`⚠️ Mandatory registration required: ${visaReqs.mandatory_registration.name}`);
  }
  
  if (visaReqs.visa_rules.exception) {
    analysis.notes.push(`ℹ️ Exception rule: ${visaReqs.visa_rules.exception.full_text || 'Check official source'}`);
  }
  
  return analysis;
}

/**
 * Get required documents based on visa type and purpose
 */
function getRequiredDocuments(visaReqs, purpose) {
  const baseDocuments = [
    'Valid Passport',
    `Passport valid for ${visaReqs.destination.passport_validity || '6 months beyond stay'}`
  ];
  
  if (visaReqs.is_visa_required) {
    baseDocuments.push(
      'Visa Application Form',
      'Passport Photos',
      'Travel Insurance',
      'Proof of Accommodation',
      'Financial Proof'
    );
  }
  
  if (visaReqs.needs_evisa) {
    baseDocuments.push('Online eVisa Application');
  }
  
  if (visaReqs.needs_eta) {
    baseDocuments.push('Electronic Travel Authorization (eTA)');
  }
  
  // Purpose-specific documents
  if (purpose?.includes('Work')) {
    baseDocuments.push('Job Offer Letter', 'Work Contract', 'Employer Sponsorship');
  } else if (purpose?.includes('Study')) {
    baseDocuments.push('Letter of Acceptance', 'Proof of Tuition Payment', 'Academic Transcripts');
  }
  
  return baseDocuments;
}

/**
 * Mock visa requirements (fallback when API key not set)
 */
function getMockVisaRequirements(destination) {
  return {
    destination: {
      code: COUNTRY_CODES[destination] || 'XX',
      name: destination,
      continent: 'Europe',
      capital: 'Capital City',
      currency: 'EUR',
      phone_code: '+00',
      passport_validity: '6 months beyond stay',
      embassy_url: 'https://example.com/embassy'
    },
    visa_rules: {
      primary: {
        name: 'Work Visa',
        duration: '90 days',
        color: 'yellow'
      },
      secondary: null,
      exception: null,
      color: 'yellow'
    },
    mandatory_registration: null,
    is_visa_required: true,
    is_visa_free: false,
    needs_evisa: false,
    needs_eta: false,
    stay_duration: '90 days',
    official_links: {
      evisa: null,
      embassy: 'https://example.com/embassy',
      registration: null
    }
  };
}

/**
 * Cache to avoid hitting API limits
 */
const visaCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedVisaRequirements(passport, destination) {
  const cacheKey = `${passport}-${destination}`;
  const cached = visaCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Using cached visa data');
    return cached.data;
  }
  
  const data = await checkVisaRequirements(passport, destination);
  visaCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

export default {
  checkVisaRequirements,
  getVisaMap,
  analyzeVisaEligibility,
  getCachedVisaRequirements,
  COUNTRY_CODES
};
