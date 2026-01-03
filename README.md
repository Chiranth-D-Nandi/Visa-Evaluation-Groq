# Multi-Country Visa Evaluation Tool 🌍 

## 🆓 100% FREE - No Cost Solution!

A comprehensive visa eligibility evaluation platform supporting 9+ countries and 79+ visa categories. Built with React, Node.js, Express, MongoDB, and **FREE AI services**.

**💰 Total Cost: $0/month** (vs $500+/month with paid alternatives)

## 🎯 Features

- **Multi-Country Support**: Germany, Canada, Ireland, Netherlands, Australia, Poland, France, Italy, UK
- **FREE AI-Powered Analysis**: Document extraction using Groq (Llama 3.1 70B) - 14,400 requests/day FREE
- **Real Visa Requirements**: Travel Buddy AI API - 120 requests/month FREE
- **Purpose-Based Flow**: Select your goal → AI suggests best visa categories
- **79+ Visa Types**: Complete coverage including H1B, J1, EU Blue Card, Express Entry, etc.
- **Multi-Visa Comparison**: Compare eligibility across all visa types simultaneously
- **Partner Dashboard**: B2B SaaS features with API key authentication and lead tracking
- **Official Links**: Direct links to eVisa portals, embassy websites, registration forms

## 🆓 Free Services Used

| Service | Cost | Purpose | Limit |
|---------|------|---------|-------|
| **Groq** | FREE | LLM for document extraction & analysis | 14,400 requests/day |
| **Travel Buddy AI** | FREE | Real visa requirements & embassy links | 120 requests/month |
| **MongoDB** | FREE | Local database | Unlimited |
| **React + Vite** | FREE | Frontend framework | Unlimited |

**No credit card required for any service!**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation - FREE)
- Groq API key (FREE - no credit card)
- RapidAPI key for Travel Buddy (FREE tier)

### Installation

1. **Clone and Install Dependencies**
```bash
cd main
npm install groq-sdk axios express mongoose cors dotenv multer pdf-parse
```

2. **Get FREE API Keys** (5 minutes)

**Groq (FREE LLM):**
- Visit: https://console.groq.com/keys
- Sign up with Google/GitHub
- Create API Key → Copy it

**Travel Buddy AI (FREE Visa API):**
- Visit: https://rapidapi.com/TravelBuddyAI/api/visa-requirement
- Sign up on RapidAPI
- Subscribe to **Basic Plan** (FREE - 120/month)
- Copy your `X-RapidAPI-Key`

3. **Configure Environment Variables**

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/visa_evaluation

# FREE LLM - Groq (14,400 requests/day)
GROQ_API_KEY=gsk_your_key_here

# FREE Visa API - Travel Buddy (120 requests/month)
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=visa-requirement.p.rapidapi.com

PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

4. **Start MongoDB** (if using local instance)
```bash
mongod
```

5. **Run the Application**

In separate terminals:

```bash
# Terminal 1: Start Backend Server
npm run server:dev

# Terminal 2: Start Frontend Dev Server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
main/
├── server/                  # Backend Express server
│   ├── index.js            # Server entry point
│   ├── config/             # Visa configurations
│   │   └── visaConfigs.js  # Rules for all countries/visas
│   ├── models/             # MongoDB schemas
│   │   ├── Evaluation.js
│   │   └── Partner.js
│   ├── routes/             # API endpoints
│   │   ├── evaluation.js
│   │   ├── partner.js
│   │   └── upload.js
│   ├── services/           # Business logic
│   │   ├── scoringEngine.js      # Rule-based scoring
│   │   └── documentExtractor.js  # AI extraction
│   └── uploads/            # File storage
│
├── src/                    # Frontend React app
│   ├── pages/
│   │   ├── home.jsx              # Landing page
│   │   ├── Evaluation.jsx        # Multi-step form
│   │   ├── Results.jsx           # Results & comparison
│   │   └── PartnerDashboard.jsx  # B2B dashboard
│   └── App.jsx
│
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Evaluation
- `GET /api/evaluation/countries` - List all countries
- `GET /api/evaluation/countries/:country/visas` - Get visa types
- `GET /api/evaluation/requirements/:country/:visaType` - Get requirements
- `POST /api/evaluation/extract` - Extract data from documents
- `POST /api/evaluation/create` - Create evaluation
- `POST /api/evaluation/compare` - Compare visas across countries

### Partner
- `POST /api/partner/register` - Register new partner
- `GET /api/partner/me` - Get partner details
- `GET /api/partner/leads` - Get partner leads
- `GET /api/partner/stats` - Get analytics

### Upload
- `POST /api/upload` - Upload multiple documents
- `POST /api/upload/single` - Upload single document

## 🎓 Supported Visas

### Germany
- EU Blue Card
- ICT Permit

### Canada
- Express Entry

### Ireland
- Critical Skills Employment Permit

### Netherlands
- Knowledge Migrant Permit

### Australia
- Skilled Independent Visa (189)

### Poland
- Work Permit Type C

### France
- Talent Passport

### Italy
- Highly Qualified Worker Visa

### UK
- Skilled Worker Visa

## 🧪 Testing Partner Dashboard

1. Register a test partner:
```bash
curl -X POST http://localhost:3001/api/partner/register \
  -H "Content-Type: application/json" \
  -d '{
    "firmName": "Test Immigration Law Firm",
    "email": "test@firm.com",
    "contactPerson": "John Doe"
  }'
```

2. Copy the returned API key

3. Navigate to http://localhost:5173/partner and enter the API key

## 📊 How It Works

### 1. User Flow
1. **Visa Selection**: User selects country and visa type
2. **Document Upload**: Uploads required documents (resume, degrees, etc.)
3. **AI Extraction**: OpenAI extracts structured data
4. **User Confirmation**: User reviews and confirms extracted data
5. **Evaluation**: Rule-based engine calculates score
6. **Results**: Display score, breakdown, recommendations, and comparison

### 2. Scoring Logic

Each visa has weighted requirements:
- **Education**: 15-25 points
- **Experience**: 15-25 points
- **Salary**: 25-35 points
- **Language**: 10-20 points
- **Age**: 5-15 points
- **Job Offer**: 10-25 points

**Hard Fails**: Missing critical requirements cap the maximum score
**Confidence Score**: Based on data completeness (capped at 85%)

### 3. AI Integration

- **Document Parsing**: GPT-4o-mini extracts structured data
- **Explanation Generation**: GPT-4o-mini generates human-readable recommendations
- **No AI Scoring**: AI only extracts and explains, not scores (ensures reliability)

## 🌐 Deployment

### Backend (Render/Railway)
```bash
npm run build
npm run server
```

### Frontend (Vercel)
```bash
npm run build
```

Environment variables needed:
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `CORS_ORIGIN`

## 📈 Future Enhancements

- [ ] RAG system with embedded government documents
- [ ] Email notification system
- [ ] Multi-language support
- [ ] White-label embed widget
- [ ] PDF report generation
- [ ] Payment integration for premium features
- [ ] Real-time chat support
- [ ] Mobile app

## 🛠️ Technologies Used

- **Frontend**: React 19, React Router, CSS3
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **AI**: OpenAI GPT-4o-mini
- **File Processing**: Multer, pdf-parse
- **Build Tool**: Vite

## 📝 License

This project was created for the OpenSphere Software Engineer assignment.

## 👥 Contact

For questions or support, contact: atal@opensphere.ai

---

Built with ❤️ for OpenSphere

