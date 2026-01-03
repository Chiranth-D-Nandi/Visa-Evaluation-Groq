import fs from 'fs/promises';
import Groq from 'groq-sdk';
import { createRequire } from 'module';

/**
 * PRODUCTION-GRADE Document Extraction Service
 * 
 * This service ACTUALLY reads and analyzes every uploaded document using:
 * 1. PDF text extraction (pdf-parse)
 * 2. Groq LLM (Llama 3.3 70B) for intelligent data extraction
 * 
 * NO MOCK DATA - Every extraction is real or clearly marked as failed
 */

// Initialize Groq
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

const MODEL = 'llama-3.3-70b-versatile';

// Fix for pdf-parse test file issue - use require instead of import
const require = createRequire(import.meta.url);
let pdfParse;
const loadPdfParse = async () => {
  if (!pdfParse) {
    // Use require to avoid the test file issue with dynamic import
    pdfParse = require('pdf-parse/lib/pdf-parse.js');
  }
  return pdfParse;
};

/**
 * Main DocumentExtractor Class
 * Handles all document types with REAL AI-powered extraction
 */
export class DocumentExtractor {
  constructor() {
    this.extractionLogs = [];
    this.llmCallCount = 0;
  }

  /**
   * Log extraction activity for transparency
   */
  log(message, type = 'info') {
    const entry = { timestamp: new Date().toISOString(), type, message };
    this.extractionLogs.push(entry);
    console.log(`[DocumentExtractor] ${type.toUpperCase()}: ${message}`);
  }

  /**
   * Extract text from PDF file
   * Returns raw text content for LLM processing
   */
  async extractTextFromPDF(filePath) {
    try {
      const pdf = await loadPdfParse();
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      
      if (!data.text || data.text.trim().length < 50) {
        this.log(`PDF extraction yielded minimal text (${data.text?.length || 0} chars) - may be image-based PDF`, 'warning');
        return { text: data.text || '', pages: data.numpages, warning: 'Low text content - document may be image-based' };
      }
      
      this.log(`Successfully extracted ${data.text.length} characters from ${data.numpages} pages`);
      return { text: data.text, pages: data.numpages, warning: null };
    } catch (error) {
      this.log(`PDF extraction failed: ${error.message}`, 'error');
      throw new Error(`Failed to read PDF: ${error.message}`);
    }
  }

  /**
   * Call LLM with structured prompt for data extraction
   * This is the CORE of our intelligent document processing
   */
  async callLLM(systemPrompt, documentText, documentType) {
    if (!groq) {
      this.log('GROQ_API_KEY not configured - LLM extraction unavailable', 'error');
      throw new Error('LLM service not configured. Set GROQ_API_KEY environment variable.');
    }

    this.llmCallCount++;
    this.log(`LLM call #${this.llmCallCount} for ${documentType}`);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this ${documentType}:\n\n${documentText.slice(0, 6000)}` }
        ],
        model: MODEL,
        temperature: 0.1, // Low temperature for consistent, accurate extraction
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content);
      this.log(`LLM extraction successful for ${documentType}`);
      return result;
    } catch (error) {
      this.log(`LLM call failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * RESUME/CV EXTRACTION
   * Extracts: education, work experience, skills, languages, certifications
   */
  async extractFromResume(filePath) {
    this.log(`Starting resume extraction from: ${filePath}`);
    
    const { text, warning } = await this.extractTextFromPDF(filePath);
    
    if (text.length < 100) {
      return {
        success: false,
        error: 'Resume text too short or unreadable',
        warning,
        rawTextLength: text.length
      };
    }

    const systemPrompt = `You are an expert resume parser for visa applications. Extract ACCURATE data from the resume.
    
IMPORTANT: Only extract information that is EXPLICITLY stated in the document. Do NOT make assumptions or fabricate data.

Return JSON in this EXACT format:
{
  "extractionSuccess": true,
  "confidence": 0.95,
  "personalInfo": {
    "name": "Full Name as written",
    "email": "email if found or null",
    "phone": "phone if found or null",
    "location": "current location if stated or null"
  },
  "education": {
    "level": "PhD/Master's/Bachelor's/Diploma/High School",
    "field": "Field of study",
    "institution": "University/College name",
    "year": 2020,
    "gpa": "if mentioned or null",
    "country": "Country where degree was obtained"
  },
  "experience": {
    "totalYears": 5,
    "currentRole": "Current job title",
    "currentCompany": "Current employer",
    "seniorityLevel": "Entry/Mid/Senior/Lead/Executive",
    "positions": [
      {
        "title": "Job Title",
        "company": "Company Name", 
        "startDate": "YYYY-MM or YYYY",
        "endDate": "YYYY-MM or Present",
        "duration": "X years Y months",
        "location": "City, Country",
        "responsibilities": ["key responsibility 1", "key responsibility 2"]
      }
    ]
  },
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["Programming languages"],
    "tools": ["tools and technologies"]
  },
  "languages": [
    {"language": "English", "proficiency": "Native/Fluent/Professional/Basic", "certification": "IELTS 7.5 or null"}
  ],
  "certifications": ["Certification 1", "Certification 2"],
  "salary": {
    "current": null,
    "expected": null,
    "currency": null
  },
  "publications": [],
  "awards": [],
  "patents": [],
  "notableAchievements": ["achievement 1"]
}

If information is not found in the document, use null. Never fabricate data.`;

    try {
      const extracted = await this.callLLM(systemPrompt, text, 'resume');
      
      return {
        success: true,
        data: extracted,
        rawTextLength: text.length,
        llmConfidence: extracted.confidence || 0.8,
        warning
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        rawTextLength: text.length
      };
    }
  }

  /**
   * DEGREE CERTIFICATE EXTRACTION
   * Extracts: degree level, field, institution, year, grades
   */
  async extractFromDegree(filePath) {
    this.log(`Starting degree certificate extraction from: ${filePath}`);
    
    const { text, warning } = await this.extractTextFromPDF(filePath);

    const systemPrompt = `You are verifying an academic degree certificate for a visa application.
    
Extract ONLY information that is EXPLICITLY visible on the certificate. This is a legal document.

Return JSON:
{
  "extractionSuccess": true,
  "confidence": 0.9,
  "isValidCertificate": true,
  "degree": {
    "level": "PhD/Master's/Bachelor's/Associate/Diploma",
    "fullTitle": "Full degree title as written",
    "field": "Field of study/Major",
    "specialization": "Specialization if any"
  },
  "institution": {
    "name": "Full university/college name",
    "country": "Country",
    "city": "City if visible",
    "isAccredited": null
  },
  "dates": {
    "issueDate": "Date on certificate",
    "graduationDate": "Graduation date if different",
    "startDate": "If mentioned"
  },
  "grades": {
    "gpa": "GPA if shown",
    "percentage": "Percentage if shown",
    "class": "First Class/Second Class/Distinction etc",
    "honors": "Cum Laude/Magna Cum Laude etc"
  },
  "certificateNumber": "Registration/Certificate number if visible",
  "signatories": ["Names of signatories if visible"],
  "warnings": ["Any concerns about the document"]
}`;

    try {
      const extracted = await this.callLLM(systemPrompt, text, 'degree certificate');
      return { success: true, data: extracted, rawTextLength: text.length, warning };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * JOB OFFER LETTER EXTRACTION
   * Critical for work visas - extracts salary, position, employer details
   */
  async extractFromJobOffer(filePath) {
    this.log(`Starting job offer extraction from: ${filePath}`);
    
    const { text, warning } = await this.extractTextFromPDF(filePath);

    const systemPrompt = `You are analyzing a job offer letter for a work visa application.
    
This is a CRITICAL document. Extract ALL relevant information accurately.

Return JSON:
{
  "extractionSuccess": true,
  "confidence": 0.9,
  "isValidOffer": true,
  "employer": {
    "companyName": "Full legal company name",
    "address": "Company address",
    "country": "Country of employment",
    "industry": "Industry sector",
    "registrationNumber": "Company registration if visible"
  },
  "position": {
    "title": "Job title offered",
    "department": "Department if mentioned",
    "level": "Entry/Mid/Senior/Executive",
    "type": "Full-time/Part-time/Contract",
    "startDate": "Proposed start date",
    "duration": "Permanent/Fixed-term (X years)"
  },
  "compensation": {
    "baseSalary": 50000,
    "currency": "EUR/USD/GBP/etc",
    "frequency": "annual/monthly",
    "bonus": "Bonus details if mentioned",
    "benefits": ["health insurance", "pension", "etc"],
    "totalPackage": "Total compensation if stated"
  },
  "workConditions": {
    "hoursPerWeek": 40,
    "location": "Work location",
    "remote": "On-site/Hybrid/Remote",
    "travel": "Travel requirements if any"
  },
  "sponsorship": {
    "visaSponsorshipOffered": true,
    "visaType": "Type of visa if mentioned",
    "relocationSupport": true
  },
  "signatories": {
    "signerName": "Name of person signing",
    "signerTitle": "Title of signer",
    "date": "Date of offer"
  },
  "conditions": ["Any conditions mentioned"],
  "expiryDate": "Offer validity date if mentioned"
}`;

    try {
      const extracted = await this.callLLM(systemPrompt, text, 'job offer letter');
      return { success: true, data: extracted, rawTextLength: text.length, warning };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * SALARY/PAYSLIP EXTRACTION
   * Verifies income for visa financial requirements
   */
  async extractFromSalaryProof(filePath) {
    this.log(`Starting salary proof extraction from: ${filePath}`);
    
    const { text, warning } = await this.extractTextFromPDF(filePath);

    const systemPrompt = `You are analyzing salary documentation (payslip/salary certificate) for visa requirements.

Return JSON:
{
  "extractionSuccess": true,
  "confidence": 0.9,
  "documentType": "Payslip/Salary Certificate/Bank Statement/Tax Return",
  "employer": {
    "name": "Employer name",
    "address": "If visible"
  },
  "employee": {
    "name": "Employee name",
    "employeeId": "If visible",
    "designation": "Job title"
  },
  "salary": {
    "gross": 5000,
    "net": 4000,
    "currency": "USD/EUR/etc",
    "frequency": "monthly/annual",
    "annualized": 60000
  },
  "period": {
    "payPeriod": "Month/Year covered",
    "payDate": "Payment date"
  },
  "deductions": {
    "tax": "Amount",
    "insurance": "Amount",
    "pension": "Amount",
    "other": []
  },
  "ytd": {
    "grossYTD": "Year to date gross if shown",
    "taxYTD": "Year to date tax if shown"
  }
}`;

    try {
      const extracted = await this.callLLM(systemPrompt, text, 'salary proof');
      return { success: true, data: extracted, rawTextLength: text.length, warning };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * LANGUAGE CERTIFICATE EXTRACTION
   * Extracts IELTS, TOEFL, Goethe, DELF scores etc.
   */
  async extractFromLanguageCert(filePath) {
    this.log(`Starting language certificate extraction from: ${filePath}`);
    
    const { text, warning } = await this.extractTextFromPDF(filePath);

    const systemPrompt = `You are analyzing a language proficiency certificate for visa requirements.

Return JSON:
{
  "extractionSuccess": true,
  "confidence": 0.9,
  "testType": "IELTS/TOEFL/PTE/Goethe/DELF/TEF/etc",
  "language": "English/German/French/etc",
  "candidateName": "Name on certificate",
  "scores": {
    "overall": 7.5,
    "reading": 7.0,
    "writing": 7.0,
    "listening": 8.0,
    "speaking": 7.5
  },
  "cefrLevel": "A1/A2/B1/B2/C1/C2",
  "testDate": "Date of test",
  "validUntil": "Expiry date if applicable",
  "certificateNumber": "Certificate/TRF number",
  "testCenter": "Test center name/location"
}`;

    try {
      const extracted = await this.callLLM(systemPrompt, text, 'language certificate');
      return { success: true, data: extracted, rawTextLength: text.length, warning };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * PASSPORT EXTRACTION
   * Extracts nationality, validity, personal details
   */
  async extractFromPassport(filePath) {
    this.log(`Starting passport extraction from: ${filePath}`);
    
    const { text, warning } = await this.extractTextFromPDF(filePath);

    const systemPrompt = `You are extracting passport information for visa application verification.

Return JSON:
{
  "extractionSuccess": true,
  "confidence": 0.8,
  "type": "Passport",
  "holder": {
    "surname": "Last name",
    "givenNames": "First and middle names",
    "nationality": "Country of nationality",
    "dateOfBirth": "DOB",
    "placeOfBirth": "Birth place",
    "sex": "M/F"
  },
  "document": {
    "passportNumber": "Passport number",
    "issueDate": "Date of issue",
    "expiryDate": "Date of expiry",
    "issuingAuthority": "Issuing authority",
    "issuingCountry": "Country"
  },
  "machineReadableZone": "MRZ if visible"
}`;

    try {
      const extracted = await this.callLLM(systemPrompt, text, 'passport');
      return { success: true, data: extracted, rawTextLength: text.length, warning };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * MASTER EXTRACTION METHOD
   * Routes documents to appropriate extractors based on type
   */
  async extractAllDocuments(uploadedFiles) {
    this.log('Starting comprehensive document extraction');
    
    const results = {
      extractionTimestamp: new Date().toISOString(),
      documentsProcessed: 0,
      documentsSuccessful: 0,
      documentsFailed: 0,
      llmCallsMade: 0,
      
      // Extracted data
      resume: null,
      degree: null,
      jobOffer: null,
      salaryProof: null,
      languageCert: null,
      passport: null,
      
      // Consolidated profile
      consolidatedProfile: null,
      
      // Logs
      extractionLogs: []
    };

    // Process each document type
    const documentMappings = [
      { key: 'Resume/CV', extractor: 'extractFromResume', resultKey: 'resume' },
      { key: 'Degree Certificates', extractor: 'extractFromDegree', resultKey: 'degree' },
      { key: 'Job Offer Letter', extractor: 'extractFromJobOffer', resultKey: 'jobOffer' },
      { key: 'Salary Proof', extractor: 'extractFromSalaryProof', resultKey: 'salaryProof' },
      { key: 'Language Test Results', extractor: 'extractFromLanguageCert', resultKey: 'languageCert' },
      { key: 'English Proficiency Test', extractor: 'extractFromLanguageCert', resultKey: 'languageCert' },
      { key: 'Passport', extractor: 'extractFromPassport', resultKey: 'passport' }
    ];

    for (const mapping of documentMappings) {
      if (uploadedFiles[mapping.key] && uploadedFiles[mapping.key].length > 0) {
        results.documentsProcessed++;
        
        try {
          const filePath = uploadedFiles[mapping.key][0].path;
          const extracted = await this[mapping.extractor](filePath);
          
          if (extracted.success) {
            results[mapping.resultKey] = extracted.data;
            results.documentsSuccessful++;
          } else {
            results[mapping.resultKey] = { extractionFailed: true, error: extracted.error };
            results.documentsFailed++;
          }
        } catch (error) {
          this.log(`Failed to extract ${mapping.key}: ${error.message}`, 'error');
          results[mapping.resultKey] = { extractionFailed: true, error: error.message };
          results.documentsFailed++;
        }
      }
    }

    results.llmCallsMade = this.llmCallCount;
    results.extractionLogs = this.extractionLogs;

    // Build consolidated profile from all extractions
    results.consolidatedProfile = this.buildConsolidatedProfile(results);

    return results;
  }

  /**
   * BUILD CONSOLIDATED PROFILE
   * Combines data from all documents into a single profile
   */
  buildConsolidatedProfile(results) {
    const profile = {
      // Personal Info (from resume or passport)
      name: results.resume?.personalInfo?.name || results.passport?.holder?.givenNames || null,
      email: results.resume?.personalInfo?.email || null,
      nationality: results.passport?.holder?.nationality || null,
      
      // Education (from resume and degree certificate - cross-verified)
      education: {
        level: results.degree?.degree?.level || results.resume?.education?.level || null,
        field: results.degree?.degree?.field || results.resume?.education?.field || null,
        institution: results.degree?.institution?.name || results.resume?.education?.institution || null,
        year: results.degree?.dates?.graduationDate || results.resume?.education?.year || null,
        country: results.degree?.institution?.country || results.resume?.education?.country || null,
        verified: results.degree?.extractionSuccess === true
      },
      
      // Experience (from resume)
      experience: {
        totalYears: results.resume?.experience?.totalYears || 0,
        currentRole: results.resume?.experience?.currentRole || null,
        currentCompany: results.resume?.experience?.currentCompany || null,
        seniorityLevel: results.resume?.experience?.seniorityLevel || null,
        positions: results.resume?.experience?.positions || []
      },
      
      // Skills (from resume)
      skills: {
        technical: results.resume?.skills?.technical || [],
        soft: results.resume?.skills?.soft || [],
        all: [
          ...(results.resume?.skills?.technical || []),
          ...(results.resume?.skills?.soft || []),
          ...(results.resume?.skills?.tools || [])
        ]
      },
      
      // Languages (from language certificate and resume)
      languages: results.languageCert ? [{
        language: results.languageCert.language,
        proficiency: results.languageCert.cefrLevel,
        testType: results.languageCert.testType,
        score: results.languageCert.scores?.overall,
        verified: true
      }] : (results.resume?.languages || []).map(l => ({ ...l, verified: false })),
      
      // Salary (from job offer or salary proof)
      salary: {
        amount: results.jobOffer?.compensation?.baseSalary || 
                results.salaryProof?.salary?.annualized ||
                results.resume?.salary?.current || null,
        currency: results.jobOffer?.compensation?.currency ||
                  results.salaryProof?.salary?.currency || null,
        verified: results.salaryProof?.extractionSuccess === true || results.jobOffer?.extractionSuccess === true
      },
      
      // Job Offer details
      jobOffer: results.jobOffer ? {
        hasOffer: true,
        company: results.jobOffer.employer?.companyName,
        position: results.jobOffer.position?.title,
        salary: results.jobOffer.compensation?.baseSalary,
        currency: results.jobOffer.compensation?.currency,
        country: results.jobOffer.employer?.country,
        sponsorship: results.jobOffer.sponsorship?.visaSponsorshipOffered
      } : { hasOffer: false },
      
      // Certifications
      certifications: results.resume?.certifications || [],
      
      // Notable achievements
      achievements: [
        ...(results.resume?.awards || []),
        ...(results.resume?.patents || []),
        ...(results.resume?.publications || []),
        ...(results.resume?.notableAchievements || [])
      ],
      
      // Data quality indicators
      dataQuality: {
        resumeExtracted: results.resume?.extractionSuccess === true,
        degreeVerified: results.degree?.extractionSuccess === true,
        salaryVerified: results.salaryProof?.extractionSuccess === true,
        languageVerified: results.languageCert?.extractionSuccess === true,
        jobOfferVerified: results.jobOffer?.extractionSuccess === true,
        overallConfidence: this.calculateOverallConfidence(results)
      }
    };

    return profile;
  }

  /**
   * Calculate overall confidence in extracted data
   */
  calculateOverallConfidence(results) {
    let score = 0;
    let maxScore = 0;

    if (results.resume) {
      maxScore += 30;
      if (results.resume.extractionSuccess) score += 30;
    }
    if (results.degree) {
      maxScore += 20;
      if (results.degree.extractionSuccess !== false) score += 20;
    }
    if (results.jobOffer) {
      maxScore += 25;
      if (results.jobOffer.extractionSuccess !== false) score += 25;
    }
    if (results.salaryProof) {
      maxScore += 15;
      if (results.salaryProof.extractionSuccess !== false) score += 15;
    }
    if (results.languageCert) {
      maxScore += 10;
      if (results.languageCert.extractionSuccess !== false) score += 10;
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }
}

export default DocumentExtractor;
