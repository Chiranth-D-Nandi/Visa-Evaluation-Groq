# Software Requirements Specification (SRS)

## OpenSphere - Multi-Country Visa Evaluation Platform

**Version:** 1.0  
**Date:** January 4, 2026  
**Prepared By:** OpenSphere Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Other Requirements](#6-other-requirements)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for OpenSphere, a web-based multi-country visa evaluation platform. This document is intended for stakeholders, developers, testers, and project managers involved in the development and deployment of the system.

### 1.2 Scope

OpenSphere is a comprehensive visa eligibility assessment platform that leverages AI-powered document analysis to evaluate users' eligibility for various visa categories across multiple countries. The system provides:

- Multi-country visa eligibility scoring
- AI-powered document extraction and analysis
- Real-time visa category recommendations
- Comparative analysis across visa programs
- Detailed evaluation reports with official sources

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| API | Application Programming Interface |
| LLM | Large Language Model |
| UI | User Interface |
| PDF | Portable Document Format |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |

### 1.4 References

- IEEE Std 830-1998 - IEEE Recommended Practice for Software Requirements Specifications
- Official immigration portals of supported countries
- Groq API Documentation
- MongoDB Documentation
- React.js Documentation

### 1.5 Overview

This document is organized into six main sections covering the introduction, overall system description, detailed system features, interface requirements, non-functional requirements, and other supplementary requirements.

---

## 2. Overall Description

### 2.1 Product Perspective

OpenSphere is a standalone web application that integrates with:

- **Groq AI API**: For intelligent document analysis and report generation
- **MongoDB Atlas**: For persistent data storage
- **File Storage System**: For document upload management

The system architecture follows a client-server model with a React.js frontend and Node.js/Express backend.

### 2.2 Product Functions

The major functions of OpenSphere include:

1. **User Registration & Profile Management**: Collect user details including name, email, destination country, and immigration purpose
2. **Document Upload & Processing**: Accept and process various document types (PDF, images, DOC)
3. **AI Document Extraction**: Extract relevant information from uploaded documents using LLM
4. **Visa Category Suggestion**: Recommend suitable visa categories based on user profile
5. **Eligibility Scoring**: Calculate visa eligibility scores based on official criteria
6. **Comparative Analysis**: Compare eligibility across multiple visa programs
7. **Report Generation**: Generate detailed evaluation reports with recommendations

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Expertise |
|------------|-------------|---------------------|
| Applicants | Individuals seeking visa eligibility assessment | Basic computer literacy |
| Immigration Partners | Consultants using the platform for clients | Moderate technical skills |
| Administrators | System administrators managing the platform | Advanced technical skills |

### 2.4 Operating Environment

- **Client Side**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server Side**: Node.js v18+ runtime environment
- **Database**: MongoDB Atlas (cloud-hosted)
- **Hosting**: Compatible with cloud platforms (AWS, Azure, Vercel)

### 2.5 Design and Implementation Constraints

- Must comply with data protection regulations (GDPR)
- API rate limits from Groq (14,400 requests/day on free tier)
- Document file size limit of 10MB per upload
- Response time target under 30 seconds for AI analysis

### 2.6 Assumptions and Dependencies

- Users have stable internet connectivity
- Uploaded documents are in supported formats
- Groq API service availability
- MongoDB Atlas service availability

---

## 3. System Features

### 3.1 User Registration and Profile Setup

**Description:** Allow users to provide personal information and immigration preferences.

**Priority:** High

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-1.1 | System shall collect user's full name with validation (2-100 characters, letters only) |
| FR-1.2 | System shall collect and validate email address using RFC 5322 compliant regex |
| FR-1.3 | System shall provide dropdown selection for destination country |
| FR-1.4 | System shall provide dropdown selection for immigration purpose |
| FR-1.5 | System shall validate all required fields before proceeding |

**Supported Countries:**
- Germany
- Canada
- Ireland
- Netherlands
- Australia
- Poland
- France
- Italy
- United Kingdom

**Supported Immigration Purposes:**
- Bachelor's Degree Study
- Master's Degree Study
- PhD/Research
- Work - Job Offer
- Work - Job Seeking
- Skilled Migration
- Business/Entrepreneurship
- Family Reunification
- Internship/Training

### 3.2 Document Upload System

**Description:** Enable users to upload supporting documents for visa evaluation.

**Priority:** High

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-2.1 | System shall accept PDF, DOC, DOCX, JPG, JPEG, PNG file formats |
| FR-2.2 | System shall enforce maximum file size of 10MB per document |
| FR-2.3 | System shall display upload progress indicator |
| FR-2.4 | System shall show success confirmation upon upload completion |
| FR-2.5 | System shall generate dynamic document checklist based on immigration purpose |
| FR-2.6 | System shall mark Resume/CV as mandatory document |

**Document Categories by Purpose:**

For Study Purposes:
- Passport
- Resume/CV
- Academic Transcripts
- Degree Certificates
- English Proficiency Test
- Statement of Purpose
- Financial Proof

For Work Purposes:
- Passport
- Resume/CV
- Degree Certificates
- Work Experience Letters
- Job Offer Letter
- Salary Proof
- Skills Certifications

### 3.3 AI Document Analysis

**Description:** Extract and analyze information from uploaded documents using AI.

**Priority:** High

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-3.1 | System shall extract text content from uploaded documents |
| FR-3.2 | System shall identify education level and field of study |
| FR-3.3 | System shall calculate total years of work experience |
| FR-3.4 | System shall extract skills and certifications |
| FR-3.5 | System shall identify language proficiency scores |
| FR-3.6 | System shall detect salary information from offer letters |

### 3.4 Visa Category Suggestion

**Description:** Recommend suitable visa categories based on extracted profile data.

**Priority:** High

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-4.1 | System shall analyze user profile against visa requirements |
| FR-4.2 | System shall generate match score (0-100%) for each visa category |
| FR-4.3 | System shall display top recommended visa categories |
| FR-4.4 | System shall show visa description and official name |
| FR-4.5 | System shall display key requirements for each visa |
| FR-4.6 | System shall show processing duration estimates |

### 3.5 Eligibility Scoring

**Description:** Calculate detailed eligibility scores based on official visa criteria.

**Priority:** High

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-5.1 | System shall calculate overall eligibility score (0-100) |
| FR-5.2 | System shall provide breakdown by category (education, experience, salary, etc.) |
| FR-5.3 | System shall determine passing threshold for each visa type |
| FR-5.4 | System shall indicate pass/fail status |
| FR-5.5 | System shall calculate confidence level for assessment |
| FR-5.6 | System shall identify strengths and areas for improvement |

**Scoring Categories:**
- Education (max 25 points)
- Work Experience (max 25 points)
- Salary/Income (max 15 points)
- Language Proficiency (max 15 points)
- Job Offer (max 10 points)
- Age (max 10 points)

### 3.6 Results and Reporting

**Description:** Display comprehensive evaluation results with recommendations.

**Priority:** High

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-6.1 | System shall display overall eligibility score with visual indicator |
| FR-6.2 | System shall show detailed breakdown with progress bars |
| FR-6.3 | System shall list strengths identified in profile |
| FR-6.4 | System shall list areas requiring improvement |
| FR-6.5 | System shall provide actionable recommendations |
| FR-6.6 | System shall display official source links |
| FR-6.7 | System shall enable PDF report download |
| FR-6.8 | System shall support print functionality |

### 3.7 Multi-Country Comparison

**Description:** Compare eligibility across different countries and visa programs.

**Priority:** Medium

**Functional Requirements:**

| ID | Requirement |
|----|-------------|
| FR-7.1 | System shall evaluate profile against all supported visa programs |
| FR-7.2 | System shall rank visa programs by eligibility score |
| FR-7.3 | System shall display comparison table with scores |
| FR-7.4 | System shall highlight best match recommendation |
| FR-7.5 | System shall show pass/fail status for each program |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

**General UI Requirements:**

| ID | Requirement |
|----|-------------|
| UI-1.1 | Interface shall be responsive across desktop, tablet, and mobile devices |
| UI-1.2 | Interface shall follow modern design principles (clean, minimal) |
| UI-1.3 | Interface shall provide clear navigation with progress indicator |
| UI-1.4 | Interface shall display loading states during processing |
| UI-1.5 | Interface shall show error messages in clear, user-friendly language |

**Screen Specifications:**

1. **Evaluation Page**
   - Multi-step form wizard (4 steps)
   - Progress bar showing current step
   - Form validation with inline errors
   - Document upload interface with drag-and-drop

2. **Results Page**
   - Score display with color-coded indicators
   - Breakdown section with visual bars
   - Recommendations section
   - Official sources section
   - Action buttons (compare, download, home)

### 4.2 Hardware Interfaces

No specific hardware interfaces required. The system operates entirely through standard web browsers.

### 4.3 Software Interfaces

| Interface | Description | Protocol |
|-----------|-------------|----------|
| Groq API | AI/LLM services for document analysis | HTTPS REST |
| MongoDB Atlas | Cloud database for data persistence | MongoDB Wire Protocol |
| File System | Local storage for uploaded documents | Node.js fs module |

### 4.4 Communications Interfaces

| Protocol | Usage |
|----------|-------|
| HTTPS | All client-server communication |
| WebSocket | Optional real-time updates (future) |
| SMTP | Email notifications (future) |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement |
|----|-------------|
| NFR-1.1 | Page load time shall not exceed 3 seconds |
| NFR-1.2 | Document upload shall complete within 10 seconds for 10MB file |
| NFR-1.3 | AI analysis shall complete within 30 seconds |
| NFR-1.4 | System shall support 100 concurrent users minimum |
| NFR-1.5 | API response time shall not exceed 5 seconds for non-AI endpoints |

### 5.2 Safety Requirements

| ID | Requirement |
|----|-------------|
| NFR-2.1 | System shall not provide legal immigration advice |
| NFR-2.2 | System shall display disclaimer about unofficial nature of assessments |
| NFR-2.3 | System shall recommend consultation with immigration professionals |

### 5.3 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-3.1 | All data transmission shall use HTTPS encryption |
| NFR-3.2 | Uploaded documents shall be stored securely |
| NFR-3.3 | User passwords shall be hashed using bcrypt |
| NFR-3.4 | API endpoints shall validate input to prevent injection attacks |
| NFR-3.5 | Session management shall implement secure token handling |

### 5.4 Software Quality Attributes

**Reliability:**
- System uptime target: 99.5%
- Graceful error handling for API failures
- Automatic retry for transient failures

**Availability:**
- 24/7 availability target
- Scheduled maintenance windows communicated in advance

**Maintainability:**
- Modular code architecture
- Comprehensive code documentation
- Version control using Git

**Portability:**
- Cross-browser compatibility
- Responsive design for multiple screen sizes
- Platform-independent backend

**Scalability:**
- Horizontal scaling capability
- Database indexing for performance
- Caching implementation for frequently accessed data

### 5.5 Business Rules

| ID | Rule |
|----|------|
| BR-1 | Eligibility scores are advisory and do not guarantee visa approval |
| BR-2 | Users must accept terms of service before evaluation |
| BR-3 | Document retention policy: 30 days after evaluation |
| BR-4 | Free tier limited to 3 evaluations per email per month |

---

## 6. Other Requirements

### 6.1 Database Requirements

**Collections:**

1. **Evaluations Collection**
   - evaluationId (ObjectId)
   - userId (String)
   - country (String)
   - visaType (String)
   - score (Number)
   - breakdown (Object)
   - createdAt (Date)
   - updatedAt (Date)

2. **Partners Collection**
   - partnerId (ObjectId)
   - companyName (String)
   - email (String)
   - apiKey (String)
   - createdAt (Date)

### 6.2 Legal Requirements

- Compliance with GDPR for EU users
- Clear privacy policy documentation
- Terms of service acceptance
- Data deletion capability upon request

### 6.3 Internationalization Requirements

- Support for English language (primary)
- Date/time format localization
- Currency conversion for salary requirements (future)

---

## Appendix A: Visa Categories Supported

### Germany
- EU Blue Card
- Job Seeker Visa
- Skilled Worker Visa
- Student Visa

### Canada
- Express Entry (Federal Skilled Worker)
- Provincial Nominee Program
- Study Permit
- Work Permit

### Ireland
- Critical Skills Employment Permit
- General Employment Permit
- Stamp 1G (Graduate Visa)
- Student Visa

### Australia
- Skilled Independent Visa (189)
- Skilled Nominated Visa (190)
- Graduate Visa (485)
- Student Visa (500)

### United Kingdom
- Skilled Worker Visa
- Graduate Route
- Global Talent Visa
- Student Visa

---

## Appendix B: System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React.js Frontend (Vite)                │   │
│  │  - Evaluation Page    - Results Page                 │   │
│  │  - Home Page          - Partner Dashboard            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER LAYER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Node.js/Express Backend                   │   │
│  │  - /api/evaluation    - /api/upload                  │   │
│  │  - /api/partner       - /api/compare                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  MongoDB Atlas  │ │    Groq API     │ │  File Storage   │
│   (Database)    │ │  (AI Analysis)  │ │   (Documents)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Appendix C: Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Product Owner | | | |
| Quality Assurance | | | |

---

**Document Control:**
- Version 1.0 - Initial Release - January 4, 2026

---

*This document is confidential and intended for authorized personnel only.*
