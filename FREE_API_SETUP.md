# 🆓 FREE API Setup Guide - Zero Cost Configuration

This project uses **100% FREE** services - no credit card required!

## Required Free API Keys

### 1. Groq API (FREE LLM)
**Cost:** FREE forever  
**Limits:** 14,400 requests/day  
**Speed:** Up to 750 tokens/second  
**Model:** Llama 3.1 70B Versatile

#### How to Get:
1. Visit: https://console.groq.com/keys
2. Sign up with Google/GitHub (no credit card)
3. Click "Create API Key"
4. Copy your key
5. Add to `.env`: `GROQ_API_KEY=gsk_...`

**Why Groq?**
- ✅ Truly free (not trial)
- ✅ No credit card required
- ✅ Fast inference
- ✅ Powerful models (Llama 3.1 70B, Mixtral 8x7B, Gemma 7B)
- ✅ JSON mode support
- ✅ 14,400 requests/day = ~600/hour

---

### 2. Travel Buddy AI Visa API (FREE)
**Cost:** FREE tier available  
**Limits:** 120 requests/month  
**Coverage:** 200+ passports, 210+ destinations  
**Data:** Real visa requirements, embassy links, eVisa portals

#### How to Get:
1. Visit: https://rapidapi.com/TravelBuddyAI/api/visa-requirement
2. Sign up on RapidAPI (free account)
3. Subscribe to **Basic Plan** (FREE - 120 requests/month)
4. Go to "Endpoints" tab
5. Copy your `X-RapidAPI-Key` from the code snippet
6. Add to `.env`:
   ```
   RAPIDAPI_KEY=your_key_here
   RAPIDAPI_HOST=visa-requirement.p.rapidapi.com
   ```

**Why Travel Buddy API?**
- ✅ Real, up-to-date visa requirements
- ✅ Official embassy links
- ✅ eVisa/eTA portal URLs
- ✅ Passport validity requirements
- ✅ Color-coded visa categories
- ✅ Exception rules (special cases)
- ✅ 120 free requests/month = ~4/day

---

## Complete `.env` File Example

```env
# MongoDB (free local installation)
MONGODB_URI=mongodb://localhost:27017/visa_evaluation

# FREE LLM - Groq (14,400 requests/day)
# Get from: https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_key_here

# FREE Visa API - Travel Buddy (120 requests/month)
# Get from: https://rapidapi.com/TravelBuddyAI/api/visa-requirement
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=visa-requirement.p.rapidapi.com

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## Free Services Used

### 1. **Groq** - AI/LLM Processing
- Resume data extraction
- Degree certificate parsing
- Visa eligibility report generation
- Profile analysis and recommendations
- **No OpenAI costs!**

### 2. **Travel Buddy API** - Visa Requirements
- Real-time visa rules
- Embassy information
- eVisa/eTA links
- Passport validity requirements
- Country-specific regulations
- **No Timatic costs!**

### 3. **MongoDB** - Database
- Free local installation
- No cloud costs
- Full-featured

### 4. **Vite + React** - Frontend
- Free and open-source
- Fast development
- No hosting costs (local)

---

## Usage Estimates

### Typical User Flow:
1. Upload resume → **1 Groq call** (extraction)
2. Upload degree → **1 Groq call** (extraction)
3. Get visa suggestions → **1 Travel Buddy call** (requirements)
4. Generate report → **1 Groq call** (analysis)
5. View results → **0 calls** (cached)

**Total per evaluation:** ~3 Groq calls + 1 Travel Buddy call

### Monthly Capacity (FREE tier):
- **Groq:** 14,400/day × 30 = 432,000 requests/month
- **Travel Buddy:** 120 requests/month

**Evaluations per month:** ~120 (limited by Travel Buddy)  
**Evaluations per day:** ~4 (with Travel Buddy API)

### Workaround for More Evaluations:
If you hit Travel Buddy limits:
- ✅ Results are **cached for 24 hours**
- ✅ Same passport-destination combo = no new API call
- ✅ System falls back to rule-based logic
- ✅ Still works, just less real-time data

---

## Alternative FREE LLM Options

If you want even more free requests or local processing:

### Option 1: Ollama (Unlimited Local)
- **Cost:** FREE (runs on your computer)
- **Limits:** None (local)
- **Speed:** Depends on your GPU/CPU
- **Setup:** Download Ollama → `ollama pull llama3.1`

### Option 2: Together AI (FREE tier)
- **Cost:** FREE tier available
- **Limits:** $25 free credits/month
- **Models:** Llama 3.1, Mistral, etc.

### Option 3: Hugging Face Inference
- **Cost:** FREE tier
- **Limits:** Rate limits apply
- **Models:** 1000s of open-source models

---

## Cost Comparison

### Our Solution (FREE):
| Service | Cost | Limit |
|---------|------|-------|
| Groq LLM | $0 | 14,400/day |
| Travel Buddy API | $0 | 120/month |
| MongoDB Local | $0 | Unlimited |
| **TOTAL** | **$0/month** | **~120 evaluations/month** |

### Traditional Paid Solution:
| Service | Cost | Limit |
|---------|------|-------|
| OpenAI GPT-4 | $0.03/request × 3 | $0.09/evaluation |
| Timatic API | ~$500/month | Unlimited |
| MongoDB Atlas | $9/month | 512MB |
| **TOTAL** | **~$510/month** | Unlimited |

**Savings: $510/month = $6,120/year** 🎉

---

## Testing Your Setup

### 1. Test Groq LLM:
```bash
cd main
npm run server
# Check logs for: "✅ Groq: Resume data extracted successfully"
```

### 2. Test Travel Buddy API:
```bash
# Upload a resume and select a country
# Check logs for: "✅ Travel Buddy API: Real visa requirements fetched"
```

### 3. Test Full Flow:
1. Open http://localhost:5174
2. Start evaluation
3. Upload documents
4. Check console logs for both API calls

---

## Troubleshooting

### "GROQ_API_KEY not set"
- ✅ Get free key from https://console.groq.com/keys
- ✅ Add to `.env` file
- ✅ Restart server

### "RAPIDAPI_KEY not set"
- ✅ Subscribe to free tier: https://rapidapi.com/TravelBuddyAI/api/visa-requirement
- ✅ Copy API key
- ✅ Add to `.env`
- ✅ Restart server

### "Rate limit exceeded"
- Groq: 14,400/day limit - unlikely to hit
- Travel Buddy: 120/month - use caching
- Solution: Results cache for 24 hours automatically

### Both APIs offline?
- System falls back to:
  - Mock data for Groq
  - Rule-based evaluation
  - Still functional, just less accurate

---

## Production Deployment (Still Free!)

### Option 1: Railway
- Deploy for FREE
- MongoDB included
- Environment variables supported

### Option 2: Render
- FREE tier available
- Auto-deploy from GitHub
- Environment variables

### Option 3: Vercel + MongoDB Atlas
- Vercel: FREE
- MongoDB Atlas: FREE tier (512MB)
- Groq + Travel Buddy: Same free keys work

---

## Summary

✅ **Groq** replaces paid OpenAI  
✅ **Travel Buddy** replaces paid Timatic  
✅ **MongoDB Local** replaces paid cloud DB  
✅ **Total Cost:** $0/month  
✅ **Capacity:** ~120 evaluations/month  
✅ **Quality:** Professional-grade results  

**Get your free API keys now and start evaluating!**
