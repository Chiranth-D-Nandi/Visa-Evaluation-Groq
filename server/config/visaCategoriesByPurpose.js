// Purpose-based visa categorization with ALL visa types for 9 countries

export const PURPOSES = [
  'Bachelor\'s Degree Study',
  'Master\'s Degree Study', 
  'PhD/Research',
  'Work - Job Offer',
  'Work - Job Seeking',
  'Skilled Migration',
  'Business/Entrepreneurship',
  'Family Reunification',
  'Internship/Training'
];

export const BASE_DOCUMENTS = {
  student: ['Passport', 'Resume/CV', 'Academic Transcripts', 'Degree Certificates', 'English Proficiency Test', 'Statement of Purpose', 'Financial Proof'],
  work: ['Passport', 'Resume/CV', 'Degree Certificates', 'Work Experience Letters', 'Job Offer Letter', 'Salary Proof', 'Skills Certifications'],
  migration: ['Passport', 'Resume/CV', 'Degree Certificates', 'Work Experience Letters', 'Language Test Results', 'Skills Assessment', 'Financial Proof'],
  business: ['Passport', 'Resume/CV', 'Business Plan', 'Financial Statements', 'Investment Proof', 'Professional Qualifications'],
  family: ['Passport', 'Relationship Proof', 'Sponsor Documents', 'Financial Proof', 'Accommodation Proof'],
  internship: ['Passport', 'Resume/CV', 'Academic Transcripts', 'Internship Offer', 'Training Plan', 'Financial Proof']
};

// Complete visa categories for all 9 countries
export const VISA_CATEGORIES = {
  Germany: {
    student: [
      {
        name: 'Student Visa (§16b)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For pursuing higher education at German universities',
        officialName: 'Aufenthaltserlaubnis zum Studium',
        duration: 'Duration of studies + 18 months job search',
        requirements: {
          admission: true,
          financialProof: 11208, // EUR per year
          healthInsurance: true,
          germanLanguage: 'B1-C1 (depending on program)'
        }
      },
      {
        name: 'Language Course Visa (§16f)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study'],
        description: 'For intensive German language courses',
        duration: 'Up to 1 year',
        requirements: {
          courseEnrollment: true,
          financialProof: 11208
        }
      },
      {
        name: 'Student Applicant Visa (§16b)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study'],
        description: 'For applying to German universities',
        duration: '3-6 months',
        requirements: {
          previousEducation: true,
          financialProof: 11208
        }
      }
    ],
    work: [
      {
        name: 'EU Blue Card (§18b Abs. 2)',
        purpose: ['Work - Job Offer', 'Skilled Migration'],
        description: 'For highly qualified workers with university degree',
        officialName: 'Blaue Karte EU',
        duration: 'Up to 4 years',
        requirements: {
          degree: 'University degree',
          salary: 45300, // EUR minimum for 2024
          salaryShortage: 41041.80, // For shortage occupations
          jobOffer: true
        }
      },
      {
        name: 'Skilled Workers Visa (§18a)',
        purpose: ['Work - Job Offer'],
        description: 'For qualified professionals with vocational training',
        duration: 'Up to 4 years',
        requirements: {
          qualification: 'Vocational training or degree',
          jobOffer: true,
          laborMarketTest: true
        }
      },
      {
        name: 'Job Seeker Visa (§20 Abs. 1 + 2)',
        purpose: ['Work - Job Seeking', 'Skilled Migration'],
        description: 'For seeking employment in Germany',
        duration: '6 months',
        requirements: {
          degree: 'University degree',
          financialProof: true,
          professionalExperience: '5 years recommended'
        }
      },
      {
        name: 'ICT Card (§19b)',
        purpose: ['Work - Job Offer'],
        description: 'Intra-corporate transfer for managers and specialists',
        officialName: 'ICT-Karte',
        duration: 'Up to 3 years',
        requirements: {
          currentEmployment: '3-12 months with company',
          specialistOrManager: true,
          salary: 41041.80
        }
      },
      {
        name: 'Opportunity Card (§20a)',
        purpose: ['Work - Job Seeking', 'Skilled Migration'],
        description: 'Points-based card for job seeking',
        officialName: 'Chancenkarte',
        duration: '1 year',
        requirements: {
          points: 6, // minimum points
          financialProof: true,
          qualifications: true
        }
      },
      {
        name: 'Freelance Visa (§21 Abs. 5)',
        purpose: ['Business/Entrepreneurship'],
        description: 'For freelancers and self-employed',
        duration: 'Up to 3 years',
        requirements: {
          businessPlan: true,
          clientContracts: true,
          financialViability: true
        }
      }
    ],
    business: [
      {
        name: 'Self-Employment Visa (§21)',
        purpose: ['Business/Entrepreneurship'],
        description: 'For entrepreneurs starting a business',
        duration: 'Up to 3 years',
        requirements: {
          businessPlan: true,
          investment: 'Depends on business',
          economicInterest: true,
          financialSecurity: true
        }
      }
    ],
    family: [
      {
        name: 'Family Reunification (§28-36)',
        purpose: ['Family Reunification'],
        description: 'For joining family members in Germany',
        duration: 'Depends on sponsor\'s permit',
        requirements: {
          relationshipProof: true,
          accommodation: true,
          sponsorIncome: true,
          germanLanguage: 'A1'
        }
      }
    ]
  },

  Canada: {
    student: [
      {
        name: 'Study Permit',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For studying at designated learning institutions',
        duration: 'Duration of studies + 90 days',
        requirements: {
          letterOfAcceptance: true,
          financialProof: true,
          noIntentToStay: true,
          medicalExam: true
        }
      }
    ],
    work: [
      {
        name: 'Express Entry - Federal Skilled Worker (FSW)',
        purpose: ['Skilled Migration', 'Work - Job Seeking'],
        description: 'Points-based permanent residence',
        duration: 'Permanent residence',
        requirements: {
          workExperience: '1 year NOC 0, A, or B',
          languageTest: 'CLB 7',
          education: 'ECA required',
          crsPoints: '67 minimum FSW',
          medicalExam: true
        }
      },
      {
        name: 'Express Entry - Canadian Experience Class (CEC)',
        purpose: ['Skilled Migration'],
        description: 'For those with Canadian work experience',
        duration: 'Permanent residence',
        requirements: {
          canadianExperience: '1 year',
          languageTest: 'CLB 7 (NOC 0/A) or CLB 5 (NOC B)',
          planToLiveOutsideQuebec: true
        }
      },
      {
        name: 'Express Entry - Federal Skilled Trades (FST)',
        purpose: ['Skilled Migration'],
        description: 'For skilled trades workers',
        duration: 'Permanent residence',
        requirements: {
          workExperience: '2 years in skilled trade',
          jobOffer: 'Or certificate of qualification',
          languageTest: 'CLB 5 speaking/listening, CLB 4 reading/writing'
        }
      },
      {
        name: 'Temporary Foreign Worker Program (TFWP)',
        purpose: ['Work - Job Offer'],
        description: 'For temporary work with LMIA',
        duration: 'Based on LMIA',
        requirements: {
          lmia: 'Labour Market Impact Assessment',
          jobOffer: true
        }
      },
      {
        name: 'International Mobility Program (IMP)',
        purpose: ['Work - Job Offer'],
        description: 'LMIA-exempt work permits',
        duration: 'Varies',
        requirements: {
          exemptCategory: 'NAFTA, CETA, GATS, etc.',
          jobOffer: true
        }
      },
      {
        name: 'Global Talent Stream',
        purpose: ['Work - Job Offer'],
        description: 'Expedited processing for tech workers',
        duration: 'Up to 2 years',
        requirements: {
          designatedEmployer: true,
          highlySkilled: true,
          processingTime: '2 weeks'
        }
      },
      {
        name: 'Start-up Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For innovative entrepreneurs',
        duration: 'Permanent residence',
        requirements: {
          designatedOrganization: 'Support from approved investor/incubator',
          languageTest: 'CLB 5',
          financialProof: true
        }
      }
    ],
    business: [
      {
        name: 'Self-Employed Program',
        purpose: ['Business/Entrepreneurship'],
        description: 'For self-employed in cultural/athletic activities',
        duration: 'Permanent residence',
        requirements: {
          relevantExperience: '2 years',
          abilityToBeSelfEmployed: true,
          selection: '35 points minimum'
        }
      },
      {
        name: 'Provincial Nominee - Entrepreneur',
        purpose: ['Business/Entrepreneurship'],
        description: 'Provincial entrepreneur programs',
        duration: 'Permanent residence',
        requirements: {
          variesByProvince: true,
          businessPlan: true,
          investment: 'Varies by province'
        }
      }
    ],
    family: [
      {
        name: 'Family Sponsorship',
        purpose: ['Family Reunification'],
        description: 'Sponsor spouse, children, parents',
        duration: 'Permanent residence',
        requirements: {
          sponsorEligibility: true,
          relationshipProof: true,
          financialRequirements: true
        }
      }
    ]
  },

  Ireland: {
    student: [
      {
        name: 'Study Visa (Type D)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For full-time study programs',
        duration: 'Duration of course',
        requirements: {
          letterOfAcceptance: true,
          financialProof: 7000, // EUR for fees + 3000 for living
          privateHealthInsurance: true
        }
      }
    ],
    work: [
      {
        name: 'Critical Skills Employment Permit',
        purpose: ['Work - Job Offer', 'Skilled Migration'],
        description: 'For skills shortage occupations',
        duration: '2 years (renewable)',
        requirements: {
          jobOffer: true,
          salary: 32000, // EUR minimum, 64000+ for fast-track
          criticalSkillsOccupation: true,
          degreeRelevance: true
        }
      },
      {
        name: 'General Employment Permit',
        purpose: ['Work - Job Offer'],
        description: 'For occupations not on ineligible list',
        duration: '2 years (renewable)',
        requirements: {
          jobOffer: true,
          salary: 30000, // EUR minimum
          laborMarketTest: true
        }
      },
      {
        name: 'Intra-Company Transfer',
        purpose: ['Work - Job Offer'],
        description: 'For transfers within multinational companies',
        duration: 'Up to 5 years',
        requirements: {
          currentEmployment: '6-12 months',
          seniorManagement: 'Or specialist role',
          salary: 40000 // EUR
        }
      },
      {
        name: 'Contract for Services',
        purpose: ['Work - Job Offer'],
        description: 'For contract workers',
        duration: 'Up to 2 years',
        requirements: {
          contract: true,
          salary: 32000
        }
      }
    ],
    business: [
      {
        name: 'Start-up Entrepreneur Programme (STEP)',
        purpose: ['Business/Entrepreneurship'],
        description: 'For innovative startups',
        duration: '2 years',
        requirements: {
          approvedIdea: true,
          investment: 50000, // EUR
          jobCreation: 'Potential'
        }
      },
      {
        name: 'Immigrant Investor Programme (IIP)',
        purpose: ['Business/Entrepreneurship'],
        description: 'For significant investors',
        duration: 'Renewable',
        requirements: {
          netWorth: 2000000, // EUR
          investment: 1000000 // EUR for 3 years
        }
      }
    ]
  },

  Netherlands: {
    student: [
      {
        name: 'Student Residence Permit (MVV)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For study at Dutch institutions',
        duration: 'Duration of studies',
        requirements: {
          letterOfAcceptance: true,
          financialProof: 11600, // EUR per year
          healthInsurance: true
        }
      },
      {
        name: 'Orientation Year for Graduates',
        purpose: ['Work - Job Seeking'],
        description: 'For graduates to find work',
        duration: '1 year',
        requirements: {
          recentGraduate: 'Within 3 years',
          dutchOrEUdegree: true,
          financialProof: true
        }
      }
    ],
    work: [
      {
        name: 'Highly Skilled Migrant (Kennismigrant)',
        purpose: ['Work - Job Offer', 'Skilled Migration'],
        description: 'For highly skilled workers',
        duration: 'Up to 5 years',
        requirements: {
          recognizedSponsor: true,
          salary: 57600, // EUR for 30+, 42000 for under 30 (2024)
          degree: 'Or relevant experience'
        }
      },
      {
        name: 'EU Blue Card',
        purpose: ['Work - Job Offer'],
        description: 'EU-wide work permit',
        duration: 'Up to 4 years',
        requirements: {
          higherEducation: true,
          salary: 57600,
          jobOffer: true
        }
      },
      {
        name: 'ICT Permit',
        purpose: ['Work - Job Offer'],
        description: 'Intra-corporate transfer',
        duration: 'Up to 3 years',
        requirements: {
          currentEmployment: '3 months',
          managerOrSpecialist: true
        }
      },
      {
        name: 'Self-Employment Permit',
        purpose: ['Business/Entrepreneurship'],
        description: 'For entrepreneurs',
        duration: '2 years (renewable)',
        requirements: {
          businessPlan: true,
          essentialInterest: true,
          pointsTest: '30 points'
        }
      }
    ],
    business: [
      {
        name: 'Start-up Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For innovative startups',
        duration: '1 year',
        requirements: {
          facilitatorApproval: true,
          innovativeBusinessPlan: true
        }
      }
    ]
  },

  Australia: {
    student: [
      {
        name: 'Student Visa (Subclass 500)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For full-time study',
        duration: 'Duration of course + up to 4 years (485 visa)',
        requirements: {
          enrollment: 'Confirmation of Enrolment (CoE)',
          financialProof: true,
          englishTest: 'IELTS 5.5+',
          healthInsurance: 'OSHC',
          genuineTemporaryEntrant: true
        }
      },
      {
        name: 'Temporary Graduate Visa (Subclass 485)',
        purpose: ['Work - Job Seeking'],
        description: 'Post-study work rights',
        duration: '2-4 years (depends on degree)',
        requirements: {
          recentGraduate: 'Within 6 months',
          australianQualification: true,
          englishTest: 'IELTS 6.0'
        }
      }
    ],
    work: [
      {
        name: 'Skilled Independent Visa (Subclass 189)',
        purpose: ['Skilled Migration'],
        description: 'Points-tested permanent visa',
        duration: 'Permanent',
        requirements: {
          occupation: 'On MLTSSL',
          skillsAssessment: true,
          age: 'Under 45',
          englishTest: 'Competent',
          points: '65 minimum',
          eoi: 'Expression of Interest'
        }
      },
      {
        name: 'Skilled Nominated Visa (Subclass 190)',
        purpose: ['Skilled Migration'],
        description: 'State-nominated permanent visa',
        duration: 'Permanent',
        requirements: {
          stateNomination: true,
          occupation: 'On MLTSSL or STSOL',
          skillsAssessment: true,
          points: '65 minimum (including nomination)'
        }
      },
      {
        name: 'Skilled Work Regional Visa (Subclass 491)',
        purpose: ['Skilled Migration'],
        description: 'Regional nominated provisional visa',
        duration: '5 years provisional',
        requirements: {
          stateNomination: 'Or family sponsorship',
          occupation: 'On regional list',
          points: '65 minimum'
        }
      },
      {
        name: 'Temporary Skill Shortage Visa (Subclass 482)',
        purpose: ['Work - Job Offer'],
        description: 'Employer-sponsored temporary visa',
        duration: '2-4 years',
        requirements: {
          sponsorship: 'Approved sponsor',
          occupation: 'On STSOL or MLTSSL',
          skillsAssessment: 'For some occupations',
          workExperience: '2 years',
          englishTest: 'IELTS 5.0'
        }
      },
      {
        name: 'Employer Nomination Scheme (Subclass 186)',
        purpose: ['Work - Job Offer'],
        description: 'Permanent employer-sponsored visa',
        duration: 'Permanent',
        requirements: {
          sponsorship: true,
          occupation: 'On MLTSSL',
          workExperience: '3 years',
          age: 'Under 45',
          englishTest: 'Competent'
        }
      },
      {
        name: 'Global Talent Visa (Subclass 858)',
        purpose: ['Skilled Migration'],
        description: 'For highly skilled individuals',
        duration: 'Permanent',
        requirements: {
          exceptionalTalent: true,
          targetSectors: 'Tech, STEM, health, etc.',
          internationallYrecognized: true,
          nominator: 'Australian resident in field'
        }
      }
    ],
    business: [
      {
        name: 'Business Innovation and Investment (Subclass 188)',
        purpose: ['Business/Entrepreneurship'],
        description: 'For business owners and investors',
        duration: 'Provisional (pathway to 888)',
        requirements: {
          businessOrInvestment: true,
          pointsTest: '65 minimum',
          stateNomination: true,
          financialThresholds: 'Varies by stream'
        }
      },
      {
        name: 'Business Talent (Subclass 132)',
        purpose: ['Business/Entrepreneurship'],
        description: 'For high-caliber business owners',
        duration: 'Permanent',
        requirements: {
          significantBusiness: true,
          stateNomination: true,
          netAssets: 1500000, // AUD
          investment: 'Varies by state'
        }
      }
    ]
  },

  Poland: {
    student: [
      {
        name: 'National Visa Type D (Student)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For studying in Poland',
        duration: 'Duration of studies',
        requirements: {
          letterOfAcceptance: true,
          financialProof: true,
          healthInsurance: true
        }
      }
    ],
    work: [
      {
        name: 'Work Permit Type A',
        purpose: ['Work - Job Offer'],
        description: 'For work with Polish employer',
        duration: 'Up to 3 years',
        requirements: {
          jobOffer: true,
          laborMarketTest: true
        }
      },
      {
        name: 'Work Permit Type B',
        purpose: ['Work - Job Offer'],
        description: 'For management board members',
        duration: 'Up to 3 years',
        requirements: {
          boardMember: true,
          companyRegistration: true
        }
      },
      {
        name: 'Work Permit Type C',
        purpose: ['Work - Job Offer'],
        description: 'For posted workers',
        duration: 'Up to 3 years',
        requirements: {
          foreignEmployer: true,
          postedAssignment: true
        }
      },
      {
        name: 'Work Permit Type D',
        purpose: ['Work - Job Offer'],
        description: 'For cross-border services',
        duration: 'Up to 6 months',
        requirements: {
          serviceContract: true
        }
      },
      {
        name: 'Work Permit Type E',
        purpose: ['Work - Job Offer'],
        description: 'For workers sent by temp agencies',
        duration: 'Up to 3 years',
        requirements: {
          tempAgency: true,
          laborMarketTest: true
        }
      },
      {
        name: 'EU Blue Card',
        purpose: ['Work - Job Offer', 'Skilled Migration'],
        description: 'For highly qualified workers',
        duration: 'Up to 3 years',
        requirements: {
          higherEducation: true,
          salary: '1.5x average salary',
          jobOffer: true
        }
      },
      {
        name: 'Poland Business Harbour',
        purpose: ['Business/Entrepreneurship'],
        description: 'For tech entrepreneurs',
        duration: 'Up to 2 years',
        requirements: {
          innovativeBusiness: true,
          techSector: true
        }
      }
    ]
  },

  France: {
    student: [
      {
        name: 'Long-Stay Student Visa (VLS-TS)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For students in France',
        duration: 'Up to 1 year (renewable)',
        requirements: {
          campusFranceApproval: true,
          letterOfAcceptance: true,
          financialProof: 615, // EUR per month
          healthInsurance: true
        }
      }
    ],
    work: [
      {
        name: 'Talent Passport - Qualified Employee',
        purpose: ['Work - Job Offer'],
        description: 'For highly qualified workers',
        officialName: 'Passeport Talent - Salarié Qualifié',
        duration: 'Up to 4 years',
        requirements: {
          degree: 'Masters or 5 years experience',
          salary: 38400, // EUR (2x minimum wage)
          jobOffer: true
        }
      },
      {
        name: 'Talent Passport - Researcher',
        purpose: ['PhD/Research'],
        description: 'For researchers',
        duration: 'Up to 4 years',
        requirements: {
          researchAgreement: true,
          qualification: 'Masters minimum'
        }
      },
      {
        name: 'Talent Passport - Company Creator',
        purpose: ['Business/Entrepreneurship'],
        description: 'For innovative entrepreneurs',
        duration: 'Up to 4 years',
        requirements: {
          innovativeProject: true,
          financialResources: true,
          businessPlan: true
        }
      },
      {
        name: 'Talent Passport - Economic Investment',
        purpose: ['Business/Entrepreneurship'],
        description: 'For investors',
        duration: 'Up to 4 years',
        requirements: {
          investment: 300000, // EUR minimum
          jobCreation: 'Or preservation'
        }
      },
      {
        name: 'EU Blue Card',
        purpose: ['Work - Job Offer'],
        description: 'EU-wide highly skilled worker permit',
        duration: '1-4 years',
        requirements: {
          higherEducation: true,
          salary: '1.5x average salary',
          jobOffer: true
        }
      },
      {
        name: 'Salarié en Mission (ICT)',
        purpose: ['Work - Job Offer'],
        description: 'Intra-corporate transfer',
        duration: 'Up to 3 years',
        requirements: {
          currentEmployment: '3-6 months',
          managerOrSpecialist: true
        }
      },
      {
        name: 'Temporary Worker',
        purpose: ['Work - Job Offer'],
        description: 'For temporary work',
        officialName: 'Travailleur Temporaire',
        duration: 'Up to 1 year',
        requirements: {
          temporaryContract: true,
          laborMarketTest: true
        }
      }
    ]
  },

  Italy: {
    student: [
      {
        name: 'National Visa Type D (Study)',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For university study',
        duration: 'Duration of course',
        requirements: {
          preEnrollment: 'University declaration',
          financialProof: 6000, // EUR minimum per year
          accommodation: true,
          healthInsurance: true
        }
      }
    ],
    work: [
      {
        name: 'EU Blue Card',
        purpose: ['Work - Job Offer', 'Skilled Migration'],
        description: 'For highly qualified workers',
        duration: '2 years (renewable)',
        requirements: {
          higherEducation: '3-year degree minimum',
          salary: 27310, // EUR gross annual
          jobOffer: true,
          quotaAvailability: true
        }
      },
      {
        name: 'Subordinate Work Visa',
        purpose: ['Work - Job Offer'],
        description: 'For employed workers',
        officialName: 'Nulla Osta',
        duration: 'Based on contract',
        requirements: {
          jobOffer: true,
          quotaAvailability: true,
          nulLaosta: 'Authorization from prefecture'
        }
      },
      {
        name: 'Intra-Corporate Transfer',
        purpose: ['Work - Job Offer'],
        description: 'For company transfers',
        duration: 'Up to 3 years',
        requirements: {
          currentEmployment: '3-12 months',
          managerOrSpecialist: true
        }
      },
      {
        name: 'Self-Employment Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For self-employed professionals',
        duration: '2 years',
        requirements: {
          businessPlan: true,
          professionalQualification: true,
          financialResources: true
        }
      },
      {
        name: 'Start-up Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For innovative startups',
        duration: '1 year (renewable)',
        requirements: {
          innovativeIdea: true,
          economicResources: true,
          businessPlan: true
        }
      },
      {
        name: 'Investor Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For significant investors',
        duration: '2 years',
        requirements: {
          investment: 250000, // EUR in startup, or 500k in company, or 1M in government bonds
          commitmentLetter: true
        }
      }
    ]
  },

  UK: {
    student: [
      {
        name: 'Student Visa',
        purpose: ['Bachelor\'s Degree Study', 'Master\'s Degree Study', 'PhD/Research'],
        description: 'For studying at approved institutions',
        duration: 'Course length + extra time',
        requirements: {
          cas: 'Confirmation of Acceptance for Studies',
          financialProof: true,
          englishLanguage: 'B2 CEFR',
          atas: 'For some subjects',
          tubercoLosisTest: 'For some countries'
        }
      },
      {
        name: 'Graduate Visa',
        purpose: ['Work - Job Seeking'],
        description: 'Post-study work rights',
        duration: '2 years (3 for PhD)',
        requirements: {
          ukDegree: 'Bachelor\'s or above',
          currentStudentVisa: true
        }
      }
    ],
    work: [
      {
        name: 'Skilled Worker Visa',
        purpose: ['Work - Job Offer'],
        description: 'For skilled workers with job offer',
        duration: 'Up to 5 years',
        requirements: {
          jobOffer: 'From licensed sponsor',
          skillLevel: 'RQF Level 3+ (A-level)',
          salary: 25600, // GBP or going rate
          englishLanguage: 'B1 CEFR',
          sponsorLicense: true,
          points: '70 points'
        }
      },
      {
        name: 'Health and Care Worker Visa',
        purpose: ['Work - Job Offer'],
        description: 'For healthcare professionals',
        duration: 'Up to 5 years',
        requirements: {
          jobOffer: 'NHS or registered care provider',
          eligibleHealthJob: true,
          englishLanguage: 'B1 CEFR',
          reducedFees: true
        }
      },
      {
        name: 'Senior or Specialist Worker (ICT)',
        purpose: ['Work - Job Offer'],
        description: 'Intra-company transfer',
        duration: 'Up to 5 years',
        requirements: {
          currentEmployment: '12 months',
          salary: 42400, // GBP
          skillLevel: 'RQF6+ (degree)'
        }
      },
      {
        name: 'Global Talent Visa',
        purpose: ['Skilled Migration'],
        description: 'For leaders in science, humanities, engineering, arts',
        duration: '5 years',
        requirements: {
          endorsement: 'From recognized body',
          exceptionalTalent: 'Or promise',
          noJobOffer: 'Required'
        }
      },
      {
        name: 'High Potential Individual Visa',
        purpose: ['Work - Job Seeking', 'Skilled Migration'],
        description: 'For graduates of top global universities',
        duration: '2-3 years',
        requirements: {
          degree: 'From top 50 global university',
          awardedWithin: '5 years',
          englishLanguage: true,
          financialProof: true
        }
      },
      {
        name: 'Innovator Founder Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For innovative business founders',
        duration: '3 years',
        requirements: {
          endorsement: 'From approved body',
          innovativeBusiness: true,
          viableBusinessPlan: true,
          scalableBusiness: true
        }
      },
      {
        name: 'Start-up Visa',
        purpose: ['Business/Entrepreneurship'],
        description: 'For first-time entrepreneurs',
        duration: '2 years (non-renewable)',
        requirements: {
          endorsement: 'From approved body',
          innovativeBusiness: true,
          firstBusiness: true
        }
      },
      {
        name: 'Scale-up Visa',
        purpose: ['Work - Job Offer'],
        description: 'For workers joining fast-growing companies',
        duration: '2 years + extensions',
        requirements: {
          jobOffer: 'From scale-up company',
          skillLevel: 'RQF6+ (degree)',
          salary: 33000 // GBP
        }
      }
    ]
  }
};

// Function to suggest visa categories based on purpose
export function suggestVisaCategories(country, purpose, documents, profile) {
  const categories = VISA_CATEGORIES[country];
  if (!categories) return [];

  let suggestions = [];

  // Find matching categories
  Object.values(categories).forEach(categoryArray => {
    categoryArray.forEach(visa => {
      if (visa.purpose.includes(purpose)) {
        // Calculate match score
        let score = 70; // Base score for matching purpose
        
        // Add points based on profile match
        if (visa.requirements) {
          if (visa.requirements.degree && profile.education) score += 10;
          if (visa.requirements.jobOffer && profile.hasJobOffer) score += 10;
          if (visa.requirements.salary && profile.salary && profile.salary >= visa.requirements.salary) score += 10;
        }

        suggestions.push({
          ...visa,
          matchScore: score,
          country
        });
      }
    });
  });

  // Sort by match score
  suggestions.sort((a, b) => b.matchScore - a.matchScore);

  return suggestions;
}

export function getCountries() {
  return Object.keys(VISA_CATEGORIES);
}

export function getBaseDocumentsForPurpose(purpose) {
  if (purpose.includes('Study')) return BASE_DOCUMENTS.student;
  if (purpose.includes('Work')) return BASE_DOCUMENTS.work;
  if (purpose.includes('Migration')) return BASE_DOCUMENTS.migration;
  if (purpose.includes('Business')) return BASE_DOCUMENTS.business;
  if (purpose.includes('Family')) return BASE_DOCUMENTS.family;
  if (purpose.includes('Internship')) return BASE_DOCUMENTS.internship;
  return BASE_DOCUMENTS.work;
}
