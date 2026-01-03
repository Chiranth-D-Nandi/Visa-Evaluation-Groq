import Groq from 'groq-sdk';

/**
 * FREE LLM Service using Groq
 * - 14,400 requests/day free tier
 * - No credit card required
 * - Fast inference (up to 750 tokens/sec)
 * - Models: Llama 3.3 70B, Mixtral 8x7B, Gemma 7B
 * 
 * Get your free API key: https://console.groq.com/keys
 */

const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

// Default to fast, smart model
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'; // Great balance of speed and intelligence

/**
 * Extract structured data from resume text using free Groq LLM
 */
export async function extractResumeData(resumeText) {
  if (!groq) {
    console.warn('⚠️ GROQ_API_KEY not set. Using mock data.');
    return getMockResumeData();
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional resume parser. Extract structured data from resumes and return valid JSON only.
Return format:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "education": {
    "level": "Bachelor's/Master's/PhD",
    "field": "Computer Science",
    "institution": "University Name",
    "year": 2020,
    "country": "USA"
  },
  "experience": {
    "totalYears": 5,
    "currentRole": "Software Engineer",
    "currentCompany": "Company Name",
    "positions": [{"title": "Role", "company": "Company", "duration": "2 years", "location": "City, Country"}]
  },
  "skills": ["Python", "JavaScript", "React"],
  "languages": ["English - Native", "Spanish - Fluent"],
  "salary": 75000,
  "certifications": ["AWS Certified", "PMP"]
}`
        },
        {
          role: 'user',
          content: `Extract data from this resume:\n\n${resumeText.slice(0, 4000)}`
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    console.log('✅ Groq: Resume data extracted successfully');
    return result;
  } catch (error) {
    console.error('❌ Groq extraction error:', error.message);
    return getMockResumeData();
  }
}

/**
 * Extract degree certificate data
 */
export async function extractDegreeData(degreeText) {
  if (!groq) {
    return { level: 'Bachelor\'s', field: 'Computer Science', year: 2020, institution: 'Sample University' };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Extract degree information and return JSON: {"level": "Bachelor\'s/Master\'s/PhD", "field": "Major", "institution": "University", "year": 2020, "gpa": 3.8, "honors": "Cum Laude"}'
        },
        {
          role: 'user',
          content: degreeText.slice(0, 2000)
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Degree extraction error:', error.message);
    return { level: 'Bachelor\'s', field: 'Computer Science', year: 2020 };
  }
}

/**
 * Generate detailed visa evaluation explanation
 */
export async function generateEvaluationReport(profile, visaRequirements, score, missingDocs) {
  if (!groq) {
    return generateMockReport(score);
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a visa consultant expert. Generate a detailed, professional visa eligibility report.
Be specific, encouraging, and actionable. Include:
1. Overall assessment
2. Strengths in the application
3. Areas needing improvement
4. Specific document requirements
5. Realistic timeline and next steps`
        },
        {
          role: 'user',
          content: `Generate a visa evaluation report:

Applicant Profile:
${JSON.stringify(profile, null, 2)}

Visa Requirements:
${JSON.stringify(visaRequirements, null, 2)}

Eligibility Score: ${score}/100
Missing Documents: ${missingDocs.join(', ') || 'None'}

Generate a comprehensive, professional report.`
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Report generation error:', error.message);
    return generateMockReport(score);
  }
}

/**
 * Analyze profile and suggest improvements using AI
 */
export async function analyzeProfileForVisa(profile, visaType, country) {
  if (!groq) {
    return {
      strengths: ['Good educational background', 'Relevant work experience'],
      weaknesses: ['Salary below threshold', 'Missing language certificate'],
      suggestions: ['Obtain IELTS score of 7+', 'Increase salary to meet minimum', 'Get job offer letter']
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a visa expert. Analyze applicant profiles and provide actionable advice. Return JSON: {"strengths": ["point1", "point2"], "weaknesses": ["point1"], "suggestions": ["action1", "action2"], "timeline": "6-12 months"}'
        },
        {
          role: 'user',
          content: `Analyze this profile for ${visaType} visa to ${country}:\n${JSON.stringify(profile, null, 2)}`
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0.6,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Profile analysis error:', error.message);
    return {
      strengths: ['Good educational background'],
      weaknesses: ['Review required documents'],
      suggestions: ['Complete all required documentation']
    };
  }
}

// Mock data fallbacks
function getMockResumeData() {
  return {
    name: 'Sample Applicant',
    email: 'applicant@example.com',
    phone: '+1234567890',
    education: {
      level: 'Master\'s',
      field: 'Computer Science',
      institution: 'Sample University',
      year: 2020,
      country: 'USA'
    },
    experience: {
      totalYears: 5,
      currentRole: 'Software Engineer',
      currentCompany: 'Tech Corp',
      positions: [
        { title: 'Software Engineer', company: 'Tech Corp', duration: '3 years', location: 'San Francisco, USA' },
        { title: 'Junior Developer', company: 'StartUp Inc', duration: '2 years', location: 'Austin, USA' }
      ]
    },
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'AWS'],
    languages: ['English - Native', 'Spanish - Intermediate'],
    salary: 85000,
    certifications: ['AWS Solutions Architect', 'Scrum Master']
  };
}

function generateMockReport(score) {
  return `## Visa Eligibility Assessment Report

**Overall Score:** ${score}/100

### Executive Summary
Based on your profile and documentation, you have ${score >= 70 ? 'a strong' : score >= 50 ? 'a moderate' : 'a developing'} visa application profile.

### Strengths
- Strong educational background
- Relevant professional experience
- Complete documentation submitted

### Areas for Improvement
- Consider obtaining additional certifications
- Strengthen language proficiency documentation
- Ensure all financial documents are up to date

### Recommended Next Steps
1. Review missing documents list
2. Prepare for visa interview
3. Submit application within 30 days

**Timeline:** 6-8 weeks for processing

*This is an automated assessment. Consult with immigration professionals for personalized advice.*`;
}

export default {
  extractResumeData,
  extractDegreeData,
  generateEvaluationReport,
  analyzeProfileForVisa
};
