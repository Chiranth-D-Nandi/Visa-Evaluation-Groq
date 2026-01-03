// Comprehensive visa requirements and scoring rules for all supported countries

export const VISA_CONFIGS = {
  Germany: {
    'EU Blue Card': {
      description: 'For highly qualified workers from non-EU countries',
      requiredDocuments: ['resume', 'degree', 'jobOffer', 'salaryProof'],
      optionalDocuments: ['languageCert', 'portfolio'],
      
      requirements: {
        education: {
          required: true,
          minLevel: 'bachelors',
          recognized: true,
          weight: 20,
          criteria: 'Must have recognized university degree'
        },
        salary: {
          required: true,
          minAmount: 45300, // EUR annual for 2024
          specialFieldMin: 41041.80, // EUR for shortage occupations
          currency: 'EUR',
          weight: 25,
          criteria: 'Minimum gross annual salary requirement'
        },
        experience: {
          required: false,
          minYears: 0,
          weight: 20,
          bonusYears: 3, // bonus if ≥3 years
          criteria: '3+ years relevant experience is advantageous'
        },
        jobOffer: {
          required: true,
          weight: 15,
          criteria: 'Valid job offer from German employer'
        },
        language: {
          required: false,
          minLevel: 'A1',
          weight: 10,
          bonusLevel: 'B1',
          criteria: 'German language proficiency (recommended)'
        },
        ageBonus: {
          under35: 5,
          criteria: 'Age under 35 provides bonus points'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 60,
        confidenceCap: 85, // Maximum confidence score
        hardFails: [
          { field: 'education', condition: 'missing', capScore: 40 },
          { field: 'salary', condition: 'below_minimum', capScore: 50 }
        ]
      },
      
      officialSources: [
        {
          title: 'German Federal Foreign Office - EU Blue Card',
          url: 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/17-eu-blue-card/606706',
          relevance: 'Official visa requirements'
        },
        {
          title: 'Federal Office for Migration and Refugees',
          url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Arbeit/BlaueKarteEU/blaue-karte-eu-node.html',
          relevance: 'Detailed eligibility criteria'
        }
      ]
    },
    
    'ICT Permit': {
      description: 'Intra-Corporate Transfer for specialists and managers',
      requiredDocuments: ['resume', 'degree', 'jobOffer', 'salaryProof'],
      optionalDocuments: ['languageCert'],
      
      requirements: {
        employment: {
          required: true,
          minMonthsWithCompany: 3,
          weight: 25,
          criteria: 'Must be employed by company for 3+ months'
        },
        position: {
          required: true,
          types: ['specialist', 'manager'],
          weight: 20,
          criteria: 'Must be specialist or managerial position'
        },
        education: {
          required: true,
          minLevel: 'bachelors',
          weight: 20,
          criteria: 'University degree or equivalent qualification'
        },
        salary: {
          required: true,
          minAmount: 41041.80,
          currency: 'EUR',
          weight: 25,
          criteria: 'Competitive salary requirement'
        },
        experience: {
          required: true,
          minYears: 3,
          weight: 10,
          criteria: 'Minimum 3 years professional experience'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 65,
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'ICT Directive - Federal Office',
          url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Arbeit/UnternehmensinternTransfer/unternehmensintern-transfer-node.html',
          relevance: 'ICT permit requirements'
        }
      ]
    }
  },
  
  Canada: {
    'Express Entry': {
      description: 'Points-based immigration system for skilled workers',
      requiredDocuments: ['resume', 'degree', 'languageCert'],
      optionalDocuments: ['jobOffer', 'portfolio'],
      
      requirements: {
        education: {
          required: true,
          minLevel: 'bachelors',
          weight: 25,
          bonusLevels: {
            masters: 5,
            phd: 10
          },
          criteria: 'Educational Credential Assessment required'
        },
        language: {
          required: true,
          tests: ['IELTS', 'CELPIP', 'TEF'],
          minCLB: 7, // Canadian Language Benchmark
          weight: 28,
          bonusCLB: 9,
          criteria: 'Minimum CLB 7, higher scores increase points'
        },
        experience: {
          required: true,
          minYears: 1,
          weight: 25,
          bonusYears: 3,
          skillLevel: 'NOC 0, A, or B',
          criteria: 'Skilled work experience in NOC categories'
        },
        age: {
          required: true,
          optimal: 29,
          weight: 12,
          criteria: 'Points decrease after age 29'
        },
        jobOffer: {
          required: false,
          weight: 10,
          bonusPoints: 50, // CRS bonus
          criteria: 'Valid job offer adds significant CRS points'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 67, // FSW points
        confidenceCap: 85,
        crsBonus: true // Comprehensive Ranking System
      },
      
      officialSources: [
        {
          title: 'IRCC Express Entry',
          url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
          relevance: 'Official Express Entry requirements'
        },
        {
          title: 'CRS Calculator',
          url: 'https://www.cic.gc.ca/english/immigrate/skilled/crs-tool.asp',
          relevance: 'Points calculation tool'
        }
      ]
    }
  },
  
  Ireland: {
    'Critical Skills Employment Permit': {
      description: 'For skilled workers in occupations with labor shortages',
      requiredDocuments: ['resume', 'degree', 'jobOffer', 'salaryProof'],
      optionalDocuments: ['languageCert'],
      
      requirements: {
        salary: {
          required: true,
          minAmount: 32000, // EUR for skills shortage
          preferredAmount: 64000, // EUR for fast track
          currency: 'EUR',
          weight: 30,
          criteria: '€32k minimum, €64k+ for expedited processing'
        },
        education: {
          required: true,
          minLevel: 'bachelors',
          weight: 25,
          relevance: 'degree-related',
          criteria: 'Degree relevant to job role'
        },
        occupation: {
          required: true,
          listBased: true,
          weight: 25,
          criteria: 'Role must be on Critical Skills list'
        },
        jobOffer: {
          required: true,
          minContract: 24, // months
          weight: 20,
          criteria: 'Contract for at least 2 years'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 70,
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'Critical Skills Occupations List',
          url: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/employment-permit-eligibility/critical-skills-occupations-list/',
          relevance: 'Eligible occupations list'
        }
      ]
    }
  },
  
  Netherlands: {
    'Knowledge Migrant Permit': {
      description: 'For highly skilled migrants (Kennismigrant)',
      requiredDocuments: ['resume', 'degree', 'jobOffer', 'salaryProof'],
      optionalDocuments: ['languageCert'],
      
      requirements: {
        salary: {
          required: true,
          minAmount: 57600, // EUR for 2024 (over 30)
          minAmountUnder30: 42000,
          currency: 'EUR',
          weight: 35,
          criteria: 'Age-dependent minimum salary'
        },
        employer: {
          required: true,
          recognized: true,
          weight: 25,
          criteria: 'Employer must be recognized sponsor'
        },
        education: {
          required: false,
          weight: 20,
          criteria: 'Higher education advantageous'
        },
        jobOffer: {
          required: true,
          weight: 20,
          criteria: 'Valid employment contract'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 65,
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'IND - Highly Skilled Migrant',
          url: 'https://ind.nl/en/work/working_in_the_Netherlands/pages/highly-skilled-migrant.aspx',
          relevance: 'Official requirements'
        }
      ]
    }
  },
  
  Australia: {
    'Skilled Independent Visa (189)': {
      description: 'Points-tested visa for skilled workers',
      requiredDocuments: ['resume', 'degree', 'languageCert'],
      optionalDocuments: ['jobOffer', 'portfolio'],
      
      requirements: {
        occupation: {
          required: true,
          listBased: true,
          weight: 20,
          criteria: 'Occupation on skilled occupation list'
        },
        skillsAssessment: {
          required: true,
          weight: 20,
          criteria: 'Positive skills assessment'
        },
        age: {
          required: true,
          minAge: 18,
          maxAge: 44,
          optimal: 32,
          weight: 15,
          criteria: 'Age 25-32 gets maximum points'
        },
        language: {
          required: true,
          tests: ['IELTS', 'PTE', 'TOEFL'],
          minScore: 6, // IELTS equivalent
          weight: 20,
          bonusScore: 8,
          criteria: 'Competent English minimum'
        },
        experience: {
          required: true,
          minYears: 3,
          weight: 15,
          bonusYears: 5,
          criteria: 'Skilled work experience'
        },
        education: {
          required: true,
          minLevel: 'bachelors',
          weight: 10,
          bonusLevels: {
            masters: 5,
            phd: 10
          },
          criteria: 'Higher qualifications earn more points'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 65, // Points test
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'Skilled Independent Visa 189',
          url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189',
          relevance: 'Official visa requirements'
        }
      ]
    }
  },
  
  Poland: {
    'Work Permit Type C': {
      description: 'For foreign nationals employed by Polish entities',
      requiredDocuments: ['resume', 'jobOffer', 'degree'],
      optionalDocuments: ['languageCert', 'salaryProof'],
      
      requirements: {
        jobOffer: {
          required: true,
          weight: 30,
          criteria: 'Employer must register job offer'
        },
        education: {
          required: false,
          weight: 25,
          criteria: 'Degree beneficial but not mandatory'
        },
        experience: {
          required: false,
          minYears: 1,
          weight: 20,
          criteria: 'Relevant work experience'
        },
        salary: {
          required: false,
          minAmount: 4000, // PLN monthly
          currency: 'PLN',
          weight: 15,
          criteria: 'Competitive salary'
        },
        language: {
          required: false,
          weight: 10,
          criteria: 'Polish or English proficiency'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 55,
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'Poland Work Permits',
          url: 'https://www.gov.pl/web/worked/work-permit',
          relevance: 'Work permit requirements'
        }
      ]
    }
  },
  
  France: {
    'Talent Passport': {
      description: 'For highly qualified professionals',
      requiredDocuments: ['resume', 'degree', 'jobOffer', 'salaryProof'],
      optionalDocuments: ['languageCert', 'portfolio'],
      
      requirements: {
        salary: {
          required: true,
          minAmount: 38400, // EUR annual (2x minimum wage)
          currency: 'EUR',
          weight: 30,
          criteria: 'Minimum twice the French minimum wage'
        },
        education: {
          required: true,
          minLevel: 'masters',
          weight: 25,
          criteria: 'Masters degree or 5 years experience'
        },
        experience: {
          required: false,
          minYears: 5,
          weight: 20,
          alternativeToEducation: true,
          criteria: '5 years can substitute for masters'
        },
        jobOffer: {
          required: true,
          minContract: 12,
          weight: 25,
          criteria: 'Employment contract minimum 12 months'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 70,
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'Talent Passport Information',
          url: 'https://www.campusfrance.org/en/talent-passport-france',
          relevance: 'Official requirements'
        }
      ]
    }
  },
  
  Italy: {
    'Highly Qualified Worker Visa': {
      description: 'EU Blue Card equivalent for Italy',
      requiredDocuments: ['resume', 'degree', 'jobOffer', 'salaryProof'],
      optionalDocuments: ['languageCert'],
      
      requirements: {
        education: {
          required: true,
          minLevel: 'bachelors',
          duration: 3, // years
          weight: 25,
          criteria: '3-year university qualification'
        },
        salary: {
          required: true,
          minAmount: 27310, // EUR annual
          currency: 'EUR',
          weight: 30,
          criteria: 'Minimum salary threshold'
        },
        jobOffer: {
          required: true,
          minContract: 12,
          weight: 25,
          criteria: 'Employment contract min 12 months'
        },
        experience: {
          required: false,
          minYears: 5,
          weight: 20,
          alternativeToEducation: true,
          criteria: '5 years experience can substitute degree'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 65,
        confidenceCap: 85
      },
      
      officialSources: [
        {
          title: 'Italy Work Visa Information',
          url: 'https://vistoperitalia.esteri.it/home/en',
          relevance: 'Official visa portal'
        }
      ]
    }
  },
  
  UK: {
    'Skilled Worker Visa': {
      description: 'Points-based visa for skilled workers',
      requiredDocuments: ['resume', 'jobOffer', 'languageCert'],
      optionalDocuments: ['degree', 'salaryProof'],
      
      requirements: {
        jobOffer: {
          required: true,
          sponsorRequired: true,
          weight: 20,
          points: 20,
          criteria: 'Job offer from licensed sponsor'
        },
        skillLevel: {
          required: true,
          minLevel: 'RQF3', // A-level or equivalent
          weight: 20,
          points: 20,
          criteria: 'Job at appropriate skill level'
        },
        language: {
          required: true,
          minLevel: 'B1',
          weight: 10,
          points: 10,
          criteria: 'English at B1 CEFR'
        },
        salary: {
          required: true,
          minAmount: 25600, // GBP for experienced workers
          goingRate: true,
          currency: 'GBP',
          weight: 30,
          points: 20,
          criteria: 'Salary threshold or going rate'
        },
        education: {
          required: false,
          weight: 10,
          bonusPoints: 10,
          relevantPhD: true,
          criteria: 'PhD in relevant subject adds points'
        },
        shortage: {
          required: false,
          weight: 10,
          bonusPoints: 20,
          criteria: 'Occupation on shortage list'
        }
      },
      
      scoringRules: {
        maxScore: 100,
        passingScore: 70, // Need 70 points
        confidenceCap: 85,
        pointsBased: true
      },
      
      officialSources: [
        {
          title: 'UK Skilled Worker Visa',
          url: 'https://www.gov.uk/skilled-worker-visa',
          relevance: 'Official requirements'
        },
        {
          title: 'Points-based System',
          url: 'https://www.gov.uk/guidance/new-immigration-system-what-you-need-to-know',
          relevance: 'Points calculation guide'
        }
      ]
    }
  }
};

// Helper function to get all countries
export const getCountries = () => Object.keys(VISA_CONFIGS);

// Helper function to get visa types for a country
export const getVisaTypes = (country) => {
  return VISA_CONFIGS[country] ? Object.keys(VISA_CONFIGS[country]) : [];
};

// Helper function to get full config
export const getVisaConfig = (country, visaType) => {
  return VISA_CONFIGS[country]?.[visaType] || null;
};
